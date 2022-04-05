const nameModule = 'user/';
const { app: user } = require('./src/login');

module.exports = define => {
	define(nameModule + 'login', user);
};
