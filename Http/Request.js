var Request = function(req, secure) {
	this.req = req;
	this.secure = secure;
	
	this.url = (secure===true?'https':'http')+'://'+req.headers.host+req.url;
	
	this.route = {
		found: false,
		type: null,
		name: null,
		variables: {},
		raw: null,
	};
	this.controller = {
		found: false,
		bundle: null,
		controller: null,
		action: null,
	};
};
Request.prototype = {
	req: null,
	secure: null,
	url: null,
	route: null,
	controller: null,
};


module.exports = Request;
