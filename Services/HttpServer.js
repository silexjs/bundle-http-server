var pa = require('path');
var fs = require('fs');

var Server = USE('Silex.Component.Http.Server');
var Request = USE('Silex.HttpServerBundle.Http.Request');
var Response = USE('Silex.HttpServerBundle.Http.Response');
var ErrorHttp = USE('Silex.HttpServerBundle.Error.Http');
var ErrorHttpNotFound = USE('Silex.HttpServerBundle.Error.HttpNotFound');
var ErrorHttpNotFoundBundle = USE('Silex.HttpServerBundle.Error.HttpNotFoundBundle');
var ErrorHttpNotFoundController = USE('Silex.HttpServerBundle.Error.HttpNotFoundController');
var ErrorHttpNotFoundAction = USE('Silex.HttpServerBundle.Error.HttpNotFoundAction');


var HttpServer = function(container, dispatcher) {
	this.container = container;
	this.dispatcher = dispatcher;
	this.debug = this.container.get('kernel').debug;
};
HttpServer.prototype = {
	container: null,
	dispatcher: null,
	
	onKernelReady: function(next) {
		this.initServer(this.container.get('kernel.config').get('http.server'), function() {
			next();
		});
	},
	initServer: function(config, callback) {
		var server = new Server({
			debug:	this.debug,
			log:	function(m) { console.log('HTTP.SERVER: '+m); },
		});
		this.container.set('http.server', server);
		if(config.defaultCertificate !== undefined && config.defaultCertificate.key !== undefined && config.defaultCertificate.cert !== undefined ) {
			server.addDefaultCertificate(config.defaultCertificate.key, config.defaultCertificate.cert);
		}
		for(var i in config.ports) {
			server.add(config.ports[i]);
		}
		var self = this;
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
			var d = new Date;
			console.log('HTTP.SERVER: New request ('+d.toDateString()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds()+': '+req.url+')');
		}
		var request = new Request(req, secure);
		var response = new Response(res);
		this.handleRaw(request, response);
	},
	handleRaw: function(request, response) {
		var self = this;
		this.dispatcher.dispatch('http.server.request', [request, response], function(request, response) {
			if(response.hasResponse === true) {
				self.dispatchHttpResponse(request, response);
			} else {
				var controller = {
					routeName: null,
					route: null,
					variables: {},
					bundle: null,
					controller: null,
					action: null,
				};
				self.dispatcher.dispatch('http.server.resolve_controller', [request, response, controller], function(request, response, controller) {
					try {
						if(response.hasResponse === true) {
							self.dispatchHttpResponse(request, response);
						} else {
							if(controller.routeName !== null) {
								var bundle = self.container.get('kernel').getBundle(controller.bundle);
								if(bundle !== null) {
									var file = pa.join(bundle.dir, './Controller/'+controller.controller+'.js');
									if(fs.existsSync(file) === true) {
										var controllerClass = require(file);
										if(controllerClass.prototype[controller.action] !== undefined) {
											var end = function(variables) {
												self.dispatchHttpResponse(request, response);
											};
											var controllerInstance = new controllerClass(self.container, request, response);
											controllerInstance[controller.action](end, controller.variables);
										} else {
											throw new ErrorHttpNotFoundAction(controller);
										}
									} else {
										throw new ErrorHttpNotFoundController(controller, file);
									}
								} else {
									throw new ErrorHttpNotFoundBundle(controller);
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
			if(response.hasResponse === false && self.debug === true) {
				console.log('----------------------------------------------------------------- ERROR (start)');
				console.log(e.message);
				console.log(e.stack);
				console.log('----------------------------------------------------------------- ERROR (end)');
			}
			self.dispatchHttpResponse(request, response);
		});
	},
	dispatchHttpResponse: function(request, response) {
		this.dispatcher.dispatch('http.server.response', [request, response], function(request, response) {
			if(response.hasResponse === false) {
				response.setHeader('Content-Type', 'text/plain');
				response.statusCode = 500;
				response.content = 'Internal server error';
				response.hasResponse = true;
			}
			
			response.res.statusCode = response.statusCode;
			response.res.end(response.content);
		});
	},
};


module.exports = HttpServer;
