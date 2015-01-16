var RedirectResponse = function(request, response) {
	this.request = request;
	this.response = response;
};
RedirectResponse.prototype = {
	request: null,
	response: null,
	
	redirect: function(url, status) {
		var status = status || 302;
		
		this.response.setContentType('text/html');
		this.response.content  = '<!DOCTYPE html>';
		this.response.content += '<html>';
		this.response.content += '<head>';
		this.response.content += '	<meta charset="UTF-8">';
		this.response.content += '	<meta http-equiv="refresh" content="1;url='+url+'">';
		this.response.content += '	<title>Redirecting to '+url+'</title>';
		this.response.content += '</head>';
		this.response.content += '<body>';
		this.response.content += '	Redirecting to <a href="'+url+'">'+url+'</a>.';
		this.response.content += '</body>';
		this.response.content += '</html>';
		this.response.statusCode = status;
		this.response.hasResponse = true;
	},
};


module.exports = RedirectResponse;
