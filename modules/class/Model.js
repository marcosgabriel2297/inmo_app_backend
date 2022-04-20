const mongodb = require('mongodb');
const mongo = require('../database/Mongo');

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
			inactive: 'inactive',
			deleted: 'deleted'
		};
	}

	async insert() {

		try {

			const entityInserted = await mongo.collection(this.collection).insertOne(this);

			return entityInserted;
		} catch(error) {
			return error;
		}
	}

	static async getOne(params = {}) {
		try {
			const getData = await mongo.collection(this.collection).findOne(params);

			return getData;
		} catch(error) {
			return error;
		}
	}

	static async get(params = {}) {

		try {
			const getData = await mongo.collection(this.collection).find(params).toArray();

			return getData;
		} catch(error) {
			return error;
		}
	}

	static async getOr(filters = {}) {

		const formatFilters = Object.entries(filters).reduce((filterAcum, filter) => {

			filterAcum.push({ [filter[0]]: filter[1] });
			return filterAcum;
		}, []);

		try {
			const getData = await mongo.collection(this.collection).find({ $or: formatFilters }).toArray();

			return getData;
		} catch(error) {
			return error;
		}
	}

	static async getById(id) {

		const idFormatted = mongodb.ObjectId(id);

		try {
			const getData = await mongo.collection(this.collection).findOne({ _id: idFormatted });

			return getData;
		} catch(error) {
			return error;
		}
	}

	static async update(id, data) {

		try {

			const getData = await mongo.collection(this.collection).findOneAndUpdate({ _id: mongodb.ObjectId(id) }, { $set: data }, { new: true });

			return getData;

		} catch(error) {
			return error;
		}
	}

	static async delete(id) {

		try {

			const getData = await mongo.collection(this.collection).findOneAndUpdate(
				{ _id: mongodb.ObjectId(id) },
				{ $set: { status: Model.statuses.inactive } });

			return getData;

		} catch(error) {
			return error;
		}
	}
};
