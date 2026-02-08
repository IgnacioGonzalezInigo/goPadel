const express = require('express');
const router = express.Router();

const {
    getDisponibilidad,
    crearReserva,
    getReservaById,
    listarReservasAdmin,
    cancelarReservaAdmin
} = require('../controllers/reservasController');

const { protect, admin } = require('../middleware/auth');

// Público: disponibilidad
router.get('/disponibilidad', getDisponibilidad);

// Público: crear reserva
router.post('/', crearReserva);

// Admin: listado y cancelación (antes de "/:id")
router.get('/admin/listado', protect, admin, listarReservasAdmin);
router.put('/:id/cancelar', protect, admin, cancelarReservaAdmin);

// Ver reserva por id (al final)
router.get('/:id', getReservaById);

module.exports = router;
