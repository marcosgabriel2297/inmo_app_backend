const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateSchema = require('../validateSchema');

module.exports = body => {

	const schema = Joi.string().valid('active', 'inactive', 'deleted');

	return validateSchema(schema, body);
};
