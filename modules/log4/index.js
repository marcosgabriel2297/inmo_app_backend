const log4js = require('log4js');

log4js.configure({
	appenders: { DT: { type: 'file', filename: 'logs/' + new Date().toISOString().substr(0, 10) + '.log' } },
	categories: { default: { appenders: ['DT'], level: 'all' } }
});

const logger = log4js.getLogger('DT');
/*
logger.trace("Entering cheese testing");
logger.debug("Got cheese.");
logger.info("Cheese is Comté.");
logger.warn("Cheese is quite smelly.");
logger.error("Cheese is too ripe!");
logger.fatal("Cheese was breeding ground for listeria.");
*/

module.exports = {
	trace: v => logger.trace(v),
	info: v => logger.info(v),
	error: v => logger.error(v),
	warn: v => logger.warn(v)
};
