const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Authentication = sequelize.define('authentication', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    apiKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    basicToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accessToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accessTokenExpires: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    accessTokenType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.STRING,
    },
}, {
    createdAt: false,
    updatedAt: false,
});

module.exports.Authentication = Authentication;
