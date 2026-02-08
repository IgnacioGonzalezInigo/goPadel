const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
    const { nombre, email, password, telefono } = req.body;

    // Validar que lleguen los datos
    if (!nombre || !email || !password) {
        return res.status(400).json({ 
        message: 'Por favor proporciona nombre, email y password' 
        });
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
        return res.status(400).json({ 
        message: 'El email ya está registrado' 
        });
    }

    // Crear usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        telefono: telefono || ''
    });

    // Generar token
    const token = generarToken(usuario._id);

    res.status(201).json({
        success: true,
        token,
        usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
        }
    });
    } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
        message: 'Error al registrar usuario',
        error: error.message 
    });
    }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
    console.log('📥 Login request recibido:', { email: req.body.email });

    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
        return res.status(400).json({ 
        message: 'Por favor proporciona email y password' 
        });
    }

    // Buscar usuario (incluyendo password)
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario) {
        console.log('❌ Usuario no encontrado:', email);
        return res.status(401).json({ 
        message: 'Credenciales inválidas' 
        });
    }

    // Verificar password
    const passwordCorrecto = await usuario.comparePassword(password);

    if (!passwordCorrecto) {
        console.log('❌ Password incorrecto para:', email);
        return res.status(401).json({ 
        message: 'Credenciales inválidas' 
        });
    }

    // Generar token
    const token = generarToken(usuario._id);

    console.log('✅ Login exitoso:', usuario.email);

    res.json({
        success: true,
        token,
        usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
        }
    });
    } catch (error) {
    console.error('🔴 Error en login:', error);
    res.status(500).json({ 
        message: 'Error al iniciar sesión',
        error: error.message 
    });
    }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
    const usuario = await Usuario.findById(req.user.id);

    res.json({
        success: true,
        usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono
        }
    });
    } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
    }
};