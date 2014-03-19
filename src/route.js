var protocols = require('./protocols');

function Route(path, pathTokenMap) {
	this.path = path;
	this.pathTokenMap = pathTokenMap;
	this.links = [];
	this.preMethods = {};
	this.methods = {};
	this.postMethods = {};

	// Set a default HEAD method
	this.method('HEAD', function() { return 204; });
}

// Add a link to all responses in the route
// - linkObj: required object
Route.prototype.link = function(linkObj) {
	this.links.push(linkObj);
	return this;
};

// Add a method to the route
// - method: required string|Array(string), the verb(s)
// - opts: optional object, config options for the method behavior
//   - opts.stream: bool, does not wait for the request to end before handling if true
// - cb*: required functions, the handler functions
Route.prototype.method = function(/*method, opts=null, ...handlers*/) {
	addMethod.call(this, 'methods', Array.prototype.slice.call(arguments));
	return this;
};
// Same as `method`, but adds to the preMethod queue
Route.prototype.beforeMethod = function(/*method, opts=null, ...handlers*/) {
	addMethod.call(this, 'preMethods', Array.prototype.slice.call(arguments));
	return this;
};
// Same as `method`, but adds to the postMethod queue
Route.prototype.afterMethod = function(/*method, opts=null, ...handlers*/) {
	addMethod.call(this, 'postMethods', Array.prototype.slice.call(arguments));
	return this;
};
// Helper to add methods
function addMethod(listName, args) {
	var method = args[0];
	if (Array.isArray(method)) {
		args = args.slice(1);
		method.forEach(function(method) { this.method.apply(this, [method].concat(args)); }.bind(this));
		return this;
	}

	// Extract arguments
	var opts = (typeof args[1] == 'object') ? args[1] : null;
	var handlers = Array.prototype.slice.call(args, opts ? 2 : 1);

	// Mix in options
	for (var k in opts) {
		handlers[k] = opts[k];
	}

	// Add to list
	if (this[listName][method]) {
		this[listName][method].push(handlers);
	} else {
		this[listName][method] = handlers;
	}
	return this;
}

// Add a protocol to the route
// - method: required string|Array(string), the verb(s)
// - opts: optional object, config options for the method behavior
//   - opts.stream: bool, does not wait for the request to end before handling if true
// - cb*: required functions, the handler functions
Route.prototype.protocol = function(reltype, cfg) {
	if (!cfg) { cfg = {}; }
	protocols.get(reltype)(this, cfg);
	return this;
};

module.exports = Route;