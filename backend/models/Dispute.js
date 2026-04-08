const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Job = require('./Job');

const Dispute = sequelize.define('Dispute', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Job,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    initiator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('open', 'resolved'),
        defaultValue: 'open',
    }
}, {
    tableName: 'disputes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Associations
Job.hasOne(Dispute, { foreignKey: 'job_id', as: 'dispute' });
Dispute.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

User.hasMany(Dispute, { foreignKey: 'initiator_id', as: 'initiated_disputes' });
Dispute.belongsTo(User, { foreignKey: 'initiator_id', as: 'initiator' });

module.exports = Dispute;
