const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateSchema = require('../validateSchema');

module.exports = body => {

	const schema = Joi.object({
		latitude: Joi.number().precision(8).optional(),
		longitude: Joi.number().precision(8).optional(),
		address: Joi.string().max(100).optional(),
		neighborhood: Joi.string().max(100).optional(),
		city: Joi.string().max(100).optional(),
		province: Joi.string().max(100).optional(),
		owner: Joi.object({
			id: Joi.objectId().required(),
			type: Joi.string().valid('inmobiliaria', 'owner').optional()
		}),
		operation: Joi.string().valid('venta', 'alquiler').optional(),
		type: Joi.string().valid(
			'terreno', 'departamento', 'casa', 'oficina', 'local comercial', 'edificio comercial', 'cochera', 'PH', 'deposito'
		).optional(),
		title: Joi.string().max(100).optional(),
		description: Joi.string().max(300).optional(),
		rooms: Joi.string().max(100).optional(),
		price: Joi.number().optional(),
		images: Joi.array().items(Joi.string()).optional()
	});

	return validateSchema(schema, body);
};
