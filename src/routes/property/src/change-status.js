const express = require('express');

const app = express.Router();
const PropertyModel = require('../../../models/Property');
const schemaStatus = require('../../../structures/property/change-status');
const schemaId = require('../../../structures/validate-object-id');
const authLogin = require('../../../../modules/auth/auth-middleware-login');
const { messageForPropertyNotFound, messageForBadStatusRequest } = require('../../../messages/property/change-status');

const handler = async (req, res) => {

	const { id, status } = req.params;

	const [validation, validationId] = await Promise.all([schemaStatus(status), schemaId(id)]);

	if(validation.error)
		return res.status(400).json(validation);

	if(validationId.error)
		return res.status(400).json(validationId);

	try {
		const property = await PropertyModel.getById(id);

		if(!property)
			return res.status(404).json({ message: messageForPropertyNotFound(id) });

		if(property.status === status)
			return res.status(200).json({ message: messageForBadStatusRequest(status) });

		const propertyUpdated = await PropertyModel.update(id, { status });

		return res.status(200).json({ propertyUpdated: propertyUpdated.value._id, currentStatus: status });

	} catch(error) {
		return res.status(500).json(error.toString());
	}
};

app.put('/:id/:status', authLogin, handler);

module.exports = { app, handler };
