const fetch = require('node-fetch');

module.exports.getStructureIds = async ({ jwt }) => {
    try {
        const response = await fetch('https://publicapi.lightwaverf.com/v1/structures', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt,
            }
        });
        const payload = await response.json();
        return payload.structures;
    } catch (error) {
        console.error('ERROR - server.js - getStructureIds():', error);
        throw error;
    }
};

module.exports.getStructure = async ({ structureId, jwt }) => {
    try {
        const response = await fetch(`https://publicapi.lightwaverf.com/v1/structure/${structureId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt,
            }
        });
        const payload = await response.json();
        return payload;
    } catch (error) {
        console.error('ERROR - server.js - getStructure():', error);
        throw error;
    }
};

module.exports.getAllDevices = async ({ jwt }) => {
    try {
        const structureIds = await this.getStructureIds({ jwt });
        const structures = await Promise.all(
            structureIds.map(structureId => {
                return this.getStructure({ structureId, jwt });
            }),
        );
        const devices = structures.reduce((acc, structure) => {
            if (structure.devices.length >= 1) {
                return [...acc, ...structure.devices];
            }
            return acc;
        }, []);
        return devices;
    } catch (error) {
        console.error('ERROR - server.js - getAllDevices():', error);
        throw error;
    }
};

module.exports.getAllFeatureSets = async ({ jwt }) => {
    try {
        const devices = await this.getAllDevices({ jwt });
        const featureSets = devices.reduce((acc, device) => {
            if (device.featureSets.length >= 1) {
                return [...acc, ...device.featureSets];
            }
            return acc;
        }, []);
        return featureSets;
    } catch (error) {
        console.error('ERROR - server.js - getAllFeatureSets():', error);
        throw error;
    }
}

module.exports.findFeatureSet = async ({ featureSetName, jwt }) => {
    try {
        const featureSets = await this.getAllFeatureSets({ jwt });
        const featureSetNames = featureSets.map(({ name }) => name);
        const featureSet = await featureSets.find(({ name }) => name.toLowerCase() === featureSetName.toLowerCase());
        return { featureSet, featureSetNames};
    } catch (error) {
        console.error('ERROR - server.js - findFeatureSet():', error);
        throw error;
    }
};

module.exports.featureWrite = async ({ featureId, value, jwt }) => {
    try {
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
    } catch (error) {
        console.error('ERROR - server.js - featureWrite():', error);
        throw error;
    }
};