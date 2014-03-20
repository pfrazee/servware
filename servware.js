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
// Protocol registry
var reltypes = {};
function getProtocol(type) {
	if (type in reltypes) return reltypes[type];
	throw "Protocol not found for reltype: "+type;
}
function addProtocol(reltype, protocol) {
	reltypes[reltype] = protocol;
}

module.exports = {
	get: getProtocol,
	add: addProtocol
};
},{}],3:[function(require,module,exports){
function mixin(request) {
	Object.defineProperty(request, 'assert', { value: req_assert, enumerable: false });
}

function req_assert(desc) {
	// Acceptable content-type(s)
	if (desc.accept && !local.preferredType(this, desc.accept)) {
		throw 406;
	}
	// Request content-type
	if (desc.type && !Array.isArray(desc.type)) { desc.type = [desc.type]; }
	if (desc.type && desc.type.indexOf(this.headers['content-type']) === -1) {
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
},{}],4:[function(require,module,exports){
function mixin(response) {
	Object.defineProperty(response, 'link', { value: res_link, enumerable: false });
	Object.defineProperty(response, 'modlinks', { value: res_modlinks, enumerable: false });
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

// Queries links in the response and applies a patch to the hits
// - query: required object|Array(object)|string, a valid queryLink() query
// - update required object|function, a map of KVs to update or a function to call on the matching links
function res_modlinks(query, update) {
	var is_function = (typeof update == 'function');
	if (!this.headers.link) { this.headers.link = []; }
	this.headers.link.forEach(function(link) {
		if (local.queryLink(link, query)) {
			if (is_function) {
				update.call(null, link);
			} else {
				for (var k in update) {
					link[k] = update[k];
				}
			}
		}
	});
}

module.exports = mixin;
},{}],5:[function(require,module,exports){
var protocols = require('./protocols');

function Route(path, pathTokenMap) {
	this.path = path;
	this.pathTokenMap = pathTokenMap;
	this.links = [];
	this.linkMixins = [];
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

// Add a link mixin, to decorate links which are added via link()
// - rel: required string, the reltypes to apply this to
// - linkObj: required object
Route.prototype.mixinLink = function(rel, linkObj) {
	this.linkMixins.push([rel, linkObj]);
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
},{"./protocols":2}],6:[function(require,module,exports){
var protocols = require('./protocols');
var Route = require('./route');
var reqMixin = require('./request');
var resMixin = require('./response');
var reasons = require('./http-constants').reasons;

// Define stdrel.com protocols
require('./stdrel-com');

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
		var route;
		for (var i=0; i < routeRegexes.length; i++) {
			var match = routeRegexes[i].exec(req.path);
			if (!match) { continue; }

			// Extract params
			req.params = match.slice(1);
			route = routes[routeRegexes[i]];
			break;
		}

		// 404 if no match
		if (!route) {
			return res.writeHead(404, reasons[404]).end();
		}
		var pathTokenMap = route.pathTokenMap;

		// Match the method
		var methodHandlers = route.methods[req.method];
		if (!methodHandlers) { return res.writeHead(405, reasons[405]).end(); }

		// Add pre/post methods
		if (route.preMethods[req.method]) { methodHandlers = route.preMethods[req.method].concat(methodHandlers); }
		if (route.postMethods[req.method]) { methodHandlers = methodHandlers.concat(route.postMethods[req.method]); }

		// Add tokens to params
		for (var k in pathTokenMap) {
			req.params[pathTokenMap[k]] = req.params[k];
		}

		// Pull route links into response
		if (route.links.length) {
			var links = local.util.deepClone(route.links);
			// Apply mixins
			route.linkMixins.forEach(function(item) {
				var rel = item[0], props = item[1];
				// Find target links
				local.queryLinks(links, { rel: rel }).forEach(function(link) {
					for (var k in props) {
						// Is the value already set?
						if (link[k]) {
							// Combine if it's the rel
							if (k == 'rel') {
								link.rel += ' '+props.rel;
							}
							// otherwise, ignore
						} else {
							// Set
							link[k] = props[k];
						}
					}
				});
			});
			res.setHeader('link', links);
		}

		// Patch serializeHeaders() to replace path tokens
		var orgSeralizeHeaders = res.serializeHeaders;
		Object.defineProperty(res, 'serializeHeaders', { value: function() {
			orgSeralizeHeaders.call(this);
			if (!this.headers.link) return;
			for (var k in pathTokenMap) {
				var token = ':'+pathTokenMap[k];
				this.headers.link = this.headers.link.replace(RegExp(token, 'g'), req.params[k]);
			}
		}, configurable: true });

		// Define post-handler behavior
		function handleReturn (resData) {
			// Go to the next handler if given true (the middleware signal)
			if (resData === true) {
				handlerIndex++;
				if (!methodHandlers[handlerIndex]) {
					console.error('Route handler returned true but no further handlers were available');
					return res.writeHead(500, reasons[500]).end();
				}
				local.promise.lift(function() { return methodHandlers[handlerIndex].apply(route, args); }).always(handleReturn);
			} else {
				// Fill the response, if needed
				if (resData) { writeResponse(res, resData); }
			}
		}

		// If not streaming, wait for body; otherwise, go immediately
		var handlerIndex = 0;
		if (methodHandlers.stream) {
			local.promise.lift(function() {
				// Run the handler
				return methodHandlers[handlerIndex].apply(route, args);
			}).always(handleReturn);
		} else {
			req.body_.then(function() {
				// Run the handler
				return methodHandlers[handlerIndex].apply(route, args);
			}).always(handleReturn);
		}
	};
	serverFn.route = function(path, defineFn) {
		var pathTokenMap = {}; // regex match index -> token name (eg {0: 'section', 1: 'id'})

		var regex;
		if (path instanceof RegExp) {
			regex = path;
		} else {
			// Parse named tokens and create a token map
			path = parsePathTokens(path, pathTokenMap);
			regex = new RegExp('^'+path+'$', 'i');
		}

		// Create the route object
		var route = new Route(path, pathTokenMap);
		routes[regex] = route;
		routeRegexes.push(regex);

		// Call the given definer
		if (defineFn) {
			defineFn.call(route, route.link.bind(route), route.method.bind(route), route.protocol.bind(route));
		}

		return route;
	};
	return serverFn;
}
servware.protocols = protocols;

function writeResponse(res, data) {
	// Standardize data
	var head = [null, null];
	var headers = {};
	var body = undefined;
	if (Array.isArray(data)) {
		head[0] = data[0];
		head[1] = reasons[data[0]] || null;
		body    = data[1];
		headers = data[2] || {};
	}
	else if (typeof data == 'number') {
		head[0] = data;
		head[1] = reasons[data] || null;
	}
	else if (typeof data == 'object' && data) {
		head[0] = data.status;
		head[1] = data.reason || reasons[data.status] || null;
		body    = data.body;
		headers = data.headers || {};
	}
	else {
		throw new Error('Unusuable response given');
	}

	// Set headers on the response object
	for (var k in headers) {
		res.setHeader(k, headers[k]);
	}

	// Set default content-type if needed
	if (typeof body != 'undefined' && !res.headers['content-type']) {
		res.setHeader('content-type', (typeof body == 'string') ? 'text/plain' : 'application/json');
	}

	// Write response
	if (!res.status) {
		res.writeHead.apply(res, head);
	}
	res.end(body);
}

function parsePathTokens(path, tokenMap) {
	// Extract the tokens in their positions within the regex match (less 1, because we drop the first value in the match array)
	var i=0, match, re = /(:([^\/]*))|\(.+\)/g;
	while ((match = re.exec(path))) {
		if (match[0].charAt(0) == ':') { // token or just a regex group?
			tokenMap[i] = match[2]; // map the position to the token name
		}
		i++;
	}
	// Replace tokens with standard path part groups
	return path.replace(/(:[^\/]*)/g, '([^/]*)');
}

(typeof window == 'undefined' ? self : window).servware = servware;
},{"./http-constants":1,"./protocols":2,"./request":3,"./response":4,"./route":5,"./stdrel-com":9}],7:[function(require,module,exports){
var protocols = require('../protocols');

// CRUD Collection protocol, hosts a manipulable collection of data
/*
route(...)
	.link({ href: '/my-coll', rel: 'self', title: 'My Collection' })
	.protocol('stdrel.com/crud-coll', {
		itemUrl: '/my-coll/{id}',
		validate: function(item, req, res) {
			var errors = {};
			if (!item.fname) errors.fname = 'Required.';
			if (!item.lname) errors.lname = 'Required.';
			return errors;
		},
		add: function(item, req, res) {
			var addedItem = {
				id: myitems.length,
				fname: item.fname,
				lname: item.lname,
			};
			myitems.push(addedItem);
			return addedItem;
		}
	});
*/
protocols.add('stdrel.com/crud-coll', function(route, cfg) {
	var itemUrl = cfg.itemUrl || cfg.itemUri;
	var itemUrlTmpl = local.UriTemplate.parse(itemUrl);

	// Set links
	route.mixinLink('self', { rel: 'stdrel.com/crud-coll' });
	route.link({ href: itemUrl, rel: 'item stdrel.com/crud-item' });

	// Add behaviors
	route.method('POST', function(req, res) {
		// Validate
		req.assert({ type: 'application/json' });
		if (!req.body || typeof req.body != 'object') {
			throw [422, { error: 'Body is required.' }];
		}
		if (cfg.validate) {
			var errors = cfg.validate(req.body, req, res);
			if (Object.keys(errors).length > 0) {
				throw [422, { errors: errors }];
			}
		}

		// Add to collection
		return local.promise(cfg.add(req.body, req, res)).then(function (addedItem) {
			var uri = itemUrlTmpl.expand(addedItem);
			res.header('Location', uri);
			return 201;
		});
	});
});
},{"../protocols":2}],8:[function(require,module,exports){
var protocols = require('../protocols');

// CRUD Item protocol, hosts a manipulable item within a collection
/*
route(...)
	.link({ href: '/my-coll/{id}', rel: 'self' })
	.protocol('stdrel.com/crud-item', {
		collUrl: '/my-coll',
		validate: function(item, req, res) {
			var errors = {};
			if (!item.fname) errors.fname = 'Required.';
			if (!item.lname) errors.lname = 'Required.';
			return errors;
		},
		get: function(id, req, res) {
			return myitems[id];
		},
		put: function(id, values, req, res) {
			myitems[id] = {
				id: id,
				fname: values.fname,
				lname: values.lname
			};
		},
		delete: function(id, req, res) {
			delete myitems[id];
		}
	});
*/
protocols.add('stdrel.com/crud-item', function(route, cfg) {
	var collUrl = cfg.collUrl || cfg.collUri;

	// Set links
	route.mixinLink('self', { rel: 'stdrel.com/crud-item' });
	route.link({ href: collUrl, rel: 'up stdrel.com/crud-item' });

	// Add behaviors
	route.method('GET', function(req, res) {
		// Update links
		res.modlinks({ rel: 'self' }, { id: req.params.id });

		// Validate
		req.assert({ accept: 'application/json' });

		// Add to collection
		return local.promise(cfg.get(req.params.id, req, res)).then(function (fetchedItem) {
			return [200, fetchedItem];
		});
	});
	route.method('PUT', function(req, res) {
		// Update links
		res.modlinks({ rel: 'self' }, { id: req.params.id });

		// Validate
		req.assert({ type: 'application/json' });
		if (!req.body || typeof req.body != 'object') {
			throw [422, { error: 'Body is required.' }];
		}
		if (cfg.validate) {
			var errors = cfg.validate(req.body, req, res);
			if (Object.keys(errors).length > 0) {
				throw [422, { errors: errors }];
			}
		}

		// Update collection
		return local.promise(cfg.put(req.params.id, req.body, req, res)).then(function () {
			return 204;
		});
	});
	route.method('DELETE', function(req, res) {
		// Update links
		res.modlinks({ rel: 'self' }, { id: req.params.id });

		// Update collection
		return local.promise(cfg.delete(req.params.id, req, res)).then(function () {
			return 204;
		});
	});
});
},{"../protocols":2}],9:[function(require,module,exports){
require('./rel');
require('./media');
require('./transformer');
require('./crud-coll');
require('./crud-item');
},{"./crud-coll":7,"./crud-item":8,"./media":10,"./rel":11,"./transformer":12}],10:[function(require,module,exports){
var protocols = require('../protocols');

// Media protocol, serves content
/*
route(...).protocol('stdrel.com/media', {
	type: 'text/html',
	content: '<h1>Hello, world</h1>',
});
route(...).protocol('stdrel.com/media', {
	type: 'text/html',
	content: function(req, res) { return '<h1>The time is: '+(new Date())+'</h1>'; }
});
route(...).protocol('stdrel.com/media', {
	type: 'text/html',
	content: function(req, res) { return local.promise(getContentAsync()); }
});
*/
protocols.add('stdrel.com/media', function(route, cfg) {
	// Add reltype
	route.mixinLink('self', { rel: 'stdrel.com/media', type: cfg.type });

	// Add behaviors
	route.method('GET', function(req, res) {
		// Type negotiation
		var type = local.preferredType(req, [cfg.type]);
		if (!type) throw 406;

		// Serve media
		var content = cfg.content;
		if (typeof content == 'function') {
			content = content(req, res);
		}
		return local.promise(content).then(function(content) {
			return [200, content, {'Content-Type': cfg.type}];
		});
	});
});
},{"../protocols":2}],11:[function(require,module,exports){
var protocols = require('../protocols');

// Reltype protocol, adds new protocols
/*
route('/rel/foo')
	.protocol('stdrel.com/rel', {
		rel: 'bar.com/rel/foo',
		onMixin: function(route, cfg) { ... },
		html: '<h1>My Reltype Spec</h1>'
	});
*/
protocols.add('stdrel.com/rel', function(route, cfg) {
	route.mixinLink('self', { rel: 'stdrel.com/rel' });
	if (cfg.rel && cfg.onMixin) {
		protocols.add(cfg.rel, cfg.onMixin);
	}
	if (cfg.html) {
		addHtmlMethod(route, cfg.html);
	}
});

// pulled out to minimize closure
function addHtmlMethod(route, html) {
	route.method('GET', function(req, res) {
		// Check accept header
		var accept = local.preferredType(req, ['text/*']);
		if (!accept) {
			// Not valid? note that fault and let any subsequent methods run
			req.__stdrel_com_rel__badaccept = true;
			return true;
		}
		// Serve the spec
		return [200, html, {'Content-Type': 'text/html'}];
	});
	route.afterMethod('GET', function(req, res) {
		// Did we get here because of a bad accept? throw that error
		if (req.__stdrel_com_rel__badaccept) { throw 406; }
	});
}
},{"../protocols":2}],12:[function(require,module,exports){
var protocols = require('../protocols');

// Stream-transformer protocol, creates stream pipelines
/*
route(...).protocol('stdrel.com/transformer', {
	transform: function(chunk) { return chunk.toUpperCase(); }
});
*/
protocols.add('stdrel.com/transformer', function(route, cfg) {
	// Add reltype
	route.mixinLink('self', { rel: 'stdrel.com/transformer' });
	if (cfg.transform) {
		// Add protocol
		route.method('POST', {stream: true}, function(req, res) {
			req.assert({ type: 'text/plain', accept: 'text/plain' });
			res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
			req.on('data', function(chunk) { res.write(cfg.transform(chunk)); });
			req.on('end',  function()      { res.end(); });
		});
	}
});
},{"../protocols":2}]},{},[6])
;