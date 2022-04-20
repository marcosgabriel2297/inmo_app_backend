const express = require('express');

const app = express.Router();
const PropertyModel = require('../../../models/Property');
const schemaProperty = require('../../../structures/property/create');
const authLogin = require('../../../../modules/auth/auth-middleware-login');
const { messageForUserNotFound } = require('../../../messages/property/create');

const handler = async (req, res) => {

};

app.post('/', authLogin, handler);

module.exports = { app, handler };
