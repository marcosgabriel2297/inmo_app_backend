const sandbox = require('sinon').createSandbox();
const assert = require('assert');
const { mockResponse, mockRequest } = require('../../mocks');

const { handler } = require('../../../src/routes/document/src/create');
const DocumentModel = require('../../../src/models/Document');
const {
	messageForDocumentWithWxistingNumber,
	messageForDocumentWithWxistingDecreeNumber,
	messageForDocumentCreated
} = require('../../../src/messages/document/create');

describe('Create document api Test', () => {

	afterEach(() => sandbox.restore());

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const fakeData = {
		numero: '9',
		serie: 'fakeSerie',
		anioSancion: '2015',
		fechaSancion: '2/2/2015',
		numeroExpediente: '2021',
		numeroDecreto: '46',
		anioPromulgacion: '2018',
		tipoLegislacion: 'altoTipo',
		fechaPromulgacion: '9/12/2018',
		fechaBoletin: '1986/5/25',
		numeroBoletin: '3314',
		asunto: 'alto asunto',
		area: 'una area muy importante',
		aclaraciones: 'una buena aclaracion',
		palabrasClave: ['palabrita', 'palabron']
	};

	const {
		fechaSancion, fechaPromulgacion, fechaBoletin, palabrasClave, ...onlyFieldsString
	} = fakeData;

	const onlyFieldsDate = ['fechaSancion', 'fechaPromulgacion', 'fechaBoletin'];

	const fakeId = {
		acknowledged: true,
		insertedId: '6214f692bedfc49496526921'
	};

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

	context('When no error occurs', () => {

		it('Should return 200 if create document is successful', async () => {

			sandbox.stub(DocumentModel.prototype, 'insert').resolves(fakeId);
			sandbox.stub(DocumentModel, 'getOr').resolves([]);

			const req = mockRequest(fakeData);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json.message, messageForDocumentCreated());
			assert.deepStrictEqual(res.json.documentInserted, fakeId.insertedId);
			sandbox.assert.calledOnceWithExactly(DocumentModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(DocumentModel.getOr, { numero: '9', numeroExpediente: '2021', numeroDecreto: '46' });
		});

		it('Should return 200 if there is already exist a document with the "numero" sended', async () => {

			sandbox.stub(DocumentModel.prototype, 'insert');
			sandbox.stub(DocumentModel, 'getOr').resolves(documentGetted);

			const req = mockRequest({ ...fakeData, numero: documentGetted[0].numero });
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, { message: messageForDocumentWithWxistingNumber(documentGetted[0].numero), code: 1 });
			sandbox.assert.notCalled(DocumentModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(DocumentModel.getOr, { numero: '1', numeroExpediente: '2021', numeroDecreto: '46' });
		});

		it('Should return 200 if there is already exist a document with the "numeroDecreto" sended', async () => {

			sandbox.stub(DocumentModel.prototype, 'insert');
			sandbox.stub(DocumentModel, 'getOr').resolves(documentGetted);

			const req = mockRequest({
				...fakeData,
				numeroDecreto: documentGetted[0].numeroDecreto
			});
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, {
				message: messageForDocumentWithWxistingDecreeNumber(documentGetted[0].numeroDecreto),
				code: 1
			});
			sandbox.assert.notCalled(DocumentModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(DocumentModel.getOr, { numero: '9', numeroExpediente: '2021', numeroDecreto: '1' });
		});

		it('Should return 200 if there is documents', async () => {

			sandbox.stub(DocumentModel.prototype, 'insert').resolves(fakeId);
			sandbox.stub(DocumentModel, 'getOr').resolves([{ ...documentGetted[0], numero: '90', numeroExpediente: '20212', numeroDecreto: '12' }]);

			const req = mockRequest(fakeData);
			const res = mockResponse();

			await handler(req, res);

			assert.deepStrictEqual(res.status, 200);
			assert.deepStrictEqual(res.json, {
				documentInserted: fakeId.insertedId,
				message: messageForDocumentCreated()
			});
			sandbox.assert.calledOnceWithExactly(DocumentModel.prototype.insert);
			sandbox.assert.calledOnceWithExactly(DocumentModel.getOr, { numero: '9', numeroExpediente: '2021', numeroDecreto: '46' });
		});
	});

	context('When error is returned', () => {

		context('When data is invalid', () => {

			Object.keys(onlyFieldsString).forEach(field => {

				const messageError = { error: `"${field}" must be a string` };
				it(`Should return 400 if the field ${field} is invalid`, async () => {

					sandbox.stub(DocumentModel.prototype, 'insert');
					sandbox.stub(DocumentModel, 'getOr');

					const req = mockRequest({ ...fakeData, [field]: null });
					const res = mockResponse();

					await handler(req, res);

					assert.deepStrictEqual(res.status, 400);
					assert.deepStrictEqual(res.json, messageError);
					sandbox.assert.notCalled(DocumentModel.prototype.insert);
					sandbox.assert.notCalled(DocumentModel.getOr);
				});
			});

			onlyFieldsDate.forEach(field => {

				const messageError = { error: `"${field}" must be a valid date` };
				it(`Should return 400 if the field ${field} is invalid`, async () => {

					sandbox.stub(DocumentModel.prototype, 'insert');
					sandbox.stub(DocumentModel, 'getOr');

					const req = mockRequest({ ...fakeData, [field]: null });
					const res = mockResponse();

					await handler(req, res);

					assert.deepStrictEqual(res.status, 400);
					assert.deepStrictEqual(res.json, messageError);
					sandbox.assert.notCalled(DocumentModel.prototype.insert);
					sandbox.assert.notCalled(DocumentModel.getOr);
				});
			});
		});

		context('When occurs error in database', () => {

			it('Should return 500 if occurs error when insert a document', async () => {

				sandbox.stub(DocumentModel.prototype, 'insert').rejects(new Error('Error in insert'));
				sandbox.stub(DocumentModel, 'getOr').resolves([]);

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in insert', code: -1 });
				sandbox.assert.calledOnceWithExactly(DocumentModel.prototype.insert);
				sandbox.assert.calledOnceWithExactly(DocumentModel.getOr, { numero: '9', numeroExpediente: '2021', numeroDecreto: '46' });
			});

			it('Should return 500 if occurs error when getting documents', async () => {

				sandbox.stub(DocumentModel.prototype, 'insert');
				sandbox.stub(DocumentModel, 'getOr').rejects(new Error('Error in getting'));

				const req = mockRequest(fakeData);
				const res = mockResponse();

				await handler(req, res);

				assert.deepStrictEqual(res.status, 500);
				assert.deepStrictEqual(res.json, { message: 'Error: Error in getting', code: -1 });
				sandbox.assert.notCalled(DocumentModel.prototype.insert);
				sandbox.assert.calledOnceWithExactly(DocumentModel.getOr, { numero: '9', numeroExpediente: '2021', numeroDecreto: '46' });
			});
		});

	});
});
