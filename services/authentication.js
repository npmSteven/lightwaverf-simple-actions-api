const { default: jwtDecode, InvalidTokenError } = require('jwt-decode');
const fetch = require('node-fetch');
const { Authentication } = require('../models/Authentication');

const { getCurrentTimestamp } = require('../utils');

const generateJWT = async ({authUser}) => {
    try {
        const response = await fetch('https://auth.lightwaverf.com/token', {
            method: 'POST',
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: authUser.refreshToken,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `basic ${authUser.basicToken}`,
            }
        });
        const payload = await response.json();
        const decoded = jwtDecode(payload.access_token);
        const {
            token_type,
            refresh_token,
            access_token,
        } = payload;
        return {
            refreshToken: refresh_token,
            accessToken: access_token,
            accessTokenExpires: decoded.exp,
            accessTokenType: token_type,
        };
    } catch (error) {
        console.error('ERROR - server.js - generateJWT():', error);
        throw error;
    }
};

module.exports.getJWT = async ({ username, apiKey }) => {
    try {
        const authUser = await Authentication.findOne({ where: { username, apiKey } });
        if (!authUser) return null;
    
        const currentTimestamp = getCurrentTimestamp();
        if (
            (authUser.accessToken && authUser.accessToken && authUser.accessTokenType && authUser.accessTokenExpires) &&
            currentTimestamp <= authUser
        ) {
            return `${authUser.accessTokenType} ${authUser.accessToken}`;
        }
        const payload = await generateJWT({authUser});
        authUser.update({ ...payload });
        return `${payload.accessTokenType} ${payload.accessToken}`;
    } catch (error) {
        console.error('ERROR - getJWT():', error);
        throw error;
    }
};
