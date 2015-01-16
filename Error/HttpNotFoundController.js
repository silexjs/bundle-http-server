var HttpNotFound = USE('Silex.HttpServerBundle.Error.HttpNotFound');


var HttpNotFoundController = function(controller, file) {
	HttpNotFound.call(this, 'The controller "'+controller.controller+'" does not exist. Path sought: "'+file+'". (config: "'+controller.bundle+':'+controller.controller+':'+controller.action+'")');
};
HttpNotFoundController.prototype = Object.create(HttpNotFound.prototype);
HttpNotFoundController.prototype.constructor = HttpNotFoundController;


module.exports = HttpNotFoundController;
