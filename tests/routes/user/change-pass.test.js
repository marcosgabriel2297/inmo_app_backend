const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const bcrypt = require('bcrypt');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/change-pass');
const UserModel = require('../../../src/models/User');
const {
	messageForEqualsPasswords,
	messageforUserNotFound,
	messageForIncorrectPassword,
	messageForChangePassword
} = require('../../../src/messages/user/change-pass');

describe('Change password api Test', () => {

	afterEach(() => sandbox.restore());
	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeData = {
		email: 'robert@pattinson.com',
		password: 'crepusculo',
		newPassword: 'thebatman'
	};

	const userGetted = {
		_id: '62193e4128efc4ebe2f5faac',
		name: 'Robert',
		lastname: 'Pattinson',
		email: 'robert@pattinson.com',
		password: '$2b$12$0aXLyiweqTFh6Rtbiv6Tj.Txke4ivA51H08GlXv46E3sJHYv.amGS',
		status: 'active',
		isAdmin: false
	};

	const dataUpdated = {
		lastErrorObject: { n: 1, updatedExisting: true },
		value: userGetted
	};

	const passwordHashed = '$2b$12$0aXLyiweqTFh6Rtbiv6Tj.Txke4ivA51H08GlXv46E3sJHYv.amGS';

	context('When no error occurs', () => {

		context('When data is valid', () => {

			it('Should return 200 if the password is changed correctly', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(UserModel, 'findOneAndModify').resolves(dataUpdated);
				sandbox.stub(bcrypt, 'hash').resolves(passwordHashed);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 200);
				assert.deepStrictEqual(res.json, { message: messageForChangePassword(), code: 2, user: userGetted._id });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.calledOnceWithExactly(UserModel.findOneAndModify, userGetted._id, { password: passwordHashed });
				sandbox.assert.calledOnceWithExactly(bcrypt.hash, fakeData.newPassword, 12);
			});

			it('Should return 200 if the password and new pasword is equals', async () => {

				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest({ ...fakeData, password: fakeData.newPassword });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 200);
				assert.deepStrictEqual(res.json, { message: messageForEqualsPasswords(), code: 1 });
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});
		});
	});

	context('When error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if the email is invalid', async () => {

				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest({ ...fakeData, email: 'invalidEmail' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"email" must be a valid email' });
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});

			it('Should return 400 if the password is invalid', async () => {

				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest({ ...fakeData, password: 2 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"password" must be a string' });
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});

			it('Should return 400 if the new password is invalid', async () => {

				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest({ ...fakeData, newPassword: 2 });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { error: '"newPassword" must be a string' });
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});
		});

		context('When no user is found', async () => {

			it('Should return 404 if user not found', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(null);
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 404);
				assert.deepStrictEqual(res.json, { message: messageforUserNotFound() });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});
		});

		context('When the password is incorrect', () => {

			it('Should return 400 if the password is incorrect', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest({ ...fakeData, password: 'incorrect' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { message: messageForIncorrectPassword() });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if occurs error when executed getOne', async () => {

				sandbox.stub(UserModel, 'getOne').rejects(new Error('Error in getOne'));
				sandbox.stub(UserModel, 'findOneAndModify');
				sandbox.stub(bcrypt, 'hash');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { code: -1, message: 'Error: Error in getOne' });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.notCalled(bcrypt.hash);
			});

			it('Should return 500 if occurs error when executed findOneAndModify', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(UserModel, 'findOneAndModify').rejects(new Error('Error in findOneAndModify'));
				sandbox.stub(bcrypt, 'hash').resolves(passwordHashed);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { code: -1, message: 'Error: Error in findOneAndModify' });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.calledOnceWithExactly(UserModel.findOneAndModify, userGetted._id, { password: passwordHashed });
				sandbox.assert.calledOnceWithExactly(bcrypt.hash, fakeData.newPassword, 12);
			});
		});

		context('When fails bcrypt', () => {

			it('Should return 500 if occurs error in bycrypt', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(UserModel, 'findOneAndModify').resolves(dataUpdated);
				sandbox.stub(bcrypt, 'hash').rejects(new Error('Error in bcrypt'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { code: -1, message: 'Error: Error in bcrypt' });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.notCalled(UserModel.findOneAndModify);
				sandbox.assert.calledOnceWithExactly(bcrypt.hash, fakeData.newPassword, 12);
			});
		});
	});
});
