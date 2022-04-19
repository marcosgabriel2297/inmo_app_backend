let app = null;
const user = require('./user');
const property = require('./property');

const defineRoute = (ruta, requests) => {
	const baseRequest = '/api/';
	const route = baseRequest + ruta;

	app.use(route, requests);
};

module.exports = aplication => {
	app = aplication;

	user(defineRoute);
	property(defineRoute);
};
