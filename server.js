const express = require('express');

const config = require('./config');
const { connect, syncModels } = require('./db');

const app = express();

app.use(express.json());

app.use('/api/v1/lightwave', require('./routes/api/lightwave'));

app.use('/api/v1/authentication', require('./routes/api/authentication'));

(async () => {
    try {
        await connect();

        await syncModels();
    
        app.listen(config.port, () => console.log('Listening'));
    } catch (error) {
        console.error('Failed to start app', error);
        process.exit(1);
    }
})();
