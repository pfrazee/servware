;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.reasons = {
    "100": "Continue",
    "101": "Switching Protocols",
    "102": "Processing",
    "200": "OK",
    "201": "Created",
    "202": "Accepted",
    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "207": "Multi-Status",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "307": "Temporary Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Payload Too Large",
    "414": "URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Range Not Satisfiable",
    "417": "Expectation Failed",
    "422": "Unprocessable Entity",
    "423": "Locked",
    "424": "Failed Dependency",
    "426": "Upgrade Required",
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "431": "Request Header Fields Too Large",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Time-out",
    "505": "HTTP Version Not Supported",
    "507": "Insufficient Storage",
    "511": "Network Authentication Required"
};
},{}],2:[function(require,module,exports){
function mixin(request) {
	Object.defineProperty(request, 'assert', { value: req_assert, enumerable: false });
}

function req_assert(desc) {
	// Acceptable content-type(s)
	if (desc.accept && !local.preferredType(this, desc.accept)) {
		throw 406;
	}
	// Request content-type
	if (desc.type && this.headers['content-type'] != desc.type) {
		throw 415;
	}
	if (desc.body) {
		// Make sure a body exists
		if (!this.body) {
			throw { status: 422, reason: 'bad ent - request body required' };
		}

		// Iterate the given validators and run them on each key
		for (var validatorName in desc.body) {
			// Sanity check
			if (!(validatorName in body_validators)) {
				console.error('Invalid body validator', validatorName, 'Available validators:', Object.keys(body_validators));
				continue;
			}

			// Run validator
			var params = asArray(desc.body[validatorName]);
			body_validators[validatorName](this, params);
		}
	}
}

var body_validators = {
	'string':  mkTypeValidator('string'),
	'number':  mkTypeValidator('number'),
	'boolean': mkTypeValidator('boolean'),
	'object':  mkTypeValidator('object'),
	'notnull': function(req, params) {
		params.forEach(function(param) {
			if (req.body[param] === null) {
				throw { status: 422, reason: 'bad ent - `'+param+'` must not be null' };
			}
		});
	},
	'defined': function(req, params) {
		params.forEach(function(param) {
			if (typeof req.body[param] == 'undefined') {
				throw { status: 422, reason: 'bad ent - `'+param+'` must not be undefined' };
			}
		});
	},
	'truthy': function(req, params) {
		params.forEach(function(param) {
			if (!req.body[param]) {
				throw { status: 422, reason: 'bad ent - `'+param+'` must not be falsey' };
			}
		});
	}
};

function mkTypeValidator(type) {
	return function(req, params) {
		params.forEach(function(param) {
			if (typeof req.body[param] != type) {
				throw { status: 422, reason: 'bad ent - `'+param+'` must be of type "'+type+'"' };
			}
		});
	};
}

function asArray(v) {
	return Array.isArray(v) ? v : [v];
}

module.exports = mixin;
},{}],3:[function(require,module,exports){
function mixin(response) {
	Object.defineProperty(response, 'link', { value: res_link, enumerable: false });
}

// Adds a link to the response
// - linkObj: required object|Array(object)
function res_link(linkObj) {
	// Handle array version
	if (Array.isArray(linkObj)) {
		linkObj.forEach(function(link) { this.link(link); }.bind(this));
		return;
	}

	// Add link
	if (!this.headers.link) { this.headers.link = []; }
	this.headers.link.push(linkObj);
}

module.exports = mixin;
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var Route = require('./route');
var reqMixin = require('./request');
var resMixin = require('./response');
var reasons = require('./http-constants').reasons;

function servware() {
	var routes = {};
	var routeRegexes = [];
	var serverFn = function() {
		var args = Array.prototype.slice.call(arguments);
		var req = args[0], res = args[1];

		// Mixin request and response additions
		reqMixin(req);
		resMixin(res);

		// Match the path
		for (var i=0; i < routeRegexes.length; i++) {
			var match = routeRegexes[i].exec(req.path);
			if (match) {
				// Match the method
				req.pathArgs = match.slice(1);
				var path = routeRegexes[i].path;
				var route = routes[path];
				var methodHandler = route.methods[req.method];
				if (methodHandler) {
					// Pull route links into response
					if (route.links.length) {
						res.setHeader('link', route.links.slice(0));
					}
					// If not streaming, wait for body; otherwise, go immediately
					var p = (!methodHandler.stream) ? req.body_ : local.promise(true);
					p.then(function() {
						// Run the handler
						return methodHandler.apply(route, args);
					}).always(function (resData) {
						// Fill the response, if needed
						if (resData) { writeResponse(res, resData); }
					});
					return;
				} else {
					return res.writeHead(405, reasons[405]).end();
				}
			}
		}
		res.writeHead(404, reasons[404]).end();
	};
	serverFn.route = function(path, defineFn) {
		// Create the regex to do path routing
		var regex = new RegExp('^'+path+'$', 'i');
		regex.path = path; // store so we can find the route on match
		routeRegexes.push(regex);

		// Create the route object
		var route = new Route(path);
		routes[path] = route;

		// Call the given definer
		defineFn.call(route, route.link.bind(route), route.method.bind(route));
	};
	return serverFn;
}

function writeResponse(res, data) {
	// Standardize data
	var head = [null, null, null];
	var body = undefined;
	if (Array.isArray(data)) {
		head[0] = data[0];
		head[1] = reasons[data[0]] || null;
		body    = data[1];
		head[2] = data[2] || {};
	}
	else if (typeof data == 'number') {
		head[0] = data;
		head[1] = reasons[data] || null;
		head[2] = {};
	}
	else if (typeof data == 'object' && data) {
		head[0] = data.status;
		head[1] = data.reason || reasons[data.status] || null;
		body    = data.body;
		head[2] = data.headers || {};
	}
	else {
		throw new Error('Unusuable response given');
	}

	// Set default content-type ifneeded
	if (typeof body != 'undefined' && !head[2]['content-type']) {
		head[2]['content-type'] = (typeof body == 'string') ? 'text/plain' : 'application/json';
	}

	// Write response
	res.writeHead.apply(res, head);
	res.end(body);
}

window.servware = servware;
},{"./http-constants":1,"./request":2,"./response":3,"./route":4}]},{},[5])
;