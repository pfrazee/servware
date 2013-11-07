function Route(path) {
	this.path = path;
	this.links = [];
	this.methods = {};
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
// - cb: required function, the handler function
Route.prototype.method = function(method, opts, cb) {
	if (!cb && typeof opts == 'function') {
		cb = opts; opts = null;
	}
	// Handle array version
	if (Array.isArray(method)) {
		method.forEach(function(method) { this.method(method, cb, opts); }.bind(this));
		return;
	}
	// Mix in options
	for (var k in opts) {
		cb[k] = opts[k];
	}
	this.methods[method] = cb;
};

module.exports = Route;