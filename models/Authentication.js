const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Authentication = sequelize.define('authentication', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    apiKey: {
        type: DataTypes.STRING,
    },
    username: {
        type: DataTypes.STRING,
    },
    refreshToken: {
        type: DataTypes.STRING,
    },
    basicToken: {
        type: DataTypes.STRING,
    },
    accessToken: {
        type: DataTypes.STRING,
    },
    accessTokenExpires: {
        type: DataTypes.INTEGER,
    },
    accessTokenType: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.STRING,
    },
}, {
    createdAt: false,
    updatedAt: false,
});

module.exports.Authentication = Authentication;
