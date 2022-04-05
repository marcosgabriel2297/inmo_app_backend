const sandbox = require('sinon').createSandbox();
const assert = require('assert');

const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/edit');
const CollaboratorModel = require('../../../src/models/User');
const {
	messageForUserNotFound,
	messageForEditedUser,
	messageForAlredyEditUser
} = require('../../../src/messages/user/edit');

describe('Edit collaborator api test', () => {
	afterEach(() => sandbox.restore());
	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const response = {
		message: messageForEditedUser(),
		code: 2,
		userEdited: '621935d2e8b4dc88f7d81a16'
	};

	const responseIfEqual = {
		message: messageForAlredyEditUser(),
		code: 2,
		userEdited: '621935d2e8b4dc88f7d81a16'
	};

	const fakeData = {
		name: 'usuario editado',
		lastname: 'vera',
		email: 'marcosqwer@vera.com',
		isAdmin: true
	};

	const fakeData2 = {
		name: 'usuario6',
		email: 'marcosqwer@vera.com',
		lastname: 'vera',
		isAdmin: true
	};
	const fakeDataId = '621935d2e8b4dc88f7d81a16';

	const userGetted = {
		_id: fakeDataId,
		email: 'marcosqwer@vera.com',
		password: '$2b$12$mD9LYPKwhOoDTKW6f9AMWetP/kJkuTekxfqFixRni4RL/xEQ/Y.B.',
		name: 'usuario6',
		lastname: 'vera',
		status: 'active',
		isAdmin: true
	};

	const userEdited = {
		value: {
			_id: fakeDataId,
			name: 'usuario5',
			lastname: 'vera',
			email: 'usuario5@gmail.com',
			password: '$2b$12$mD9LYPKwhOoDTKW6f9AMWetP/kJkuTekxfqFixRni4RL/xEQ/Y.B.',
			status: 'active',
			isAdmin: true
		}
	};
	const responseNoFind = {
		message: messageForUserNotFound(fakeDataId)
	};

	context('When no error occurs', () => {

		it('Should return 200 if can edit a collaborator', async () => {

			sandbox.stub(CollaboratorModel, 'getById').resolves(userGetted);
			sandbox.stub(CollaboratorModel, 'findOneAndModify').resolves(userEdited);

			const req = mockRequest(fakeData, { id: fakeDataId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, response);
			sandbox.assert.calledOnceWithExactly(CollaboratorModel.getById, fakeDataId);
			sandbox.assert.calledOnceWithExactly(CollaboratorModel.findOneAndModify, fakeDataId, fakeData);
		});

		it('Should return 200 if find and user but not edited', async () => {

			sandbox.stub(CollaboratorModel, 'getById').resolves(userGetted);
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest(fakeData2, { id: fakeDataId });
			const res = mockResponse();

			await handler(req, res);

			sandbox.assert.notCalled(CollaboratorModel.findOneAndModify);
			assert.deepStrictEqual(res.json, responseIfEqual);
			sandbox.assert.calledOnceWithExactly(CollaboratorModel.getById, fakeDataId);
		});
	});

	context('When and error is returned', () => {

		it('Should return 500 if have an error on database when executed getOne', async () => {

			sandbox.stub(CollaboratorModel, 'getById').rejects(new Error('Error getById'));
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest(fakeData, { id: fakeDataId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
			assert.deepStrictEqual(res.json, 'Error: Error getById');
			sandbox.assert.calledOnceWithExactly(CollaboratorModel.getById, fakeDataId);
			sandbox.assert.notCalled(CollaboratorModel.findOneAndModify);

		});

		it('Should return 400 if dont find a user', async () => {

			sandbox.stub(CollaboratorModel, 'getById').resolves(null);
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest(fakeData, { id: fakeDataId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.json, responseNoFind);
			assert.deepStrictEqual(res.status, 400);
			sandbox.assert.calledOnceWithExactly(CollaboratorModel.getById, fakeDataId);
			sandbox.assert.notCalled(CollaboratorModel.findOneAndModify);
		});

		it('Should return 400 if received invalid mail', async () => {

			sandbox.stub(CollaboratorModel, 'getById');
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest({
				...fakeData,
				email: 'newtonString'
			});

			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json.error, '"email" must be a valid email');
			sandbox.assert.notCalled(CollaboratorModel.getById);
		});

		it('Should return 400 if received an empty name', async () => {

			sandbox.stub(CollaboratorModel, 'getById');
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest({
				...fakeData,
				name: ''
			});

			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json.error, '"name" is not allowed to be empty');
			sandbox.assert.notCalled(CollaboratorModel.findOneAndModify);
		});

		it('Should return 400 if received an empty lastname', async () => {

			sandbox.stub(CollaboratorModel, 'getById');
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest({
				...fakeData,
				lastname: ''
			});

			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json.error, '"lastname" is not allowed to be empty');
			sandbox.assert.notCalled(CollaboratorModel.getById);
		});

		it('Should return 400 if received an empty email', async () => {

			sandbox.stub(CollaboratorModel, 'getById');
			sandbox.stub(CollaboratorModel, 'findOneAndModify');

			const req = mockRequest({
				...fakeData,
				email: ''
			});

			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json.error, '"email" is not allowed to be empty');
			sandbox.assert.notCalled(CollaboratorModel.getById);
		});
	});
});
