const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/forgot-change-pass');
const UserModel = require('../../../src/models/User');
const {
	messageForInvalidUsernameOrPassword,
	messageForChangePassword
} = require('../../../src/messages/user/forgot-change-pass');

describe('Forgot password api Test', () => {

	afterEach(() => {
		sandbox.restore();
		delete process.env.KEY_PRELOGIN;
	});

	beforeEach(() => {
		process.env.KEY_PRELOGIN = 'POWEREDBYMOODTECHNOLOGY';
		process.env.TEST_ENVIROMENT = true;
	});

	const fakeData = { token: 'FakeToken', password: 'thebatman' };

	const userGetted = {
		_id: '62193e4128efc4ebe2f5faac',
		name: 'Robert',
		lastname: 'Pattinson',
		email: 'robert@pattinson.com',
		password: '$2b$12$0aXLyiweqTFh6Rtbiv6Tj.Txke4ivA51H08GlXv46E3sJHYv.amGS',
		status: 'active',
		isAdmin: true
	};

	const decrypt = {
		email: 'robert@pattinson.com',
		password: '$2b$12$0aXLyiweqTFh6Rtbiv6Tj.Txke4ivA51H08GlXv46E3sJHYv.amGS',
		iat: 1647616514
	};

	const userEdited = {
		value: {
			_id: '621935d2e8b4dc88f7d81a16',
			name: 'Robert',
			lastname: 'Pattinson',
			email: 'robert@pattinson.com',
			password: '$2b$12$0aXLyiweqTFh6Rtbiv6Tj.Txke4ivA51H08GlXv46E3sJHYv.amGS',
			status: 'active',
			isAdmin: true
		}
	};

	const passwordHash = '$2b$12$l8z73qI.bgQUJ7xfUEF9huUB7R3b/cfwhB.2LLf9yjt4P6bOKXIuS';

	context('When no error occurs', () => {

		context('When data is valid', () => {

			it('Should return 200 if the password is updated', async () => {

				sandbox.stub(jwt, 'verify').resolves(decrypt);
				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(bcrypt, 'hashSync').resolves(passwordHash);
				sandbox.stub(UserModel, 'findOneAndModify').resolves(userEdited);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 200);
				assert.deepStrictEqual(res.json, { message: messageForChangePassword(), code: 2 });
				sandbox.assert.calledOnceWithExactly(jwt.verify, fakeData.token, process.env.KEY_PRELOGIN);
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email, password: userGetted.password });
				sandbox.assert.calledOnceWithExactly(bcrypt.hashSync, fakeData.password, 12);
				sandbox.assert.calledOnceWithExactly(UserModel.findOneAndModify, userGetted._id, { password: passwordHash });
			});
		});
	});

	context('When error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if the token is invalid', async () => {

				sandbox.stub(jwt, 'verify');
				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(bcrypt, 'hashSync');
				sandbox.stub(UserModel, 'findOneAndModify');

				const req = mockRequest({ ...fakeData, token: 2 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { message: '"token" must be a string', code: -1 });
				sandbox.assert.notCalled(jwt.verify);
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(bcrypt.hashSync);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
			});

			it('Should return 400 if the password is invalid', async () => {

				sandbox.stub(jwt, 'verify');
				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(bcrypt, 'hashSync');
				sandbox.stub(UserModel, 'findOneAndModify');

				const req = mockRequest({ ...fakeData, password: 2 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { message: '"password" must be a string', code: -1 });
				sandbox.assert.notCalled(jwt.verify);
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(bcrypt.hashSync);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
			});
		});

		context('When no user is found', async () => {

			it('Should return 404 if user not found', async () => {

				sandbox.stub(jwt, 'verify').resolves(decrypt);
				sandbox.stub(UserModel, 'getOne').resolves(null);
				sandbox.stub(bcrypt, 'hashSync').resolves(passwordHash);
				sandbox.stub(UserModel, 'findOneAndModify');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 404);
				assert.deepStrictEqual(res.json, { message: messageForInvalidUsernameOrPassword(), code: 1 });
				sandbox.assert.calledOnceWithExactly(jwt.verify, fakeData.token, process.env.KEY_PRELOGIN);
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email, password: userGetted.password });
				sandbox.assert.notCalled(bcrypt.hashSync);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if occurs error when executed getOne', async () => {

				sandbox.stub(jwt, 'verify').resolves(decrypt);
				sandbox.stub(UserModel, 'getOne').rejects(new Error('Error in getting'));
				sandbox.stub(bcrypt, 'hashSync');
				sandbox.stub(UserModel, 'findOneAndModify').resolves(userEdited);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in getting', code: -1 });
				sandbox.assert.calledOnceWithExactly(jwt.verify, fakeData.token, process.env.KEY_PRELOGIN);
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email, password: userGetted.password });
				sandbox.assert.notCalled(bcrypt.hashSync);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
			});

			it('Should return 500 if occurs error when executed findOneAndModify', async () => {

				sandbox.stub(jwt, 'verify').resolves(decrypt);
				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(bcrypt, 'hashSync').resolves(passwordHash);
				sandbox.stub(UserModel, 'findOneAndModify').rejects(new Error('Error in updating'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in updating', code: -1 });
				sandbox.assert.calledOnceWithExactly(jwt.verify, fakeData.token, process.env.KEY_PRELOGIN);
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email, password: userGetted.password });
				sandbox.assert.calledOnceWithExactly(UserModel.findOneAndModify, userGetted._id, { password: passwordHash });
				sandbox.assert.calledOnceWithExactly(bcrypt.hashSync, fakeData.password, 12);
			});
		});

		context('When occurs error in some dependencies', () => {

			it('Should return 500 if occurs error when executed jwt', async () => {

				sandbox.stub(jwt, 'verify').rejects(new Error('Error in JWT'));
				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(bcrypt, 'hashSync');
				sandbox.stub(UserModel, 'findOneAndModify');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in JWT', code: -1 });
				sandbox.assert.calledOnceWithExactly(jwt.verify, fakeData.token, process.env.KEY_PRELOGIN);
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hashSync);
			});

			it('Should return 500 if occurs error when executed bcrypt', async () => {

				sandbox.stub(jwt, 'verify').resolves(decrypt);
				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(bcrypt, 'hashSync').rejects(new Error('Error in bcrypt'));
				sandbox.stub(UserModel, 'findOneAndModify');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in bcrypt', code: -1 });
				sandbox.assert.calledOnceWithExactly(jwt.verify, fakeData.token, process.env.KEY_PRELOGIN);
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email, password: userGetted.password });
				sandbox.assert.calledOnceWithExactly(bcrypt.hashSync, fakeData.password, 12);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
			});
		});
	});
});
