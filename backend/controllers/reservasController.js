const mongoose = require('mongoose');
const Reserva = require('../models/Reserva');
const Cancha = require('../models/Cancha');
const { toDateTime, addMinutes } = require('../utils/datetime');

// Helpers
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isExpired = (r, now) => r.expires_at && r.expires_at <= now;

/**
 * GET /api/reservas/disponibilidad?canchaId=...&fecha=YYYY-MM-DD&duracion=90
 * Beta:
 * - Horario default: 08:00 a 23:00
 * - Step: 30 minutos
 */
exports.getDisponibilidad = async (req, res) => {
    try {
    const { canchaId, fecha, duracion } = req.query;

    if (!canchaId || !isValidObjectId(canchaId)) {
        return res.status(400).json({ success: false, message: 'canchaId inválido' });
    }

    if (!fecha || typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ success: false, message: 'fecha inválida. Formato esperado: YYYY-MM-DD' });
    }

    const dur = Number(duracion);
    if (![60, 90, 120].includes(dur)) {
        return res.status(400).json({ success: false, message: 'duracion inválida. Valores: 60, 90, 120' });
    }

    const HORA_APERTURA = '08:00';
    const HORA_CIERRE = '23:00';
    const STEP_MIN = 30;

    const ahora = new Date();

    const diaInicio = toDateTime(fecha, '00:00');
    const diaFin = toDateTime(fecha, '23:59');

    // Traemos reservas del día para esa cancha
    const reservas = await Reserva.find({
        cancha_id: canchaId,
        inicio: { $gte: diaInicio, $lte: diaFin },
        estado: { $ne: 'cancelada' }
    }).select('inicio fin estado expires_at');

    // Filtramos vencidas (aunque TTL no las haya borrado aún)
    const reservasVigentes = reservas.filter((r) => !isExpired(r, ahora));

    const apertura = toDateTime(fecha, HORA_APERTURA);
    const cierre = toDateTime(fecha, HORA_CIERRE);

    const slots = [];

    for (let cursor = new Date(apertura); cursor < cierre; cursor = addMinutes(cursor, STEP_MIN)) {
        const slotInicio = cursor;
        const slotFin = addMinutes(slotInicio, dur);

        if (slotFin > cierre) break;

        const solapa = reservasVigentes.some((r) => r.inicio < slotFin && r.fin > slotInicio);

        slots.push({
        hora_inicio: slotInicio.toTimeString().slice(0, 5),
        hora_fin: slotFin.toTimeString().slice(0, 5),
        disponible: !solapa
        });
    }

    return res.json({
        success: true,
        canchaId,
        fecha,
        duracion: dur,
        horario_default: { apertura: HORA_APERTURA, cierre: HORA_CIERRE },
        step_minutos: STEP_MIN,
        slots
    });
    } catch (error) {
    console.error('Error en getDisponibilidad:', error);
    return res.status(500).json({
        success: false,
        message: 'Error al obtener disponibilidad',
        error: error.message
    });
    }
};

/**
 * POST /api/reservas
 * Crea una reserva (invitado o logueado).
 *
 * Body:
 * {
 *  "cancha_id": "...",
 *  "fecha": "YYYY-MM-DD",
 *  "hora_inicio": "HH:mm",
 *  "duracion_minutos": 60|90|120,
 *  "cliente": { "nombre": "...", "email":"...", "telefono":"..." },
 *  "origen": "web"|"whatsapp"|"admin"
 * }
 */
