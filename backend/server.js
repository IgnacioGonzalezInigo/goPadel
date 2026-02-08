const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const connectDB = require('./config/db');

// Inicializar express
const app = express();

// Conectar a base de datos
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
});

// Rutas
app.get('/', (req, res) => {
    res.json({ 
    message: 'API de PadelBook funcionando',
    version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
    status: 'OK', 
    message: 'Server funcionando correctamente',
    timestamp: new Date().toISOString()
    });
});

// Rutas de autenticación
app.use('/api/auth', require('./routes/auth'));

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.path
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('💥 Error:', err);
    res.status(err.status || 500).json({ 
    message: err.message || 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server corriendo en puerto ${PORT}`);
    console.log(`📝 Modo: ${process.env.NODE_ENV}`);
});