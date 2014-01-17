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
				// Extract params
				req.pathArgs = match.slice(1);
				var path = routeRegexes[i].path;
				var pathTokenMap = routeRegexes[i].tokenMap;
				var route = routes[path];

				// Match the method
				var methodHandlers = route.methods[req.method];
				if (methodHandlers) {
					// Add tokens to pathArgs
					for (var k in pathTokenMap) {
						req.pathArgs[pathTokenMap[k]] = req.pathArgs[k];
					}

					// Pull route links into response
					if (route.links.length) {
						res.setHeader('link', local.util.deepClone(route.links));
					}

					// Patch serializeHeaders() to replace path tokens
					var orgSeralizeHeaders = res.serializeHeaders;
					Object.defineProperty(res, 'serializeHeaders', { value: function() {
						orgSeralizeHeaders.call(this);
						if (!this.headers.link) return;
						for (var k in pathTokenMap) {
							var token = ':'+pathTokenMap[k];
							this.headers.link = this.headers.link.replace(RegExp(token, 'g'), req.pathArgs[k]);
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
							local.promise(true).then(function() { return methodHandlers[handlerIndex].apply(route, args); }).always(handleReturn);
						} else {
							// Fill the response, if needed
							if (resData) { writeResponse(res, resData); }
						}
					}

					// If not streaming, wait for body; otherwise, go immediately
					var handlerIndex = 0;
					var p = (!methodHandlers.stream) ? req.body_ : local.promise(true);
					p.then(function() {
						// Run the handler
						return methodHandlers[handlerIndex].apply(route, args);
					}).always(handleReturn);
					return;
				} else {
					return res.writeHead(405, reasons[405]).end();
				}
			}
		}
		res.writeHead(404, reasons[404]).end();
	};
	serverFn.route = function(path, defineFn) {
		// Parse named tokens and create a token map
		var pathTokenMap = {}; // regex match index -> token name (eg {0: 'section', 1: 'id'})
		path = parsePathTokens(path, pathTokenMap);

		// Create the regex to do path routing
		var regex = new RegExp('^'+path+'$', 'i');
		regex.path = path; // store so we can find the route on match
		regex.tokenMap = pathTokenMap; // store so we can assign values to tokens on match
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