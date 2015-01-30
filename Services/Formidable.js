var fs = require('fs');
var formidable = require('formidable');


var Formidable = function(kernel, container, config, log) {
	this.kernel = kernel;
	this.container = container;
	this.config = config;
	this.log = log;
};
Formidable.prototype = {
	kernel: null,
	container: null,
	config: null,
	log: null,
	incomingForm: null,
	
	onKernelReady: function(next) {
		this.incomingForm = new formidable.IncomingForm;
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
					this.incomingForm[key] = config[key];
				}
			}
		} else {
			config = {};
		}
		if(config.uploadDir === undefined) {
			this.incomingForm.uploadDir = this.kernel.dir.cache+'/silex.http_server.formidable';
		}
		var self = this;
		this.incomingForm.on('fileBegin', function() {
			if(fs.existsSync(self.incomingForm.uploadDir) === false) {
				fs.mkdirSync(self.incomingForm.uploadDir);
			}
		});
		next();
	},
	
	parse: function(request, cb) {
		return this.incomingForm.parse(request, cb);
	}
};


module.exports = Formidable;
