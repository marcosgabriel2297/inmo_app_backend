const jwt = require('jsonwebtoken');

function jwtAuth(req, res, next) {

	if(req.headers.authorization) {
		try {
			const token = req.headers.authorization.replace('Bearer ', '');

			try {
				const verify = jwt.verify(token, process.env.KEY_PRELOGIN);

				if(!verify.isAdmin)
					throw new Error('no se obtuvo admin');

				req.jwt = verify;
				next();
			} catch(error) {

				res.status(401).json({
					message: 'Error: invalid token',
					code: -1
				});
			}

		} catch(error) {

			res.status(401).json({
				message: 'Error: invalid token',
				code: -1
			});
		}
	} else {
		res.status(401).json({
			message: 'Error: no token provided',
			code: 1
		});
	}
}

module.exports = jwtAuth;
