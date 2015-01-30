var pa = require('path');
var fs = require('fs');

var Server = USE('Silex.Component.Http.Server');

var Request = USE('Silex.HttpServerBundle.Http.Request');
var Response = USE('Silex.HttpServerBundle.Http.Response');

var ErrorHttp = USE('Silex.HttpServerBundle.Error.Http');
var ErrorHttpNotFound = USE('Silex.HttpServerBundle.Error.HttpNotFound');


var HttpServer = function(kernel, container, dispatcher, config, log) {
	this.kernel = kernel;
	this.container = container;
	this.dispatcher = dispatcher;
	this.config = config;
	this.log = log;
	this.debug = this.kernel.debug;
	this.stats = {
		nRequest: 0,
		averageTime: null,
	};
};
HttpServer.prototype = {
	kernel: null,
	container: null,
	dispatcher: null,
	config: null,
	log: null,
	debug: null,
	stats: null,
	
	console: function(m) {
		this.log.debug('Http.Server', m);
	},
	
	onKernelReady: function(next) {
		this.initServer(this.config.get('http.server'), function() {
			next();
		});
	},
	initServer: function(config, callback) {
		var self = this;
		var server = new Server({
			debug:	this.debug,
			log:	function(m) { self.console(m); },
		});
		this.container.set('http.server', server);
		if(config.defaultCertificate !== undefined && config.defaultCertificate.key !== undefined && config.defaultCertificate.cert !== undefined ) {
			server.addDefaultCertificate(config.defaultCertificate.key, config.defaultCertificate.cert);
		}
		for(var i in config.ports) {
			server.add(config.ports[i]);
		}
		this.dispatcher.dispatch('http.server.config', function() {
			server.addEvent(function(req, res, secure) {
				self.onHttpRequest(req, res, secure);
			});
			server.listen();
			self.dispatcher.dispatch('http.server.ready', function() {
				callback();
			});
		});
	},
	onHttpRequest: function(req, res, secure) {
		if(this.debug === true) {
			this.stats.nRequest++;
			var d = new Date;
			this.console('New request n°'+this.stats.nRequest+' ('+d.toDateString()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds()+' | '+req.method+' '+req.url+')');
		}
		var request = new Request(req, secure, this.container.get('silex.http_server.formidable'));
		var response = new Response(res);
		this.handleRaw(request, response);
	},
	handleRaw: function(request, response) {
		var self = this;
		this.dispatcher.dispatch('http.server.request', [request, response], function(request, response) {
			if(response.hasResponse === true) {
				self.dispatchHttpResponse(request, response);
			} else {
				self.dispatcher.dispatch('http.server.controller', [request, response], function(request, response) {
					try {
						if(response.hasResponse === true) {
							self.dispatchHttpResponse(request, response);
						} else {
							if(request.controller.found === true) {
								var bundle = self.kernel.getBundle(request.controller.bundle);
								if(bundle !== null) {
									var file = pa.resolve(bundle.dir, './Controller/'+request.controller.controller+'Controller.js');
									if(fs.existsSync(file) === true) {
										var controllerClass = require(file);
										if(controllerClass.prototype[request.controller.action+'Action'] !== undefined) {
											var end = function(variables) {
												self.dispatchHttpResponse(request, response);
											};
											var controllerInstance = new controllerClass(self.container, request, response);
											controllerInstance[request.controller.action+'Action'](end, request.route.variables);
										} else {
											throw new Error('The action "'+request.controller.action+'" of the controller "'+request.controller.controller+'" does not exist. (config: "'+request.controller.bundle+':'+request.controller.controller+':'+request.controller.action+'")');
										}
									} else {
										throw new Error('The controller "'+request.controller.controller+'" does not exist. Path sought: "'+file+'". (config: "'+request.controller.bundle+':'+request.controller.controller+':'+request.controller.action+'")');
									}
								} else {
									throw new Error('The bundle "'+request.controller.bundle+'" does not exist. (config: "'+request.controller.bundle+':'+request.controller.controller+':'+request.controller.action+'")');
								}
							} else {
								throw new ErrorHttpNotFound();
							}
						}
					} catch(e) {
						self.handleError(e, request, response);
					}
				}, [self, 'handleError']);
			}
		}, [this, 'handleError']);
	},
	handleError: function(e, request, response) {
		var self = this;
		this.dispatcher.dispatch('http.server.error', [e, request, response], function(e, request, response) {
			self.log.error('Http.Server', self.log.color.redBright(e.message)+"\n"+e.stack+"\n");
			self.dispatchHttpResponse(request, response);
		});
	},
	dispatchHttpResponse: function(request, response) {
		var self = this;
		this.dispatcher.dispatch('http.server.response', [request, response], function(request, response) {
			if(response.hasResponse === false) {
				response.setHeader('Content-Type', 'text/plain');
				response.statusCode = 500;
				response.content = 'Internal server error';
				response.hasResponse = true;
			}
			
			response.res.statusCode = response.statusCode;
			response.res.end(response.content);
			if(self.debug === true) {
				var executionTime = ((new Date).getTime()-request.startTime);
				if(self.stats.averageTime === null) {
					self.stats.averageTime = executionTime;
				} else {
					self.stats.averageTime = ((self.stats.averageTime*(self.stats.nRequest-1))+executionTime)/self.stats.nRequest;
				}
				self.console('End request n°'+self.stats.nRequest+' (this:'+executionTime+'ms|average:'+(Math.round(self.stats.averageTime*10)/10)+'ms)\n');
			}
		});
	},
};


module.exports = HttpServer;
