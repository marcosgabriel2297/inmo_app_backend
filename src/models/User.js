const bcrypt = require('bcrypt');
const Model = require('../../modules/class/Model');

class User extends Model {

	constructor({
		name, email, password, phone, linkWhatsapp, posts
	}) {
		super();
		this.name = name;
		this.email = email;
		this.password = bcrypt.hashSync(password, 12);
		this.phone = phone;
		this.link_whatsapp = linkWhatsapp;
		this.posts = posts;
		this.status = Model.statuses.active;
	}
}

module.exports = User;
