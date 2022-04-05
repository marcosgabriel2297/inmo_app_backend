const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/get');
const UserModel = require('../../../src/models/User');
const { messageForUserNotFound, messageForUsersFound } = require('../../../src/messages/user/get');

describe('Get Api Test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const usersGetted = [
		{
			_id: '620e9f517095d952b88146cb',
			email: 'tobey@maguire.com',
			password: '$2b$12$7Y57N.jUb1MaQ4kDGYn6ku8S0Qe742F.eoDLevZ.hh2w/C3YSGngi',
			name: 'Tobey',
			lastname: 'Maguire',
			status: 'active',
			isAdmin: true
		},
		{
			_id: '6218fbb73cb1bbb8cd0c29e4',
			email: 'tom@holland.com',
			password: '$2b$12$WGI2R5P.MzTDAl6vS3s5JuaX6NgB0cqHGkozfKdkC4FsHoMHvAgQ6',
			name: 'Tom',
			lastname: 'Holland',
			status: 'active',
			isAdmin: false
		},
		{
			_id: '621935d2e8b4dc88f7d81a16',
			name: 'Andrew',
			lastname: 'Garfield',
			email: 'andrew@garfield.com',
			password: '$2b$12$mD9LYPKwhOoDTKW6f9AMWetP/kJkuTekxfqFixRni4RL/xEQ/Y.B.',
			status: 'active',
			isAdmin: true
		}
	];

	const responseOK = {
		message: messageForUsersFound(),
		usersGetted,
		code: 2
	};

	context('When no error occurs', () => {

		it('Should return 200 if the users are getted', async () => {

			sandbox.stub(UserModel, 'get').resolves(usersGetted);

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, responseOK);
			sandbox.assert.calledOnceWithExactly(UserModel.get, { status: 'active' });
		});
	});

	context('When error is returned', () => {

		it('Should return 404 if not found users', async () => {

			sandbox.stub(UserModel, 'get').resolves([]);

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 404);
			assert.deepStrictEqual(res.json, { message: messageForUserNotFound(), code: 1 });
			sandbox.assert.calledOnceWithExactly(UserModel.get, { status: 'active' });
		});

		it('Should return 500 if occurs an error in database', async () => {

			sandbox.stub(UserModel, 'get').rejects(new Error('Error in database'));

			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
			assert.deepStrictEqual(res.json, { message: 'Error: Error in database', code: -1 });
			sandbox.assert.calledOnceWithExactly(UserModel.get, { status: 'active' });
		});
	});
});
