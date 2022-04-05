const Mongo = require('../database/Mongo');

const mongo = new Mongo();

module.exports = class Model {

	static get collection() {
		return 'default';
	}

	get collection() {
		return 'default';
	}

	static get statuses() {
		return {
			active: 'active',
			inactive: 'inactive'
		};
	}

	async insert() {

		const db = await mongo.connect();

		try {
			return db.collection(this.collection).insertOne(this);
		} catch(error) {
			return error.message;
		}
	}
};
