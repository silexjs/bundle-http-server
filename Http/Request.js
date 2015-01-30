var url = require('url');


var Request = function(req, secure, formidableService) {
	this.req = req;
	this.secure = secure;
	this.startTime = (new Date).getTime();
	
	this.url = (secure===true?'https':'http')+'://'+req.headers.host+req.url;
	this.urlParse = url.parse(this.url, true);
	
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
	
	this.formidableService = formidableService;
};
Request.prototype = {
	req: null,
	secure: null,
	startTime: null,
	url: null,
	urlParse: null,
	route: null,
	controller: null,
	formidableService: null,
	varPostData: null,
	
	varGet: function(name) {
		if(name === undefined) {
			return this.urlParse.query;
		} else {
			return this.urlParse.query[name];
		}
	},
	varPost: function(cb) {
		if(this.req.method.toLowerCase() !== 'post') {
			cb(this.varPostData || {});
			return;
		}
		if(this.varPostData === null) {
			var self = this;
			this.formidableService.parse(this.req, function(err, fields, files) {
				if(err !== null) {
					cb(self.varPostData || {});
					return;
				}
				self.varPostData = {};
				for(var key in files) {
					self.varPostData[key] = files[key];
				}
				for(var key in fields) {
					self.varPostData[key] = fields[key];
				}
				cb(self.varPostData);
			});
		} else {
			cb(this.varPostData);
		}
	},
};


module.exports = Request;
