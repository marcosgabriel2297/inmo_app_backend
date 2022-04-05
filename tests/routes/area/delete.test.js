const sandbox = require('sinon').createSandbox();
const assert = require('assert');

const { mockRequest, mockResponse } = require('../../mocks');
const Model = require('../../../modules/class/Model');

const { handler } = require('../../../src/routes/area/src/delete');
const AreaModel = require('../../../src/models/Area');
const { messageForAreaNotFound, messageForAreaDeleted, messageForAlredyDeletedArea } = require('../../../src/messages/area/delete');

describe('Delete an area', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeId = '62210c50b71a3f0e99dcf165';

	const responseIfEqual = {
		message: messageForAlredyDeletedArea(),
		code: 2,
		areaDeleted: '62210c50b71a3f0e99dcf165'
	};

	const responseGetted = {
		message: messageForAreaDeleted(),
		code: 2,
		areaDeleted: '62210c50b71a3f0e99dcf165'
	};

	const fakeData = {
		status: 'desactivado'
	};

	const areaGettedInactive = {
		_id: '62210c50b71a3f0e99dcf165',
		name: 'salud',
		keywords: [],
		status: Model.statuses.inactive
	};

	const areaGetted = {
		_id: '62210c50b71a3f0e99dcf165',
		name: 'salud',
		keywords: [],
		status: Model.statuses.active
	};

	const areaEdited = {
		value: {
			_id: '62210c50b71a3f0e99dcf165',
			name: 'otro nombre',
			keywords: [],
			status: Model.statuses.active
		}
	};

	const responseNoFind = {
		message: messageForAreaNotFound(fakeId)
	};

	context('When no error occurs', () => {

		it('Should return 200 if delete a area', async () => {

			sandbox.stub(AreaModel, 'getById').resolves(areaGetted);
			sandbox.stub(AreaModel, 'findOneAndModify').resolves(areaEdited);

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.json, responseGetted);
			sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
			sandbox.assert.calledOnceWithExactly(AreaModel.findOneAndModify, fakeId, { status: 'inactive' });
		});

		it('Should return 200 if find a area but not edited', async () => {

			sandbox.stub(AreaModel, 'getById').resolves(areaGettedInactive);
			sandbox.stub(AreaModel, 'findOneAndModify');

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			sandbox.assert.notCalled(AreaModel.findOneAndModify);
			assert.deepStrictEqual(res.json, responseIfEqual);
			sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
		});
	});

	context('When error occurs', () => {

		context('When data is invalid', () => {

			it('Should return 400 if dont find a area', async () => {

				sandbox.stub(AreaModel, 'getById').resolves(null);
				sandbox.stub(AreaModel, 'findOneAndModify');

				const req = mockRequest(fakeData, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.json, responseNoFind);
				assert.deepStrictEqual(res.status, 400);
				sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
				sandbox.assert.notCalled(AreaModel.findOneAndModify);

			});
		});

		it('Should return 500 if have an error on database when executed getOne', async () => {

			sandbox.stub(AreaModel, 'getById').rejects(new Error('Error getById'));
			sandbox.stub(AreaModel, 'findOneAndModify');

			const req = mockRequest(fakeData, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
			assert.deepStrictEqual(res.json, 'Error: Error getById');
			sandbox.assert.calledOnceWithExactly(AreaModel.getById, fakeId);
			sandbox.assert.notCalled(AreaModel.findOneAndModify);

		});

		it('Should return 500 if no received valid id', async () => {

			sandbox.stub(AreaModel, 'getById');
			sandbox.stub(AreaModel, 'findOneAndModify');

			const req = mockRequest({}, { id: 'invalidId' });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json, { error: '"value" with value "invalidId" fails to match the valid mongo id pattern' });
			sandbox.assert.notCalled(AreaModel.getById);
			sandbox.assert.notCalled(AreaModel.findOneAndModify);
		});
	});
});
