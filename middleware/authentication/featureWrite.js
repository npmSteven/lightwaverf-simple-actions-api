const Joi = require('joi');
const { respondErrorMessage } = require('../../utils');

const featureWriteValidationSchema = Joi.object({
    featureSetName: Joi.string().required(),
    featureType: Joi.string().required(),
    value: Joi.string().required(),
    apiKey: Joi.string().required(),
    username: Joi.string().required(),
});

module.exports.featureWriteValidation = (req, res, next) => {
    const { error, value } = featureWriteValidationSchema.validate(req.query);
    if (error) return res.status(400).json(respondErrorMessage(error.message));
    req.value = value;
    next();
};
