const express = require('express');
const uuid = require('uuid');

const { Authentication } = require('../../models/Authentication');
const { generateToken, getCurrentTimestamp } = require('../../utils');

const router = express.Router();

router.post('/', async (req, res) => {
    if (
        !req.body.basicToken ||
        !req.body.refreshToken ||
        !req.body.username
    ) return res.status(400).json({ success: false, payload: { message: 'Invalid body needs basicToken, username and refreshToken' } });
    const {
        basicToken,
        refreshToken,
        username,
    } = req.body;

    const foundAuth = await Authentication.findOne({ where: { username } });
    if (foundAuth) return res.status(401).json({ success: false, payload: { message: 'Username already exists' } });

    const auth = await Authentication.create({
        id: uuid.v4(),
        basicToken,
        refreshToken,
        username,
        apiKey: generateToken(),
        createdAt: getCurrentTimestamp(),
    });

    res.json({ success: true, payload: { ...auth.dataValues, message: '[IMPORTANT]: Save both username and apiKey as this will be the only way to update your information, incase you incorrectly entered the wrong basicToken or refreshToken' } });
});

module.exports = router;
