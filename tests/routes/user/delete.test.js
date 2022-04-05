const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { ObjectId } = require('mongodb');
const { mockRequest, mockResponse } = require('../../mocks');

const { handler } = require('../../../src/routes/user/src/delete');
const UserModel = require('../../../src/models/User');
const Model = require('../../../modules/class/Model');
const {
	messageForUserNotFound,
	messageForDeletedUser,
	messageForAlredyDeleteUser
} = require('../../../src/messages/user/delete');

describe('User delete test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeId = '620e9f517095d952b88146cb';

	const userGetted = {
		_id: '620e9f517095d952b88146cb',
		email: 'si@admin.com',
		password: '$2b$12$2YLS6ww.i4607.WHti6p1etb//QWriUnUpcbrXzXQc36wZ0v4TAkq',
		name: 'Marcelo',
		lastname: 'Gallardo',
		status: Model.statuses.active,
		isAdmin: true
	};

	const userGettedInactive = {
		_id: '620e9f517095d952b88146cb',
		email: 'si@admin.com',
		password: '$2b$12$2YLS6ww.i4607.WHti6p1etb//QWriUnUpcbrXzXQc36wZ0v4TAkq',
		name: 'Marcelo',
		lastname: 'Gallardo',
		status: Model.statuses.inactive,
		isAdmin: true
	};

	const userDeleted = {
		value: {
			_id: '620e9f517095d952b88146cb',
			email: 'si@admin.com',
			password: '$2b$12$2YLS6ww.i4607.WHti6p1etb//QWriUnUpcbrXzXQc36wZ0v4TAkq',
			name: 'Marcelo',
			lastname: 'Gallardo',
			status: Model.statuses.inactive,
			isAdmin: true
		}
	};

	const responseEdited = {
		message: messageForDeletedUser(),
		code: 2,
		UserDeleted: '620e9f517095d952b88146cb'
	};

	const responseNoEdited = {
		message: messageForAlredyDeleteUser(),
		code: 2,
		UserDeleted: '620e9f517095d952b88146cb'
	};

	const responseNoFind = {
		message: messageForUserNotFound(fakeId)
	};

	const fakeIdNoMD = '620e9f51702s4952b88146cb';

	context('When no error occurs', () => {

		it('Should return 200 if delete a user', async () => {

			sandbox.stub(UserModel, 'getOne').resolves(userGetted);
			sandbox.stub(UserModel, 'findOneAndModify').resolves(userDeleted);

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, responseEdited);

			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { _id: ObjectId(fakeId) });

		});

		it('Should return 200 if find a legislation but not edited', async () => {

			sandbox.stub(UserModel, 'getOne').resolves(userGettedInactive);
			sandbox.stub(UserModel, 'findOneAndModify');

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			sandbox.assert.notCalled(UserModel.findOneAndModify);
			assert.deepStrictEqual(res.json, responseNoEdited);
			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { _id: ObjectId(fakeId) });
		});
	});

	context('When error occurs', () => {

		context('When data is invalid', () => {

			it('Should return 400 if dont find a legislation', async () => {

				sandbox.stub(UserModel, 'getOne').resolves(null);
				sandbox.stub(UserModel, 'findOneAndModify');

				const req = mockRequest({}, { id: fakeId });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.json, responseNoFind);
				assert.deepStrictEqual(res.status, 404);
				sandbox.assert.calledOnceWithExactly(UserModel.getOne, { _id: ObjectId(fakeId) });
				sandbox.assert.notCalled(UserModel.findOneAndModify);

			});
		});
		it('Should return 500 if have an error on database when executed getOne', async () => {

			sandbox.stub(UserModel, 'getOne').rejects(new Error('Error getOne'));
			sandbox.stub(UserModel, 'findOneAndModify');

			const req = mockRequest({}, { id: fakeId });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 500);
			assert.deepStrictEqual(res.json, 'Error: Error getOne');
			sandbox.assert.calledOnceWithExactly(UserModel.getOne, { _id: ObjectId(fakeId) });
			sandbox.assert.notCalled(UserModel.findOneAndModify);

		});

		it('Should return 400 if invalid ID', async () => {

			sandbox.stub(UserModel, 'getOne');
			sandbox.stub(UserModel, 'findOneAndModify');

			const req = mockRequest({}, { id: fakeIdNoMD });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 400);
			sandbox.assert.notCalled(UserModel.getOne);
			sandbox.assert.notCalled(UserModel.findOneAndModify);
		});
	});

});
