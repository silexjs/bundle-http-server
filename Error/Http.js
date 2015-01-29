var Http = function(statusCode, message, headers) {
	message = message || 'Internal Server Error';
	var e = Error.call(this, message);
	this.message = e.message;
	this.stack = e.stack;
	this.statusCode = statusCode || 500;
	this.headers = headers || {};
};
Http.prototype = Object.create(Error.prototype);
Http.prototype.constructor = Http;

Http.prototype.statusCode = 500;
Http.prototype.headers = {};


module.exports = Http;
