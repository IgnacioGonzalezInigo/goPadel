const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    cancha_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cancha',
        required: true
    },

    // Fecha del turno (solo día, útil para filtros y UI)
    fecha: {
        type: Date,
        required: true
    },

    // Horarios en formato string (para mostrar)
    hora_inicio: {
        type: String,
        required: true
    },
    hora_fin: {
        type: String,
        required: true
    },

    // 🔑 Fechas completas (source of truth para lógica)
    inicio: {
        type: Date,
        required: true
    },
    fin: {
        type: Date,
        required: true
    },

    duracion_minutos: {
        type: Number,
        default: 90
    },

    // Si el usuario está logueado, podemos asociarlo (opcional)
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null
    },

    cliente: {
        nombre: { type: String, required: true },
        email: { type: String, required: true },
        telefono: { type: String, required: true }
    },

    monto: {
        type: Number,
        required: true
    },

    estado_pago: {
        type: String,
        enum: ['pendiente', 'aprobado', 'rechazado', 'cancelado'],
        default: 'pendiente'
    },

    mercadopago_payment_id: String,
    mercadopago_preference_id: String,

    origen: {
        type: String,
        enum: ['web', 'whatsapp', 'admin'],
        default: 'web'
    },

    estado: {
        type: String,
        enum: ['pendiente_pago', 'confirmada', 'cancelada', 'completada'],
        default: 'pendiente_pago'
    },

    // ⏱️ Expira si no se paga
    expires_at: {
        type: Date,
        default: null
    },

    recordatorio_enviado: {
        type: Boolean,
        default: false
    },

    notas: String

}, { timestamps: true });

// 🔍 Índices
reservaSchema.index({ fecha: 1, cancha_id: 1 });
reservaSchema.index({ estado: 1 });
reservaSchema.index({ 'cliente.email': 1 });

// 🔑 Índice para solapamientos
reservaSchema.index({ cancha_id: 1, inicio: 1, fin: 1 });

// ⏱️ TTL: Mongo borra el doc cuando llega expires_at
reservaSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reserva', reservaSchema);
