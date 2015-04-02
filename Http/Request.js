var url = require('url');
var getClientIp = require('request-ip').getClientIp;


var Request = function(req, secure, container) {
	this.req = req;
	this.secure = secure;
	this.container = container;
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
	this.additionalData = {};
	
	this.formidableService = this.container.get('silex.http_server.formidable');
};
Request.prototype = {
	req: null,
	secure: null,
	container: null,
	startTime: null,
	url: null,
	urlParse: null,
	route: null,
	controller: null,
	additionalData: null,
	formidableService: null,
	varPostData: null,
	clientIp: null,
	
	varGet: function(name) {
		if(name === undefined) {
			return this.urlParse.query;
		} else {
			return this.urlParse.query[name];
		}
	},
	varPost: function(cb) {
		var self = this;
		var back = function() {
			if(self.varPostData === null) {
				cb({}, {});
			} else {
				cb(self.varPostData.fields, self.varPostData.files);
			}
		};
		if(this.req.method.toLowerCase() !== 'post') {
			back();
			return;
		}
		if(this.varPostData === null) {
			this.formidableService.parse(this.req, function(err, fields, files) {
				if(self.varPostData !== null) {
					return;
				}
				self.varPostData = {
					files: files,
					fields: fields,
				};
				back();
			});
		} else {
			back();
		}
	},
	
	getHeader: function(key, _default) {
		var _return = this.req.headers[key];
		if(_return !== undefined) {
			return _return;
		}
		return _default;
	},
	
	getClientIp: function() {
		if(this.clientIp !== null) {
			return this.clientIp;
		}
		return this.clientIp = getClientIp(this.req);
	},
};


module.exports = Request;
