const express = require('express');

const { findFeatureSet, featureWrite } = require('../../services/lightwave');
const { featureWriteValidation } = require('../../middleware/authentication/featureWrite');
const { respondInternalServerError, respondErrorMessage } = require('../../utils');
const { Authentication } = require('../../models/Authentication');
const { getJWT } = require('../../services/authentication');

const router = express.Router();

router.get('/featureWrite', featureWriteValidation, async (req, res) => {
    try {
        const { featureSetName, featureType, value, apiKey, username } = req.value;

        const authUser = await Authentication.findOne({ where: { username, apiKey } });
        if (!authUser) return res.status(401).json(respondErrorMessage('Username or api key is invalid'));

        const jwt = await getJWT({ username, apiKey });
        const { featureSet, featureSetNames } = await findFeatureSet({ featureSetName, jwt });
        if (!featureSet) return res.status(404).json(respondErrorMessage(`Can not find a feature set with that name try [${featureSetNames.join(', ')}]`));

        const feature = featureSet.features.find(({ type }) => type.toLowerCase() === featureType.toLocaleLowerCase());
        const featureTypes = featureSet.features.filter(({ writable }) => writable).map(({ type }) => type);
        if (!feature) return res.status(404).json(respondErrorMessage(`Can not find that type on the feature set try [${featureTypes.join(', ')}]`));

        const { featureId } = feature;

        if (!Number.isNaN(value)) {
            const parsedValue = parseInt(value);
            await featureWrite({ featureId, value: parsedValue, jwt });
            return res.json({ success: true, payload: { message: `${featureSetName} set to ${parsedValue}` } });
        } else {
            await featureWrite({ featureId, value, jwt });
            return res.json({ success: true, payload: { message: `${featureSetName} set to ${value}` } });
        }
    } catch (error) {
        console.error('ERROR - server.js - /featureWrite', error);
        return res.status(500).json(respondInternalServerError());
    }
});

module.exports = router;
