var HttpNotFound = USE('Silex.HttpServerBundle.Error.HttpNotFound');


var HttpNotFoundAction = function(controller) {
	HttpNotFound.call(this, 'The action "'+controller.action+'" of the controller "'+controller.controller+'" does not exist. (config: "'+controller.bundle+':'+controller.controller+':'+controller.action+'")');
};
HttpNotFoundAction.prototype = Object.create(HttpNotFound.prototype);
HttpNotFoundAction.prototype.constructor = HttpNotFoundAction;


module.exports = HttpNotFoundAction;
