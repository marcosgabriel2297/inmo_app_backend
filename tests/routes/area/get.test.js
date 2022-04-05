const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockRequest, mockResponse } = require('../../mocks');

const { handler } = require('../../../src/routes/area/src/get');
const AreaModel = require('../../../src/models/Area');
const { messageForNotFoundAreas, messageForAreasFound } = require('../../../src/messages/area/get');

describe('Get all areas test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const dataGetted = [
		{
			_id: '6227a9accae0652a0d7598d0',
			name: 'salud',
			keywords: [
				'prueba2',
				'prueba1'
			],
			status: 'active'
		},
		{
			_id: '6228f5646b96f2be2bba5b63',
			name: 'Deporte',
			keywords: [],
			status: 'active'
		}
	];

	context('When no errors occurs', () => {
		it('Should return 200 if get areas', async () => {

			sandbox.stub(AreaModel, 'get').resolves(dataGetted);

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForAreasFound());

			sandbox.assert.calledOnceWithExactly(AreaModel.get, { status: AreaModel.statuses.active });

		});
	});

	context('When error occurrs', () => {

		it('Should return 404 if dont find areas ', async () => {

			sandbox.stub(AreaModel, 'get').resolves([]);

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 404);
			assert.deepStrictEqual(res.json.message, messageForNotFoundAreas());

			sandbox.assert.calledOnceWithExactly(AreaModel.get, { status: 'active' });
		});

		it('Should return 500 if cant connect', async () => {

			sandbox.stub(AreaModel, 'get').rejects(new Error('error database'));

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
		});

	});

});
