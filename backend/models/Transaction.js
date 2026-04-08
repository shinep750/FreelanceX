const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Job = require('./Job');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Job,
            key: 'id'
        }
    },
    actor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('funded', 'released', 'refunded'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false
    },
    transaction_hash: {
        type: DataTypes.STRING,
        allowNull: true // True because some might be backend relayed pending fetching, or not available immediately
    }
}, {
    tableName: 'Transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations
Job.hasMany(Transaction, { foreignKey: 'job_id', as: 'transactions' });
Transaction.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

User.hasMany(Transaction, { foreignKey: 'actor_id', as: 'initiated_transactions' });
Transaction.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' });

module.exports = Transaction;
