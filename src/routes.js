const glob = require('glob');

module.exports = (app) => {
	glob(`${__dirname}/controller/**/*Routes.js`, {}, (er, files) => {
		if (er) throw er;
        files.forEach((file) => require(file)(app));
	});
};