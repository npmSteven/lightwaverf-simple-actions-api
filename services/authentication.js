const fetch = require('node-fetch');

const generateJWT = async () => {
    try {
        const response = await fetch('https://auth.lightwaverf.com/token', {
            method: 'POST',
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `basic ${config.basicToken}`,
            }
        });
        const payload = await response.json();
        await updateDb('access_token', payload.access_token);
        await updateDb('refresh_token', payload.refresh_token);
        await updateDb('token_type', payload.token_type);
        const decoded = jwtDecode(payload.access_token);
        await updateDb('token_expires', decoded.exp);
    } catch (error) {
        console.error('ERROR - server.js - generateJWT():', error);
        throw error;
    }
};

module.exports.getJWT = async () => {
    const currentTimestamp = getCurrentTimestamp();
    if (
        (access_token && token_type && token_expires) &&
        currentTimestamp <= token_expires
    ) {
        return `${token_type} ${access_token}`;
    }
    await generateJWT();
    return `${token_type} ${access_token}`;
};
