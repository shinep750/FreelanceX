const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
    }
);

// Test the connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database Successfully Connected');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = { sequelize, connectDB };
