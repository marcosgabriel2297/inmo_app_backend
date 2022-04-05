const express = require('express');

const app = express();
// const UserModel = require('../../../models/User');

const handler = async (req, res) => {

	res.json('Todo ok');
};

app.post('/', handler);

module.exports = { app, handler };
