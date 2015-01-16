var ErrorHttp = USE('Silex.HttpServerBundle.Error.Http');


var HttpNotFound = function(message, previous) {
	ErrorHttp.call(this, 404, message || null, previous || null, {});
};
HttpNotFound.prototype = Object.create(ErrorHttp.prototype);
HttpNotFound.prototype.constructor = HttpNotFound;


module.exports = HttpNotFound;
