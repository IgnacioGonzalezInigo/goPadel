const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.protect = async (req, res, next) => {
    try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado - Token no encontrado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Usuario.findById(decoded.id).select('-password');

        if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    } catch (error) {
    console.error('Error en middleware auth:', error);
    res.status(500).json({ message: 'Error en autenticación' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
    next();
    } else {
    res.status(403).json({ message: 'Acceso denegado - Solo administradores' });
    }
};