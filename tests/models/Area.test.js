const assert = require('assert');
const AreaModel = require('../../src/models/Area');

const compareData = (model, data) => {

	assert.deepStrictEqual(model.name, data.name);
	assert.deepStrictEqual(model.keywords, data.keywords);
};

describe('Test Area Model', () => {

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const data = {
		name: 'fakeVoice',
		keywords: []
	};

	it('Create Area Model', async () => {

		const userModel = new AreaModel(data);
		compareData(userModel, data);
	});

	it('Should return "areas" when execute the collection function', () => {

		const { collection } = AreaModel;
		assert.deepStrictEqual(collection, 'areas');
	});

	it('Should return "areas" when execute the collection instantiated function', () => {

		const voiceModel = new AreaModel(data);
		const { collection } = voiceModel;

		assert.deepStrictEqual(collection, 'areas');
	});

	it('Should return an instantiated object when execute the "instantiate" function', () => {
		const user = AreaModel.instantiate(data);

		compareData(user, data);
	});
});
