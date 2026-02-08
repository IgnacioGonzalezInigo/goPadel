const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const connectDB = require('./config/db.js')

const app = express();

// Conectar DB
connectDB()

// Midlleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas de prueba
app.get('/api/health', (req,res) => {
    res.json ({status: 'OK', message: 'Server funcionando'})
});

const PORT = process.env.PORT || 5000;

app.listen (PORT, () => {
    console.log(`🚀 Server corriendo en puerto ${PORT}`);
})