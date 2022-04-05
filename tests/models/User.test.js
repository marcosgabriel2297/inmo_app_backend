const assert = require('assert');
const sinon = require('sinon');

const UserModel = require('../../src/models/User');

const compareData = (model, data) => {

	const callback = sinon.stub();
	callback.withArgs(sinon.match.string).returns(true);

	assert.deepStrictEqual(model.name, data.name);
	assert.deepStrictEqual(model.lastname, data.lastname);
	assert.deepStrictEqual(model.email, data.email);
	callback(model.password);
};

describe('Test User Model', () => {

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const data = {
		name: 'Peter',
		lastname: 'Parker',
		email: 'peterparker@spiderman.com',
		password: 'powerresponsibility'
	};

	it('Create User Model', async () => {

		const userModel = new UserModel(data);
		compareData(userModel, data);
	});

	it('Should return "users" when execute the collection function', () => {

		const { collection } = UserModel;
		assert.deepStrictEqual(collection, 'users');
	});

	it('Should return "users" when execute the collection instantiated function', () => {

		const userModel = new UserModel(data);
		const { collection } = userModel;

		assert.deepStrictEqual(collection, 'users');
	});

	it('Should return an instantiated object when execute the "instantiate" function', () => {
		const user = UserModel.instantiate(data);

		compareData(user, data);
	});
});
