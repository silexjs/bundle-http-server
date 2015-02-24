var Response = function(res, container) {
	this.res = res;
	this.container = container;
};
Response.prototype = {
	res: null,
	container: null,
	
	hasResponse: false,
	
	statusCode: 200,
	content: '',
	
	setHeader: function(name, value) {
		return this.res.setHeader(name, value);
	},
	getHeader: function(name) {
		return this.res.getHeader(name);
	},
	removeHeader: function(name) {
		return this.res.removeHeader(name);
	},
	
	setContentType: function(type) {
		return this.setHeader('Content-Type', type);
	},
};


module.exports = Response;
