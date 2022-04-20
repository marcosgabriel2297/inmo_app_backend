const nameModule = 'property/';
const { app: create } = require('./src/create');
const { app: update } = require('./src/update');
const { app: changeStatus } = require('./src/change-status');

module.exports = define => {
	define(nameModule + 'create', create);
	define(nameModule + 'update', update);
	define(nameModule + 'change-status', changeStatus);
};
