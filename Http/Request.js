var Request = function(req, secure) {
	this.req = req;
	this.secure = secure;
	
	this.url = (secure===true?'https':'http')+'://'+req.headers.host+req.url;
};
Request.prototype = {
	req: null,
	secure: null,
	url: null,
};


module.exports = Request;
