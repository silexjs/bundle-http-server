var HttpNotFound = USE('Silex.HttpServerBundle.Error.HttpNotFound');


var HttpNotFoundBundle = function(controller) {
	HttpNotFound.call(this, 'The bundle "'+controller.bundle+'" does not exist. (config: "'+controller.bundle+':'+controller.controller+':'+controller.action+'")');
};
HttpNotFoundBundle.prototype = Object.create(HttpNotFound.prototype);
HttpNotFoundBundle.prototype.constructor = HttpNotFoundBundle;


module.exports = HttpNotFoundBundle;
