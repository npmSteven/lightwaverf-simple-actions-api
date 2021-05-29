const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const jwtDecode = require('jwt-decode');

const config = require('./config');

const db = require('./db.json');

const app = express();

// Middleware for JSON
app.use(express.json());

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const getJWT = async () => {
    const currentTimestamp = getCurrentTimestamp();
    // If the current token is there and the token has not yet expired
    // Then we want to return the token with type
    if (db.access_token && db.token_type && currentTimestamp <= db.token_expires) {
        return `${db.token_type} ${db.access_token}`;
    } else {
        await generateJWT();
        return `${db.token_type} ${db.access_token}`;
    }
};

const updateDb = async (prop, value) => {
    try {
        const path = './db.json';
        const foundDb = await fs.readFile(path);
        const parsedDb = JSON.parse(foundDb);
        parsedDb[prop] = value;
        await fs.writeFile(path, JSON.stringify(parsedDb));
    } catch (error) {
        console.error('ERROR - updateDb():', error);
    }
};

const generateJWT = async () => {
    try {
        const response = await fetch('https://auth.lightwaverf.com/token', {
            method: 'POST',
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: db.refresh_token,
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
        return payload;
    } catch (error) {
        console.error('ERROR - server.js - generateJWT():', error);
    }
};

const getStructureIds = async () => {
    const jwt = await getJWT();
    const response = await fetch('https://publicapi.lightwaverf.com/v1/structures', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': jwt,
        }
    });
    const payload = await response.json();
    return payload.structures;
};

const getStructure = async (strucutreId) => {
    const jwt = await getJWT();
    const response = await fetch(`https://publicapi.lightwaverf.com/v1/structure/${strucutreId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': jwt,
        }
    });
    const payload = await response.json();
    return payload;
};

const getAllDevices = async () => {
    const structureIds = await getStructureIds();
    const structures = await Promise.all(
        structureIds.map(structureId => {
            return getStructure(structureId);
        }),
    );
    const devices = structures.reduce((acc, structure) => {
        if (structure.devices.length >= 1) {
            return [...acc, ...structure.devices];
        }
        return acc;
    }, []);
    return devices;
};

const getAllFeatureSets = async () => {
    const devices = await getAllDevices();
    const featureSets = devices.reduce((acc, device) => {
        if (device.featureSets.length >= 1) {
            return [...acc, ...device.featureSets];
        }
        return acc;
    }, []);
    return featureSets;
}

const findFeatureSet = async (featureSetName) => {
    const featureSets = await getAllFeatureSets();
    const foundFeatureSet = await featureSets.find(({ name }) => name.toLowerCase() === featureSetName.toLowerCase());
    return foundFeatureSet;
};

const featureWrite = async (featureId, value) => {
    const jwt = await getJWT();
    const response = await fetch(`https://publicapi.lightwaverf.com/v1/feature/${featureId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': jwt,
        },
        body: JSON.stringify({
            value,
        }),
    });
    const payload = await response.json();
    return payload;
};

app.get('/featureWrite', async (req, res) => {
    if (req.query.apiKey !== config.apiKey) return res.status(401).json({ success: false, message: 'Invalid api key' });
    if (!req.query.featureSetName) return res.status(400).json({ success: false, message: 'featureSetName param not provided' });
    if (!req.query.featureType) return res.status(400).json({ success: false, message: 'featureType param not provided' });
    if (!req.query.value) return res.status(400).json({ success: false, message: 'value param not provided' });
    const { featureSetName, featureType, value } = req.query;

    const featureSet = await findFeatureSet(featureSetName);
    if (!featureSet) return res.status(404).json({ success: false, message: 'Can not find a feature set with that name' });

    const feature = featureSet.features.find(({ type }) => type.toLowerCase() === featureType.toLocaleLowerCase());
    if (!feature) return res.status(404).json({ success: false, message: 'Can not find that type on the feature set' });

    const { featureId } = feature;

    if (!Number.isNaN(value)) {
        const parsedValue = parseInt(value);
        await featureWrite(featureId, parsedValue);
        return res.json({ success: true, message: `${featureSetName} set to ${parsedValue}` });
    } else {
        await featureWrite(featureId, value);
        return res.json({ success: true, message: `${featureSetName} set to ${value}` });
    }
});

app.listen(config.port, () => console.log('Listening'));
