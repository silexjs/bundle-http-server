var Http = function(statusCode, message, previous, headers) {
	var e = Error.apply(this, message || null);
	this.message = e.message;
	this.stack = e.stack;
	this.statusCode = statusCode || 500;
	this.previous = previous || null;
	this.headers = headers || {};
};
Http.prototype = Object.create(Error.prototype);
Http.prototype.constructor = Http;

Http.prototype.statusCode = 500;
Http.prototype.previous = null;
Http.prototype.headers = {};


module.exports = Http;
