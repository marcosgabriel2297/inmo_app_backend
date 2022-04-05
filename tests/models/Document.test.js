const assert = require('assert');
const DocumentModel = require('../../src/models/Document');

const compareData = (model, data) => {

	assert.deepStrictEqual(model.numero, data.numero);
	assert.deepStrictEqual(model.serie, data.serie);
	assert.deepStrictEqual(model.anioSancion, data.anioSancion);
	assert.deepStrictEqual(model.fechaSancion, data.fechaSancion);
	assert.deepStrictEqual(model.numeroExpediente, data.numeroExpediente);
	assert.deepStrictEqual(model.numeroDecreto, data.numeroDecreto);
	assert.deepStrictEqual(model.anioPromulgacion, data.anioPromulgacion);
	assert.deepStrictEqual(model.tipoLegislacion, data.tipoLegislacion);
	assert.deepStrictEqual(model.fechaPromulgacion, data.fechaPromulgacion);
	assert.deepStrictEqual(model.fechaBoletin, data.fechaBoletin);
	assert.deepStrictEqual(model.numeroBoletin, data.numeroBoletin);
	assert.deepStrictEqual(model.asunto, data.asunto);
	assert.deepStrictEqual(model.area, data.area);
	assert.deepStrictEqual(model.aclaraciones, data.aclaraciones);
	assert.deepStrictEqual(model.isPDF, data.isPDF);
	assert.deepStrictEqual(model.savePath, data.savePath);
	assert.deepStrictEqual(model.palabrasClave, data.palabrasClave);
};

describe('Test Document Model', () => {

	beforeEach(() => { process.env.TEST_ENVIROMENT = true; });

	const data = {
		numero: 3,
		serie: 1,
		anioSancion: '2015',
		fechaSancion: new Date(2015, 11, 17),
		numeroExpediente: '200',
		numeroDecreto: '300',
		anioPromulgacion: '2018',
		tipoLegislacion: 'fakeLegislation',
		fechaPromulgacion: new Date(2018, 9, 12),
		fechaBoletin: new Date(),
		numeroBoletin: '3',
		asunto: 'un asunto demasiado importante',
		area: 'Salud',
		aclaraciones: 'Esto es un test bien copado',
		isPDF: true,
		palabrasClave: ['covid', 'vacunacion', 'otraPalabra']
	};

	it('Create Document Model', async () => {

		const documentModel = new DocumentModel(data);
		compareData(documentModel, data);
	});

	it('Should return "documents" when execute the collection function', () => {

		const { collection } = DocumentModel;
		assert.deepStrictEqual(collection, 'documents');
	});

	it('Should return "documents" when execute the collection instantiated function', () => {

		const voiceModel = new DocumentModel(data);
		const { collection } = voiceModel;

		assert.deepStrictEqual(collection, 'documents');
	});

	it('Should return an instantiated object when execute the "instantiate" function', () => {
		const user = DocumentModel.instantiate(data);

		compareData(user, data);
	});
});
