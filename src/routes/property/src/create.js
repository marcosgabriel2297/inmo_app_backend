const express = require('express');

const app = express.Router();
const OwnerModel = require('../../../models/Owner');
const InmoModel = require('../../../models/Inmo');
const PropertyModel = require('../../../models/Property');
const schemaProperty = require('../../../structures/property/create');
const authLogin = require('../../../../modules/auth/auth-middleware-login');
const { messageForUserNotFound } = require('../../../messages/property/create');

const handler = async (req, res) => {

	const validation = await schemaProperty(req.body);

	if(validation.error)
		return res.status(400).json(validation);

	try {
		const userType = req.body.owner.type === 'owners' ?
			await OwnerModel.getById(req.body.owner.id) :
			await InmoModel.getById(req.body.owner.id);

		if(!userType)
			return res.status(404).json({ message: messageForUserNotFound });

		const {
			latitude, longitude, address, neighborhood, city, province, operation, type, title, description, rooms, price, images
		} = req.body;

		const dataProperty = {
			latitude,
			longitude,
			address,
			neighborhood,
			city,
			province,
			owner: userType,
			operation,
			type,
			title,
			description,
			rooms,
			price,
			images
		};

		const property = new PropertyModel(dataProperty);

		const propertyInserted = await property.insert();

		return res.status(200).json(propertyInserted);

	} catch(error) {
		return res.status(500).json(error.toString());
	}
};

app.post('/', authLogin, handler);

module.exports = { app, handler };
