const crypto = require('crypto');

module.exports.getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

module.exports.generateToken = () => crypto.randomBytes(16).toString('hex');

module.exports.respondErrorMessage = (message) => ({ success: false, payload: { message } });

module.exports.respondInternalServerError = () => this.respondErrorMessage('Internal server error');
