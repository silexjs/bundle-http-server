var ErrorHttp = USE('Silex.HttpServerBundle.Error.Http');


var HttpNotFound = function(message) {
	message = message || 'Page not found';
	ErrorHttp.call(this, 404, message, {});
};
HttpNotFound.prototype = Object.create(ErrorHttp.prototype);
HttpNotFound.prototype.constructor = HttpNotFound;


module.exports = HttpNotFound;