exports.crearReserva = async (req, res) => {
    try {
    const {
        cancha_id,
        fecha,
        hora_inicio,
        duracion_minutos,
        cliente,
        origen
    } = req.body;

    if (!cancha_id || !isValidObjectId(cancha_id)) {
        return res.status(400).json({ success: false, message: 'cancha_id inválido' });
    }

    if (!fecha || typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ success: false, message: 'fecha inválida. Formato esperado: YYYY-MM-DD' });
    }

    if (!hora_inicio || typeof hora_inicio !== 'string') {
        return res.status(400).json({ success: false, message: 'hora_inicio requerida (HH:mm)' });
    }

    const dur = Number(duracion_minutos);
    if (![60, 90, 120].includes(dur)) {
        return res.status(400).json({ success: false, message: 'duracion_minutos inválida. Valores: 60, 90, 120' });
    }

    if (!cliente || !cliente.nombre || !cliente.email || !cliente.telefono) {
        return res.status(400).json({ success: false, message: 'cliente inválido (nombre, email, telefono)' });
    }

    // 1) Calcular inicio/fin
    const inicio = toDateTime(fecha, hora_inicio);
    const fin = addMinutes(inicio, dur);

    // 2) Buscar cancha para calcular monto (beta simple)
    const cancha = await Cancha.findById(cancha_id);
    if (!cancha) {
        return res.status(404).json({ success: false, message: 'Cancha no encontrada' });
    }

    // Regla beta: si hora_inicio >= 18:00 => precio_noche, sino precio_dia
    const horaNum = Number(hora_inicio.split(':')[0]);
    const esNoche = horaNum >= 18;
    const monto = esNoche ? cancha.precio_noche : cancha.precio_dia;

    // 3) Validar solapamiento (ignorando canceladas y vencidas)
    const ahora = new Date();

    const reservasExistentes = await Reserva.find({
        cancha_id,
        estado: { $ne: 'cancelada' },
        inicio: { $lt: fin },
        fin: { $gt: inicio }
    }).select('inicio fin expires_at estado');

    const haySolapamiento = reservasExistentes.some((r) => !isExpired(r, ahora));
    if (haySolapamiento) {
        return res.status(409).json({
        success: false,
        message: 'El horario ya no está disponible (solapamiento)'
        });
    }

    // 4) Expiración a 5 minutos
    const expires_at = new Date(ahora.getTime() + 5 * 60 * 1000);

    // 5) Si está logueado, asociamos usuario_id (opcional)
    const usuario_id = req.user?.id ? req.user.id : null;

    const reserva = await Reserva.create({
        cancha_id,
        fecha: toDateTime(fecha, '00:00'), // guardamos el día
        hora_inicio,
        hora_fin: fin.toTimeString().slice(0, 5),
        inicio,
        fin,
        duracion_minutos: dur,
        usuario_id,
        cliente,
        monto,
        origen: origen || 'web',
        estado: 'pendiente_pago',
        estado_pago: 'pendiente',
        expires_at
    });

    return res.status(201).json({
        success: true,
        message: 'Reserva creada (pendiente de pago)',
        reserva
    });

    } catch (error) {
    console.error('Error en crearReserva:', error);
    return res.status(500).json({
        success: false,
        message: 'Error al crear reserva',
        error: error.message
    });
    }
};

/**
 * GET /api/reservas/:id
 * Obtener una reserva por ID (para panel/admin o confirmaciones)
 */
exports.getReservaById = async (req, res) => {
    try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const reserva = await Reserva.findById(id).populate('cancha_id', 'nombre tipo techada');
    if (!reserva) {
        return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    return res.json({ success: true, reserva });
    } catch (error) {
    console.error('Error en getReservaById:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reserva', error: error.message });
    }
};

/**
 * GET /api/reservas/admin/listado?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * (Admin) Lista reservas por rango (simple para panel)
 */
exports.listarReservasAdmin = async (req, res) => {
    try {
    const { desde, hasta } = req.query;

    let filtro = {};

    if (desde && /^\d{4}-\d{2}-\d{2}$/.test(desde)) {
        filtro.inicio = { ...(filtro.inicio || {}), $gte: toDateTime(desde, '00:00') };
    }
    if (hasta && /^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
        filtro.inicio = { ...(filtro.inicio || {}), $lte: toDateTime(hasta, '23:59') };
    }

    const reservas = await Reserva.find(filtro)
        .sort({ inicio: 1 })
        .populate('cancha_id', 'nombre')
        .select('-__v');

    return res.json({ success: true, total: reservas.length, reservas });
    } catch (error) {
    console.error('Error en listarReservasAdmin:', error);
    return res.status(500).json({ success: false, message: 'Error al listar reservas', error: error.message });
    }
};

/**
 * PUT /api/reservas/:id/cancelar
 * (Admin) Cancela una reserva (clima, mantenimiento, etc.)
 */
exports.cancelarReservaAdmin = async (req, res) => {
    try {
    const { id } = req.params;
    const { notas } = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const reserva = await Reserva.findById(id);
    if (!reserva) {
        return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    reserva.estado = 'cancelada';
    reserva.estado_pago = 'cancelado';
    reserva.notas = notas || reserva.notas || '';
    reserva.expires_at = null;

    await reserva.save();

    return res.json({ success: true, message: 'Reserva cancelada', reserva });
    } catch (error) {
    console.error('Error en cancelarReservaAdmin:', error);
    return res.status(500).json({ success: false, message: 'Error al cancelar reserva', error: error.message });
    }
};
