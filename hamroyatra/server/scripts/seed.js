const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createDbAndSeed = async () => {
    // 1. Create Database if not exists
    const adminClient = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres',
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    });

    try {
        await adminClient.connect();
        const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname='${process.env.DB_NAME}'`);
        if (res.rowCount === 0) {
            await adminClient.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`Database "${process.env.DB_NAME}" Created.`);
        }
        await adminClient.end();

        // 2. Sync Models and Seed
        const { sequelize } = require('../config/db');
        const HamroTraveller = require('../models/Traveller');
        const HamroAgent = require('../models/Agent');

        await sequelize.sync({ force: true });
        console.log('Database Synced (HamroYatraPvt)');

        const p1 = await bcrypt.hash('traveller@1', 12);
        const p2 = await bcrypt.hash('traveller@2', 12);

        // Seed Travellers
        await HamroTraveller.bulkCreate([
            { fullName: 'Traveller One', email: 'traveller1@gmail.com', password: p1, contactNumber: '+977-9800000001' },
            { fullName: 'Traveller Two', email: 'traveller2@gmail.com', password: p2, contactNumber: '+977-9800000002' }
        ]);

        // Seed Agents
        await HamroAgent.bulkCreate([
            { fullName: 'Agent One', email: 'agent1@gmail.com', password: p1, location: 'Kathmandu', phoneNo: '+977-01-4444444', companyName: 'Hamro Travels Pvt' },
            { fullName: 'Agent Two', email: 'agent2@gmail.com', password: p2, location: 'Pokhara', phoneNo: '+977-061-555555', companyName: 'Yatra Experts' }
        ]);

        console.log('Seed Success:');
        console.log('- traveller1@gmail.com / traveller@1');
        console.log('- agent1@gmail.com / traveller@1');
        
        process.exit(0);
    } catch (err) {
        console.error('Seeding Multi-Step Error:', err.message);
        process.exit(1);
    }
};

createDbAndSeed();
