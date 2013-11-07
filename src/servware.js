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