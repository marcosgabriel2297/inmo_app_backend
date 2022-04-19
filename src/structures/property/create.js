const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateSchema = require('../validateSchema');

module.exports = body => {

	const schema = Joi.object({
		latitude: Joi.number().precision(8).required(),
		longitude: Joi.number().precision(8).required(),
		address: Joi.string().max(100).required(),
		neighborhood: Joi.string().max(100).required(),
		city: Joi.string().max(100).required(),
		province: Joi.string().max(100).required(),
		owner: Joi.object({
			id: Joi.objectId().required(),
			type: Joi.string().valid('inmobiliarias', 'owners').required()
		}),
		operation: Joi.string().valid('venta', 'alquiler').required(),
		type: Joi.string().valid(
			'terreno', 'departamento', 'casa', 'oficina', 'local comercial', 'edificio comercial', 'cochera', 'PH', 'deposito'
		).required(),
		title: Joi.string().max(100).required(),
		description: Joi.string().max(300).required(),
		rooms: Joi.string().max(100).required(),
		price: Joi.number().required(),
		images: Joi.array().items(Joi.string()).required()
	});

	return validateSchema(schema, body);
};
