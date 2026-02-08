// Configuracion conexion DB
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ MongoDB conectado');
    }
    catch (error) {
        console.log('❌ Error MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;