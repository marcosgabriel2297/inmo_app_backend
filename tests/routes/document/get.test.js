const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/document/src/get');
const DocumentModel = require('../../../src/models/Document');
const {
	messageForInvalidFilters,
	messageForNotFoundDocuments,
	messageForGettedDocuments
} = require('../../../src/messages/document/get');

describe('Get documents api Test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const documentGetted = [
		{
			_id: '623a3940eb4540dc7665021e',
			numero: '1',
			serie: 'serio',
			anioSancion: '2015',
			fechaSancion: '2015-02-02T03:00:00.000Z',
			numeroExpediente: '0001',
			numeroDecreto: '1',
			anioPromulgacion: '2018',
			tipoLegislacion: 'altoTipo',
			fechaPromulgacion: '2018-09-12T03:00:00.000Z',
			fechaBoletin: '1986-05-25T03:00:00.000Z',
			numeroBoletin: '3314',
			asunto: 'alto asunto',
			aclaraciones: 'una buena aclaracion',
			area: 'un area',
			palabrasClave: ['palabrita', 'palabron'],
			isPDF: false,
			savePath: 'localhost:7020/623a3940eb4540dc7665021e.jpeg',
			status: 'active'
		}
	];

	const fakeResponse = {
		message: messageForGettedDocuments(),
		documentGetted,
		code: 2
	};

	const fakeResponseNotFoundDocuments = {
		code: 1,
		message: messageForNotFoundDocuments()
	};

	const fakeBody = {
		numero: '1',
		anioSancion: '2015',
		numeroExpediente: '3',
		tipoLegislacion: 'tipazo',
		asunto: 'privado',
		area: 'Salud',
		palabrasClave: ['covid', 'vacunacion']
	};

	const { palabrasClave, ...onlyFieldsString } = fakeBody;

	const filters = { ...fakeBody, palabrasClave: { $in: palabrasClave }, status: DocumentModel.statuses.active };

	context('When no error occurs', () => {

		it('Should return 200 and getted document', async () => {

			sandbox.stub(DocumentModel, 'get').resolves(documentGetted);

			const req = mockRequest(fakeBody);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, fakeResponse);
			sandbox.assert.calledOnceWithExactly(DocumentModel.get, filters);
		});

		it('Should return 200 and return an empty array', async () => {

			sandbox.stub(DocumentModel, 'get').resolves([]);

			const req = mockRequest(fakeBody);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 404);
			assert.deepStrictEqual(res.json, fakeResponseNotFoundDocuments);
			sandbox.assert.calledOnceWithExactly(DocumentModel.get, filters);
		});
	});

	context('When error is returned', () => {

		context('When filter is invalid', () => {

			Object.keys(onlyFieldsString).forEach(field => {

				it('Should return 400 if filter is invalid', async () => {

					sandbox.stub(DocumentModel, 'get');

					const req = mockRequest({ ...onlyFieldsString, [field]: true });
					const res = mockResponse();

					await handler(req, res);

					assert.deepStrictEqual(res.status, 400);
					assert.deepStrictEqual(res.json, { error: `"${field}" must be a string` });
					sandbox.assert.notCalled(DocumentModel.get);
				});
			});

			it('Should return 400 if recived only "palabrasClave" as filter', async () => {

				sandbox.stub(DocumentModel, 'get');

				const req = mockRequest({ palabrasClave });
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 400);
				assert.deepStrictEqual(res.json, { message: messageForInvalidFilters(), code: 1 });
				sandbox.assert.notCalled(DocumentModel.get);
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if an error occurs when getting documents', async () => {

				sandbox.stub(DocumentModel, 'get').rejects(new Error('Error in getting documents'));

				const req = mockRequest(fakeBody);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in getting documents', code: -1 });
				sandbox.assert.calledOnceWithExactly(DocumentModel.get, filters);
			});
		});

	});
});
