const assert = require('assert');

const LegislationModel = require('../../src/models/Legislation');

const compareData = (model, data) => {

	assert.deepStrictEqual(model.type, data.type);

};

describe('Test legislation Model', () => {

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const data = {
		type: 'tipo1'
	};

	it('Create Legislation Model', async () => {

		const legislation = new LegislationModel(data);
		compareData(legislation, data);

	});

	it('Should return "legislations" when execute the collection function', () => {

		const { collection } = LegislationModel;
		assert.deepStrictEqual(collection, 'legislations');
	});

	it('Should return "legislations" when execute the collection instantiated function', () => {

		const legislationModel = new LegislationModel(data);
		const { collection } = legislationModel;

		assert.deepStrictEqual(collection, 'legislations');
	});

	it('Should return an instantiated object when execute the "instantiate" function', () => {
		const legislation = LegislationModel.instantiate(data);

		compareData(legislation, data);
	});
});
