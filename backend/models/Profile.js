const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE' // Delete profile if user is deleted
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    budget_range: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hiring_preference: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    languages: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    experience_level: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    skills: {
        type: DataTypes.JSON, // Array of strings
        allowNull: true,
    },
    experience: {
        type: DataTypes.JSON, // Array of objects
        allowNull: true,
    },
    portfolio: {
        type: DataTypes.JSON, // Array of objects
        allowNull: true,
    }
}, {
    tableName: 'user_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Associations
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Profile;
