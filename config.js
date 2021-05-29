require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    basicToken: process.env.BASIC_TOKEN,
    apiKey: process.env.API_KEY,
};
