const express = require('express');

const router = express.Router();

router.get('/featureWrite', async (req, res) => {
    try {
        // TODO: Implement JOI
        if (req.query.apiKey !== config.apiKey) return res.status(401).json({ success: false, payload: { message: 'Invalid api key' } });
        if (!req.query.featureSetName) return res.status(400).json({ success: false, payload: { message: 'featureSetName param not provided' } });
        if (!req.query.featureType) return res.status(400).json({ success: false, payload: { message: 'featureType param not provided' } });
        if (!req.query.value) return res.status(400).json({ success: false, payload: { message: 'value param not provided' } });
        const { featureSetName, featureType, value } = req.query;

        const featureSet = await findFeatureSet(featureSetName);
        if (!featureSet) return res.status(404).json({ success: false, payload: { message: 'Can not find a feature set with that name' } });

        const feature = featureSet.features.find(({ type }) => type.toLowerCase() === featureType.toLocaleLowerCase());
        if (!feature) return res.status(404).json({ success: false, payload: { message: 'Can not find that type on the feature set' } });

        const { featureId } = feature;

        if (!Number.isNaN(value)) {
            const parsedValue = parseInt(value);
            await featureWrite(featureId, parsedValue);
            return res.json({ success: true, payload: { message: `${featureSetName} set to ${parsedValue}` } });
        } else {
            await featureWrite(featureId, value);
            return res.json({ success: true, payload: { message: `${featureSetName} set to ${value}` } });
        }
    } catch (error) {
        console.error('ERROR - server.js - /featureWrite', error);
        return res.status(500).json({ success: false, payload: { message: 'Internal server error' } });
    }
});

module.exports = router;
