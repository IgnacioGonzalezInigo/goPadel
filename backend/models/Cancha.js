const mongoose = require('mongoose');

const canchaSchema = new mongoose.Schema({
    nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
    },
    tipo: {
    type: String,
    enum: ['techada', 'descubierta'],
    default: 'descubierta'
    },
    techada: {
    type: Boolean,
    default: false
    },
    precio_dia: {
    type: Number,
    required: [true, 'El precio de día es requerido'],
    min: 0
    },
    precio_noche: {
    type: Number,
    required: [true, 'El precio de noche es requerido'],
    min: 0
    },
    fotos: [{
    type: String
    }],
    descripcion: {
    type: String,
    default: ''
    },
    activa: {
    type: Boolean,
    default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cancha', canchaSchema);