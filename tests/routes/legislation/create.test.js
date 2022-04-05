const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockRequest, mockResponse } = require('../../mocks');

const { handler } = require('../../../src/routes/legislation/src/create');
const LegislationModel = require('../../../src/models/Legislation');
const { messageForAlredyExistingLegislation, messageForCreatedLegislation } = require('../../../src/messages/legislation/create');

describe('Create a legislation', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakedata = {
		type: 'fakeLegislation'
	};

	const response = {
		message: messageForCreatedLegislation(),
		code: 2,
		legislationInserted: '622111fdf75a9a6b6fd57945'
	};

	const legislationGetted = {
		_id: '622f54fe6e2965ce95e28206',
		type: 'fakeLegislation',
		status: 'inactive'
	};

	context('When no error occurs', () => {

		it('Should return 200 if create a legislation', async () => {

			sandbox.stub(LegislationModel.prototype, 'insert').resolves(response);
			sandbox.stub(LegislationModel, 'getOne').resolves(null);

			const req = mockRequest(fakedata);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForCreatedLegislation());
			assert.deepStrictEqual(res.json.code, 2);
			sandbox.assert.calledOnceWithExactly(LegislationModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(LegislationModel.getOne, { type: 'fakeLegislation' });
		});

		it('Should return 200 if exist some legislation with the same name', async () => {

			sandbox.stub(LegislationModel.prototype, 'insert').resolves(response);
			sandbox.stub(LegislationModel, 'getOne').resolves(legislationGetted);

			const req = mockRequest(fakedata);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForAlredyExistingLegislation('fakeLegislation'));
			assert.deepStrictEqual(res.json.code, 1);
			sandbox.assert.notCalled(LegislationModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(LegislationModel.getOne, { type: 'fakeLegislation' });
		});
	});

	context('When an error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if received invalid type example a number', async () => {

				sandbox.stub(LegislationModel.prototype, 'insert');
				sandbox.stub(LegislationModel, 'getOne');

				const req = mockRequest({ type: 2 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"type" must be a string');
				sandbox.assert.notCalled(LegislationModel.prototype.insert);
				sandbox.assert.notCalled(LegislationModel.getOne);

			});

			it('Should return 400 if type is empty', async () => {

				sandbox.stub(LegislationModel.prototype, 'insert');
				sandbox.stub(LegislationModel, 'getOne');

				const req = mockRequest({ type: '' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"type" is not allowed to be empty');
				sandbox.assert.notCalled(LegislationModel.prototype.insert);
				sandbox.assert.notCalled(LegislationModel.getOne);
			});
		});

		context('Error in databse', () => {

			it('Should return 500 when try to create a legislation', async () => {

				sandbox.stub(LegislationModel.prototype, 'insert').rejects(new Error('error trying insert'));
				sandbox.stub(LegislationModel, 'getOne').resolves(null);

				const req = mockRequest(fakedata);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, 'Error: error trying insert');
				sandbox.assert.calledOnceWithExactly(LegislationModel.prototype.insert);
				sandbox.assert.calledOnceWithExactly(LegislationModel.getOne, { type: 'fakeLegislation' });
			});

			it('Should return 500 when try gettin a legislation', async () => {
				sandbox.stub(LegislationModel.prototype, 'insert').resolves(response);
				sandbox.stub(LegislationModel, 'getOne').resolves(null);

				const req = mockRequest(fakedata);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 200);
				assert.deepStrictEqual(res.json.message, messageForCreatedLegislation());
				assert.deepStrictEqual(res.json.code, 2);
				sandbox.assert.calledOnceWithExactly(LegislationModel.prototype.insert);
				sandbox.assert.calledOnceWithExactly(LegislationModel.getOne, { type: 'fakeLegislation' });
			});
		});
	});

});
