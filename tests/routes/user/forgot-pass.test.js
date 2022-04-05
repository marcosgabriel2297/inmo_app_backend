const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/forgot-pass');
const UserModel = require('../../../src/models/User');
const EmailService = require('../../../modules/email/EmailService');
const {
	messageForUserNotFoundByEmail,
	messageForCheckingEmail,
	messageForEmailNotSent
} = require('../../../src/messages/user/forgot-pass');

describe('Forgot password api Test', () => {

	afterEach(() => {
		sandbox.restore();
		delete process.env.KEY_PRELOGIN;
	});

	beforeEach(() => {
		process.env.KEY_PRELOGIN = 'POWEREDBYMOODTECHNOLOGY';
		process.env.TEST_ENVIROMENT = true;
	});

	const fakeData = { email: 'robert@pattinson.com' };

	const userGetted = {
		_id: '62193e4128efc4ebe2f5faac',
		name: 'Robert',
		lastname: 'Pattinson',
		email: fakeData.email,
		password: '$2b$12$0aXLyiweqTFh6Rtbiv6Tj.Txke4ivA51H08GlXv46E3sJHYv.amGS',
		status: 'active',
		isAdmin: false
	};

	const emailSent = {
		accepted: ['mvera@moodtechnology.com.ar'],
		rejected: [],
		envelopeTime: 1062,
		messageTime: 674,
		messageSize: 2043,
		response: '250 2.0.0 OK  1647618348 a20-20020a056870001400b000daad453cdfsm3782141oaa.49 - gsmtp',
		envelope: {
			from: 'digestomunicipal2022@gmail.com',
			to: ['mvera@moodtechnology.com.ar']
		},
		messageId: '<5bfd0dd5-7f43-850f-530a-921892b2c9db@gmail.com>'
	};

	context('When no error occurs', () => {

		context('When data is valid', () => {

			it('Should return 200 if the email is sent', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(EmailService, 'sendEmail').resolves(emailSent);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 200);
				assert.deepStrictEqual(res.json, { message: messageForCheckingEmail(), code: 2 });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.calledOnce(EmailService.sendEmail);
			});
		});
	});

	context('When error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if the email is invalid', async () => {

				sandbox.stub(UserModel, 'getOne');
				sandbox.stub(EmailService, 'sendEmail');

				const req = mockRequest({ email: 'invalidEmail' });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { message: '"email" must be a valid email', code: -1 });
				sandbox.assert.notCalled(UserModel.getOne);
				sandbox.assert.notCalled(EmailService.sendEmail);
			});
		});

		context('When no user is found', async () => {

			it('Should return 404 if user not found', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(null);
				sandbox.stub(EmailService, 'sendEmail');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 404);
				assert.deepStrictEqual(res.json, { message: messageForUserNotFoundByEmail('robert@pattinson.com'), code: 1 });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: fakeData.email });
				sandbox.assert.notCalled(EmailService.sendEmail);
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if occurs error when executed getOne', async () => {

				sandbox.stub(UserModel, 'getOne').rejects(new Error('Error in getOne'));
				sandbox.stub(EmailService, 'sendEmail');

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in getOne', code: -1 });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.notCalled(EmailService.sendEmail);
			});

			it('Should return 500 if occurs error when executed findOneAndModify', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(EmailService, 'sendEmail').rejects(new Error('Fail to send email'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Fail to send email', code: -1 });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.calledOnce(EmailService.sendEmail);
			});

			it('Should return 400 if not send email', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(EmailService, 'sendEmail').rejects(new Error('Fail to send email'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Fail to send email', code: -1 });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.calledOnce(EmailService.sendEmail);
			});
		});

		context('When no email is sent', () => {

			it('Should return 400 if not send email', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(userGetted);
				sandbox.stub(EmailService, 'sendEmail').resolves(null);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { message: messageForEmailNotSent(), code: -1 });
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { email: userGetted.email });
				sandbox.assert.calledOnce(EmailService.sendEmail);
			});
		});
	});
});
