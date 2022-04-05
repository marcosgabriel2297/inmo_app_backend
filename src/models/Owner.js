const User = require('./User');

class Owner extends User {

	constructor({ city, province }) {
		super();
		this.location = { city, province };
	}

	static get collection() {
		return 'owners';
	}

	get collection() {
		return 'owners';
	}

	static instantiate(obj) {
		return new Owner(obj);
	}
}

module.exports = Owner;
