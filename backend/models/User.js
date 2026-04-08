const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('client', 'freelancer', 'admin'),
        allowNull: false,
    },
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reputation_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    }
}, {
    tableName: 'users',
    timestamps: true, // This will automatically manage created_at and updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;
