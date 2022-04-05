const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/area/src/create');
const AreaModel = require('../../../src/models/Area');
const { messageForExistingArea, messageForCreatedArea } = require('../../../src/messages/area/create');

describe('Create area api Test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeData = { name: 'salud' };

	const fakeId = {
		acknowledged: true,
		insertedId: '6214f692bedfc49496526921'
	};

	const areaGetted = {
		_id: '6227a9accae0652a0d7598d0',
		name: 'salud',
		keywords: ['prueba2', 'prueba1', 'vacunacion', 'salud'],
		status: 'active'
	};

	context('When no error occurs', () => {

		it('Should return 200 if create area is successful', async () => {

			sandbox.stub(AreaModel.prototype, 'insert').resolves(fakeId);
			sandbox.stub(AreaModel, 'getOne').resolves(null);

			const req = mockRequest(fakeData);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForCreatedArea());
			assert.deepStrictEqual(res.json.code, 2);
			sandbox.assert.calledOnceWithExactly(AreaModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(AreaModel.getOne, { name: fakeData.name });
		});

		it('Should return 200 if there is already an area with the received name', async () => {

			sandbox.stub(AreaModel.prototype, 'insert');
			sandbox.stub(AreaModel, 'getOne').resolves(areaGetted);

			const req = mockRequest(fakeData);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForExistingArea('salud'));
			assert.deepStrictEqual(res.json.code, 1);
			sandbox.assert.notCalled(AreaModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(AreaModel.getOne, { name: fakeData.name });
		});
	});

	context('When error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if recibed invalid area', async () => {

				sandbox.stub(AreaModel.prototype, 'insert');
				sandbox.stub(AreaModel, 'getOne');

				const req = mockRequest({ name: 6 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"name" must be a string');
				sandbox.assert.notCalled(AreaModel.prototype.insert);
				sandbox.assert.notCalled(AreaModel.getOne);
			});

			it('Should return 400 if recibed invalid "keywords"', async () => {

				sandbox.stub(AreaModel.prototype, 'insert');
				sandbox.stub(AreaModel, 'getOne');

				const req = mockRequest({ name: 'fake voice', keywords: 6 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"keywords" must be an array');
				sandbox.assert.notCalled(AreaModel.prototype.insert);
				sandbox.assert.notCalled(AreaModel.getOne);
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if occurs error when insert an area', async () => {

				sandbox.stub(AreaModel.prototype, 'insert').rejects(new Error('Faild insert in database'));
				sandbox.stub(AreaModel, 'getOne');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, 'Error: Faild insert in database');
				sandbox.assert.calledOnceWithExactly(AreaModel.prototype.insert);
				sandbox.assert.calledOnceWithExactly(AreaModel.getOne, { name: fakeData.name });
			});

			it('Should return 500 if occurs error when getting area', async () => {

				sandbox.stub(AreaModel.prototype, 'insert');
				sandbox.stub(AreaModel, 'getOne').rejects(new Error('Error in getOne'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, 'Error: Error in getOne');
				sandbox.assert.notCalled(AreaModel.prototype.insert);
				sandbox.assert.calledOnceWithExactly(AreaModel.getOne, { name: fakeData.name });
			});
		});

	});
});
