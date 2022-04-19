const nameModule = 'property/';
const { app: create } = require('./src/create');
const { app: update } = require('./src/update');

module.exports = define => {
	define(nameModule + 'create', create);
	define(nameModule + 'update', update);
};
