const nameModule = 'user/';
const { app: user } = require('./src/create');

module.exports = define => {
	define(nameModule + 'create', user);
};
