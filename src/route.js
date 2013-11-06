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
// - cb: required function, the handler function
// - opts: optional object, config options for the method behavior
Route.prototype.method = function(method, cb, opts) {
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