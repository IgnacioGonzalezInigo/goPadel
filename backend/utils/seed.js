const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Usuario = require('../models/Usuario');
const Cancha = require('../models/Cancha');

dotenv.config();

const connectDB = require('../config/db');

const seedData = async () => {
    try {
    await connectDB();

    console.log('🗑️  Limpiando base de datos...');
    await Usuario.deleteMany({});
    await Cancha.deleteMany({});

    console.log('👤 Creando usuario admin...');
    const admin = await Usuario.create({
        nombre: 'Admin',
        email: 'admin@padelbook.com',
        password: 'admin123',
        rol: 'admin',
        telefono: '+541112345678'
    });

    console.log('🎾 Creando canchas de ejemplo...');
    const canchas = await Cancha.insertMany([
        {
        nombre: 'Cancha 1',
        tipo: 'techada',
        techada: true,
        precio_dia: 12000,
        precio_noche: 15000,
        descripcion: 'Cancha techada con iluminación LED profesional',
        fotos: [],
        activa: true
        },
        {
        nombre: 'Cancha 2',
        tipo: 'descubierta',
        techada: false,
        precio_dia: 10000,
        precio_noche: 13000,
        descripcion: 'Cancha al aire libre con césped sintético de última generación',
        fotos: [],
        activa: true
        },
        {
        nombre: 'Cancha 3',
        tipo: 'techada',
        techada: true,
        precio_dia: 12000,
        precio_noche: 15000,
        descripcion: 'Cancha techada climatizada',
        fotos: [],
        activa: true
        }
    ]);

    console.log('');
    console.log('✅ Seed completado exitosamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   - ${canchas.length} canchas creadas`);
    console.log(`   - 1 usuario admin creado`);
    console.log('');
    console.log('🔑 Credenciales de admin:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log('');

    process.exit(0);
    } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
    }
};

seedData();