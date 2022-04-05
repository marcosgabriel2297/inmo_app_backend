const sandbox = require('sinon').createSandbox();
const assert = require('assert');

const { mockRequest, mockResponse } = require('../../mocks');

const { handler } = require('../../../src/routes/legislation/src/delete');
const LegislationModel = require('../../../src/models/Legislation');
const {
	messageForNotFoundLegislation,
	messageForAlredyDeleteLegislation,
	messageForDeletedLegislation
} = require('../../../src/messages/legislation/delete');

describe('Delete a legislation', () => {

	afterEach(() => sandbox.restore());
	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeId = '62210c50b71a3f0e99dcf165';

	const responseIfEqual = {
		message: messageForAlredyDeleteLegislation(fakeId),
		code: 2,
		legislationDeleted: '62210c50b71a3f0e99dcf165'
	};

	const responseGetted = {
		message: messageForDeletedLegislation(),
		code: 2,
		legislationDeleted: '62210c50b71a3f0e99dcf165'
	};

	const fakeData = {
		status: 'desactivado'
	};

	const legislationGettedInactive = {
		_id: '62210c50b71a3f0e99dcf165',
		type: 'tipo1',
		status: 'inactive'
	};

	const legislationGetted = {
		_id: '62210c50b71a3f0e99dcf165',
		type: 'tipo1',
		status: 'active'
	};

	const legislationEdited = {
		value: {
			_id: '62210c50b71a3f0e99dcf165',
			type: 'no se que tipo',
			status: 'active'
		}
	};

	const responseNoFind = {
		message: messageForNotFoundLegislation(fakeId)
	};

	context('When no error occurs', () => {

		it('Should return 200 if delete a legislation', async () => {

			sandbox.stub(LegislationModel, 'getById').resolves(legislationGetted);
			sandbox.stub(LegislationModel, 'findOneAndModify').resolves(legislationEdited);

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.json, responseGetted);
			sandbox.assert.calledOnceWithExactly(LegislationModel.getById, fakeId);
			sandbox.assert.calledOnceWithExactly(LegislationModel.findOneAndModify, fakeId, { status: 'inactive' });
		});

		it('Should return 200 if find a legislation but not edited', async () => {

			sandbox.stub(LegislationModel, 'getById').resolves(legislationGettedInactive);
			sandbox.stub(LegislationModel, 'findOneAndModify');

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			sandbox.assert.notCalled(LegislationModel.findOneAndModify);
			assert.deepStrictEqual(res.json, responseIfEqual);
			sandbox.assert.calledOnceWithExactly(LegislationModel.getById, fakeId);
		});
	});

	context('When error occurs', () => {

		context('When data is invalid', () => {

			it('Should return 400 if dont find a legislation', async () => {

				sandbox.stub(LegislationModel, 'getById').resolves(null);
				sandbox.stub(LegislationModel, 'findOneAndModify');

				const req = mockRequest(fakeData, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.json, responseNoFind);
				assert.deepStrictEqual(res.status, 400);
				sandbox.assert.calledOnceWithExactly(LegislationModel.getById, fakeId);
				sandbox.assert.notCalled(LegislationModel.findOneAndModify);

			});
		});

		it('Should return 500 if have an error on database when executed getOne', async () => {

			sandbox.stub(LegislationModel, 'getById').rejects(new Error('Error getById'));
			sandbox.stub(LegislationModel, 'findOneAndModify');

			const req = mockRequest(fakeData, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
			assert.deepStrictEqual(res.json, 'Error: Error getById');
			sandbox.assert.calledOnceWithExactly(LegislationModel.getById, fakeId);
			sandbox.assert.notCalled(LegislationModel.findOneAndModify);

		});

		it('Should return 500 if no received valid id', async () => {

			sandbox.stub(LegislationModel, 'getById');
			sandbox.stub(LegislationModel, 'findOneAndModify');

			const req = mockRequest({}, { id: 'invalidId' });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json, { error: '"value" with value "invalidId" fails to match the valid mongo id pattern' });
			sandbox.assert.notCalled(LegislationModel.getById);
			sandbox.assert.notCalled(LegislationModel.findOneAndModify);
		});
	});
});
