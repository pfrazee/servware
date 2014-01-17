function Route(path, pathTokenMap) {
	this.path = path;
	this.pathTokenMap = pathTokenMap;
	this.links = [];
	this.methods = {};

	// Set a default HEAD method
	this.method('HEAD', function() { return 204; });
}

// Add a link to all responses in the route
// - linkObj: required object
Route.prototype.link = function(linkObj) {
	this.links.push(linkObj);
};

// Add a method to the route
// - method: required string|Array(string), the verb(s)
// - opts: optional object, config options for the method behavior
//   - opts.stream: bool, does not wait for the request to end before handling if true
// - cb*: required functions, the handler functions
Route.prototype.method = function() {
	var method = arguments[0];
	if (Array.isArray(method)) {
		var args = Array.prototype.slice.call(arguments, 1);
		method.forEach(function(method) { this.method.apply(this, [method].concat(args)); }.bind(this));
		return;
	}

	// Extract arguments
	var opts = (typeof arguments[1] == 'object') ? arguments[1] : null;
	var hindex = opts ? 2 : 1;
	var handlers = Array.prototype.slice.call(arguments, hindex);

	// Mix in options
	for (var k in opts) {
		handlers[k] = opts[k];
	}
	this.methods[method] = handlers;
};

module.exports = Route;