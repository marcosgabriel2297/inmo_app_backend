const sandbox = require('sinon').createSandbox();
const assert = require('assert');

const { mockResponse, mockRequest } = require('../../mocks');
const { handler } = require('../../../src/routes/area/src/create-keyword');
const AreaModel = require('../../../src/models/Area');
const { messageForExistingKeyword, messageForKeywordCreated } = require('../../../src/messages/area/create-keyword');

describe('Create area api Test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeData = { keyword: 'fakeVacunacion' };

	const fakeId = '623b2175480fdfdc34de1cce';

	const areaGetted = {
		_id: fakeId,
		name: 'salud',
		keywords: ['medicamentos'],
		status: 'active'
	};

	const areaUpdated = {
		value: {
			_id: fakeId,
			name: 'salud',
			keywords: ['vacunacion', 'nuevaPalabra'],
			status: 'active'
		}
	};

	const response = {
		message: messageForKeywordCreated(),
		code: 2,
		keywordCreated: 'fakeVacunacion',
		areaModified: fakeId
	};

	context('When no error occurs', () => {

		it('Should return 200 if create keyword is successful', async () => {

			sandbox.stub(AreaModel, 'getById').resolves(areaGetted);
			sandbox.stub(AreaModel, 'findOneAndModify').resolves(areaUpdated);

			const req = mockRequest(fakeData, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, response);
			sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
			sandbox.assert.calledOnceWithExactly(AreaModel.findOneAndModify, fakeId, { keywords: ['medicamentos', 'fakeVacunacion'] });
		});

		it('Should return 200 if the keyword is already saved', async () => {

			sandbox.stub(AreaModel, 'getById').resolves(areaGetted);
			sandbox.stub(AreaModel, 'findOneAndModify').resolves(areaUpdated);

			const req = mockRequest({ keyword: 'medicamentos' }, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, { message: messageForExistingKeyword('medicamentos'), code: 1 });
			sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
			sandbox.assert.notCalled(AreaModel.findOneAndModify);
		});
	});

	context('When data is invalid', () => {

		context('When data is invalid', () => {

			it('Should return 400 if received invalid id', async () => {

				sandbox.stub(AreaModel, 'getById');
				sandbox.stub(AreaModel, 'findOneAndModify');

				const req = mockRequest(fakeData, { id: 'invalidId' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"value" with value "invalidId" fails to match the valid mongo id pattern' });
				sandbox.assert.notCalled(AreaModel.getById);
				sandbox.assert.notCalled(AreaModel.findOneAndModify);
			});

			it('Should return 400 if received invalid keyword', async () => {

				sandbox.stub(AreaModel, 'getById');
				sandbox.stub(AreaModel, 'findOneAndModify');

				const req = mockRequest({ keyword: 2 }, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"keyword" must be a string' });
				sandbox.assert.notCalled(AreaModel.getById);
				sandbox.assert.notCalled(AreaModel.findOneAndModify);
			});

			it('Should return 500 if not received id', async () => {

				sandbox.stub(AreaModel, 'getById');
				sandbox.stub(AreaModel, 'findOneAndModify');

				const req = mockRequest({ keyword: 'fakeKeyword' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"value" is required' });
				sandbox.assert.notCalled(AreaModel.getById);
				sandbox.assert.notCalled(AreaModel.findOneAndModify);
			});

			it('Should return 500 if not received keyword', async () => {

				sandbox.stub(AreaModel, 'getById');
				sandbox.stub(AreaModel, 'findOneAndModify');

				const req = mockRequest({}, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"keyword" is required' });
				sandbox.assert.notCalled(AreaModel.getById);
				sandbox.assert.notCalled(AreaModel.findOneAndModify);
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if an error occurs when getting an area', async () => {

				sandbox.stub(AreaModel, 'getById').rejects(new Error('Error in database'));
				sandbox.stub(AreaModel, 'findOneAndModify').resolves(areaUpdated);

				const req = mockRequest(fakeData, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, 'Error: Error in database');
				sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
				sandbox.assert.notCalled(AreaModel.findOneAndModify);
			});

			it('Should return 500 if an error occurs when updating an area', async () => {

				sandbox.stub(AreaModel, 'getById').resolves(areaGetted);
				sandbox.stub(AreaModel, 'findOneAndModify').rejects(new Error('Error in database'));

				const req = mockRequest(fakeData, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, 'Error: Error in database');
				sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
				sandbox.assert.calledOnceWithExactly(AreaModel.findOneAndModify, fakeId, { keywords: ['medicamentos', 'fakeVacunacion'] });
			});
		});
	});
});
