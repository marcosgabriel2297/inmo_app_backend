const { MongoClient } = require('mongodb');

if(process.env.TEST_ENVIROMENT === 'false') {

	const uri = process.env.URL_DB;

	// ? Inicialización de cliente Mongo DB
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		if(err)
			throw err;
		else
			console.log('Mongo DB conectado');
	});

	// ? al realizar el llamado a este modulo, se realiza la conexion de mongo y devolver la conexion con la base de datos
	module.exports = client.db(process.env.NAME_DB);

}
