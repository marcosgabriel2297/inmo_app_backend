const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/login');
const UserModel = require('../../../src/models/User');
const {
	messageForUserNotFound,
	messageForIncorrectPassword,
	messageForLoginSuccess
} = require('../../../src/messages/user/login');

describe('Login api Test', () => {

	afterEach(() => {
		sandbox.restore();
		delete process.env.KEY_PRELOGIN;
	});

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const dataGetted = {
		_id: '620e593e4de45c9054bf9dad',
		email: 'fake@email.com',
		password: '$2b$12$WGI2R5P.MzTDAl6vS3s5JuaX6NgB0cqHGkozfKdkC4FsHoMHvAgQ6',
		name: 'marcos',
		lastname: 'vera',
		status: 'active',
		isAdmin: true
	};

	const fakeData = {
		email: 'fake@email.com',
		password: 'asdf1234'
	};

	context('When no error occurs', () => {

		it('Should return 200 if login is successful', async () => {

			process.env.KEY_PRELOGIN = 'POWEREDBYMOODTECHNOLOGY';
			sandbox.stub(UserModel, 'getOne').resolves(dataGetted);

			const req = mockRequest(fakeData);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForLoginSuccess());
			assert.deepStrictEqual(res.json.code, 2);
			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: fakeData.email });
		});
	});

	context('When error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if recibed invalid email', async () => {

				sandbox.stub(UserModel, 'getOne').resolves();

				const req = mockRequest({ email: 'invalidEmail', password: 'password' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"email" must be a valid email');
				sandbox.assert.notCalled(UserModel.getOne);
			});

			it('Should return 404 if not receibed email', async () => {

				sandbox.stub(UserModel, 'getOne').resolves();

				const req = mockRequest({ password: 'password' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"email" is required');
				sandbox.assert.notCalled(UserModel.getOne);
			});

			it('Should return 404 if not receibed password', async () => {

				sandbox.stub(UserModel, 'getOne').resolves();

				const req = mockRequest({ email: 'fake@mail.com' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"password" is required');
				sandbox.assert.notCalled(UserModel.getOne);
			});
		});

		it('Should return 400 if password is invalid', async () => {

			sandbox.stub(UserModel, 'getOne').resolves(dataGetted);

			const req = mockRequest({ email: 'fake@email.com', password: 'invalidPassword' });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			assert.deepStrictEqual(res.json.message, messageForIncorrectPassword());
			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: fakeData.email });
		});

		it('Should return 404 if not found user', async () => {

			sandbox.stub(UserModel, 'getOne').resolves(null);

			const req = mockRequest({ email: 'notFound@email.com', password: 'asdf1234' });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 404);
			assert.deepStrictEqual(res.json.message, messageForUserNotFound());
			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: 'notFound@email.com' });
		});

		it('Should return 500 if occurs error in database', async () => {

			sandbox.stub(UserModel, 'getOne').rejects('Error in database');

			const req = mockRequest({ email: 'notFound@email.com', password: 'asdf1234' });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
			assert.deepStrictEqual(res.json, 'Error in database');
			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: 'notFound@email.com' });
		});
	});
});
