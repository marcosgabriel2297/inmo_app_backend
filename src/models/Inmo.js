const User = require('./User');

class Inmo extends User {

	constructor({
		matricula, lat, lon, address, city, province
	}) {
		super();
		this.matricula = matricula;
		this.location = {
			latitude: lat,
			longitude: lon
		};
		this.address = address;
		this.city = city;
		this.province = province;
	}

	static get collection() {
		return 'inmobiliarias';
	}

	get collection() {
		return 'inmobiliarias';
	}

	static instantiate(obj) {
		return new Inmo(obj);
	}
}

module.exports = Inmo;
