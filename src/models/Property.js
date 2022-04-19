const Model = require('../../modules/class/Model');

class Property extends Model {

	constructor({
		latitude, longitude, address, neighborhood, city, province, owner, operation, type, title, description, rooms, price, images
	}) {
		super();
		this.location = {
			latitude,
			longitude,
			address,
			neighborhood,
			city,
			province
		};
		this.owner = owner;
		this.operation = operation;
		this.type = type;
		this.title = title;
		this.description = description;
		this.rooms = rooms;
		this.price = price;
		this.images = images;
		this.date = new Date();
		this.status = Model.statuses.active;
	}

	static get collection() {
		return 'properties';
	}

	get collection() {
		return 'properties';
	}

	static instantiate(obj) {
		return new Property(obj);
	}
}

module.exports = Property;
