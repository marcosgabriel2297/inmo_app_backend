const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockRequest, mockResponse } = require('../../mocks');

const { handler } = require('../../../src/routes/legislation/src/get');
const LegislationModel = require('../../../src/models/Legislation');
const {
	messageForNotFoundLegislations,
	messageForGettedLegislation
} = require('../../../src/messages/legislation/get');

describe('Get all legislations test', () => {

	afterEach(() => sandbox.restore());
	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const dataGetted = [
		{
			_id: '6229fa065d6fd3133e38d083',
			type: 'tipo 1',
			status: 'active'
		},
		{
			_id: '622a0bd9b4e710c154ad8a40',
			type: 'tipo 2',
			status: 'active'
		}
	];

	context('When no errors occurs', () => {
		it('Should return 200 if get legislations', async () => {

			sandbox.stub(LegislationModel, 'get').resolves(dataGetted);

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForGettedLegislation());

			sandbox.assert.calledOnceWithExactly(LegislationModel.get, { status: 'active' });

		});
	});

	context('When error occurrs', () => {

		it('Should return 404 if dont find legislations ', async () => {

			sandbox.stub(LegislationModel, 'get').resolves([]);

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 404);
			assert.deepStrictEqual(res.json.message, messageForNotFoundLegislations());

			sandbox.assert.calledOnceWithExactly(LegislationModel.get, { status: 'active' });
		});

		it('Should return 500 if cant connect', async () => {

			sandbox.stub(LegislationModel, 'get').rejects(new Error('error database'));

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
		});

	});

});
