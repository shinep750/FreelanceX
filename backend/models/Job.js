const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled', 'disputed', 'refunded'),
        defaultValue: 'open',
    }
}, {
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Associations
User.hasMany(Job, { foreignKey: 'client_id', as: 'posted_jobs' });
Job.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

module.exports = Job;
