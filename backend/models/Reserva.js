const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    cancha_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cancha',
    required: true
    },
    fecha: {
    type: Date,
    required: true
    },
    hora_inicio: {
    type: String,
    required: true
    },
    hora_fin: {
    type: String,
    required: true
    },
    duracion_minutos: {
    type: Number,
    default: 90
    },
    cliente: {
    nombre: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    telefono: { 
        type: String, 
        required: true 
    }
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
    recordatorio_enviado: {
    type: Boolean,
    default: false
    },
    notas: String
}, {
    timestamps: true
});

// Índices para búsquedas rápidas
reservaSchema.index({ fecha: 1, cancha_id: 1 });
reservaSchema.index({ estado: 1 });
reservaSchema.index({ 'cliente.email': 1 });

module.exports = mongoose.model('Reserva', reservaSchema);