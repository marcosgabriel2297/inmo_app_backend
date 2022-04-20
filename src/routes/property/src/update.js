const express = require('express');

const app = express.Router();
const OwnerModel = require('../../../models/Owner');
const InmoModel = require('../../../models/Inmo');
const PropertyModel = require('../../../models/Property');
const schemaProperty = require('../../../structures/property/update');
const authLogin = require('../../../../modules/auth/auth-middleware-login');
const { messageForUserNotFound } = require('../../../messages/property/update');

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
			...latitude && { latitude },
			...longitude && { longitude },
			...address && { address },
			...neighborhood && { neighborhood },
			...city && { city },
			...province && { province },
			owner: userType,
			...operation && { operation },
			...type && { type },
			...title && { title },
			...description && { description },
			...rooms && { rooms },
			...price && { price },
			...images && { images }
		};

		const propertyInserted = await PropertyModel.update(req.params.id, dataProperty);

		return res.status(200).json(propertyInserted);

	} catch(error) {
		return res.status(500).json(error.toString());
	}
};

app.put('/:id', authLogin, handler);

module.exports = { app, handler };
