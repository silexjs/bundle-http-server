var fs = require('fs');
var formidable = require('formidable');


var Formidable = function(kernel, container, config) {
	this.kernel = kernel;
	this.container = container;
	this.config = config;
	this.formidable = formidable;
	this.formidableConfig = {};
};
Formidable.prototype = {
	kernel: null,
	container: null,
	config: null,
	formidable: null,
	formidableConfig: null,
	
	onKernelReady: function(next) {
		var config = this.config.get('http.server.formidable');
		if(config !== undefined) {
			var allowParams = [
				'encoding',
				'uploadDir',
				'keepExtensions',
				'type',
				'maxFieldsSize',
				'maxFields',
				'hash',
				'multiples',
				'bytesReceived',
				'bytesExpected',
			];
			for(var key in config) {
				if(allowParams.indexOf(key) === true) {
					this.formidableConfig[key] = config[key];
				}
			}
		} else {
			config = {};
		}
		if(config.uploadDir === undefined) {
			this.formidableConfig.uploadDir = this.kernel.dir.cache+'/silex.http_server.formidable';
		}
		next();
	},
	
	new: function() {
		return new this.formidable.IncomingForm(this.formidableConfig);
	},
	parse: function(request, cb) {
		var self = this;
		var form = this.new();
		form.on('fileBegin', function() {
			if(fs.existsSync(self.incomingForm.uploadDir) === false) {
				fs.mkdirSync(self.incomingForm.uploadDir);
			}
		});
		return form.parse(request, cb);
	}
};


module.exports = Formidable;
