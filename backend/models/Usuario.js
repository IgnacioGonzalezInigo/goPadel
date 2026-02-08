// backend/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
    },
    email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
    type: String,
    required: [true, 'El password es requerido'],
    minlength: 6,
    select: false
    },
    rol: {
    type: String,
    enum: ['admin', 'cliente'],
    default: 'cliente'
    },
    telefono: {
    type: String,
    default: ''
    }
}, {
    timestamps: true
});

// Hash password antes de guardar
usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar password
usuarioSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);