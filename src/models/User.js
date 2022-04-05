const Model = require('../../modules/class/Model');

class Example extends Model {

	constructor({ name, lastname }) {
		super();
		this.name = name;
		this.lastname = lastname;
	}

	static get collection() {
		return 'examples';
	}

	get collection() {
		return 'examples';
	}

	static instantiate(obj) {
		return new Example(obj);
	}
}

module.exports = Example;
