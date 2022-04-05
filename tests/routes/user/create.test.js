const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/create');
const CollaboratorModel = require('../../../src/models/User');
const EmailService = require('../../../modules/email/EmailService');
const { messageForCreatedUser } = require('../../../src/messages/user/create');

const deleteProp = require('../../helpers/delete-prop');

describe('Create collaborator api test', () => {

	afterEach(() => sandbox.restore());
	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const dataGetted = {
		message: messageForCreatedUser(),
		code: 2,
		userInserted: '6216502b1c7d685f4a83a2f2',
		password: 'xM90roIk4H4orM'
	};

	const fakeData = {
		name: 'Isaac',
		lastname: 'Newton',
		email: 'newton@mymail.com',
		isAdmin: false
	};

	const emailSended = {
		accepted: ['newton@mymail.com'],
		rejected: [],
		envelopeTime: 630,
		messageTime: 898,
		messageSize: 28881,
		response: '250 2.0.0 OK  1646923143 68-20020a9d0a4a000000b005ad3287033csm2470899otg.44 - gsmtp',
		envelope: {
			from: 'digestomunicipal2022@gmail.com',
			to: ['newton@mymail.com']
		},
		messageId: '<a18269f7-fdd0-4221-512d-d25a8b323bb9@gmail.com>'
	};

	context('When no error occurs', () => {

		it('Should return 200 if create a collaborator user successfully', async () => {

			sandbox.stub(CollaboratorModel.prototype, 'insert').resolves(dataGetted);
			sandbox.stub(EmailService, 'sendEmail').resolves(emailSended);

			const req = mockRequest(fakeData);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForCreatedUser());
			assert.deepStrictEqual(res.json.code, 2);
			sandbox.assert.calledOnceWithExactly(CollaboratorModel.prototype.insert);
			sandbox.assert.calledOnce(EmailService.sendEmail);
		});
	});

	context('When an error is returned', () => {

		context('When data is invalid', () => {

			it('Should return 400 if received invalid mail', async () => {
				sandbox.stub(CollaboratorModel.prototype, 'insert').resolves();
				sandbox.stub(EmailService, 'sendEmail');

				const req = mockRequest({
					...fakeData,
					email: 'newtonString'
				});

				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"email" must be a valid email');
				sandbox.assert.notCalled(CollaboratorModel.prototype.insert);
				sandbox.assert.notCalled(EmailService.sendEmail);
			});

			it('Should return 400 if received an empty name', async () => {
				sandbox.stub(CollaboratorModel.prototype, 'insert').resolves();

				const req = mockRequest({
					...fakeData,
					name: ''
				});

				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"name" is not allowed to be empty');
				sandbox.assert.notCalled(CollaboratorModel.prototype.insert);
			});

			it('Should return 400 if received an empty lastname', async () => {
				sandbox.stub(CollaboratorModel.prototype, 'insert').resolves();

				const req = mockRequest({
					...fakeData,
					lastname: ''
				});

				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"lastname" is not allowed to be empty');
				sandbox.assert.notCalled(CollaboratorModel.prototype.insert);
			});

			it('Should return 400 if received an empty email', async () => {
				sandbox.stub(CollaboratorModel.prototype, 'insert').resolves();

				const req = mockRequest({
					...fakeData,
					email: ''
				});

				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json.error, '"email" is not allowed to be empty');
				sandbox.assert.notCalled(CollaboratorModel.prototype.insert);
			});

			const keys = ['name', 'lastname', 'email'];
			keys.forEach(key => {
				it(`Should return 400 if dont send ${key}`, async () => {

					sandbox.stub(CollaboratorModel.prototype, 'insert');

					const req = mockRequest(deleteProp(fakeData, key));
					const res = mockResponse();

					await handler(req, res);

					assert.deepStrictEqual(res.status, 400);
				});
			});
		});

		context('When there is an error on database', () => {

			it('Should return 500 if have an error on insert', async () => {

				sandbox.stub(CollaboratorModel.prototype, 'insert').rejects(new Error('Error in database'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, 'Error: Error in database');
				sandbox.assert.calledOnceWithExactly(CollaboratorModel.prototype.insert);
			});
		});
	});
});
