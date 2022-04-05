const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express.Router();
const OwnerModel = require('../../../models/Owner');
const InmoModel = require('../../../models/Inmo');
const schemaLogin = require('../../../structures/user/login');
const {
	messageForUserNotFound,
	messageForIncorrectPassword,
	messageForLoginSuccess
} = require('../../../messages/user/login');

const handler = async (req, res) => {

	const validation = await schemaLogin(req.body);

	if(validation.error)
		return res.status(400).json(validation);

	const { email, password } = req.body;

	let user;
	try {

		const [owner, inmobiliaria] = await Promise.all([OwnerModel.getOne({ email }), InmoModel.getOne({ email })]);

		user = owner || inmobiliaria;

		if(user === null)
			return res.status(404).json({ message: messageForUserNotFound() });

		if(!(await bcrypt.compare(password, user.password)))
			return res.status(400).json({ message: messageForIncorrectPassword() });

		const enc = {
			id: user._id.toString(),
			email,
			name: user.name,
			status: user.status,
			password: user.password,
			linkWhatsapp: user.link_whatsapp,
			posts: user.posts,
			location: user.location,
			...user.matricula && { matricula: user.matricula }
		};

		const response = {
			message: messageForLoginSuccess(),
			token: jwt.sign(enc, process.env.KEY_PRELOGIN),
			code: 2
		};

		return res.status(200).json(response);

	} catch(error) {
		return res.status(500).json(error.toString());
	}
};

app.post('/', handler);

module.exports = { app, handler };
