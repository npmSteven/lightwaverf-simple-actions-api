require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    db: {
        url: process.env.JAWSDB_URL,
    }
};
