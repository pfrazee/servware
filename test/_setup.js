var testserver = servware();
local.addServer('test', testserver);

testserver.route('/route/str/([a-z]+)', function(link, method) {
	method('GET', function(req, res) {
		return [200, req.params[0]];
	});
});
testserver.route(/^\/route\/num\/([0-9]+)$/, function(link, method) {
	method('GET', function(req, res) {
		return [200, req.params[0]];
	});
});
testserver.route('/route/tokens/:foo', function(link, method) {
	method('GET', function(req, res) {
		return [200, req.params.foo];
	});
});
testserver.route('/route/tokens/:foo/:bar')
	.method('GET', function(req, res) {
		return [200, req.params.foo + ' & ' + req.params.bar];
	});
testserver.route('/route/tokens/:foo/(group)/:bar', function(link, method) {
	method('GET', function(req, res) {
		return [200, req.params.foo + ' & ' + req.params.bar];
	});
});
testserver.route('/route/middleware', function(link, method) {
	method('GET1',
		function(req, res) {
			req.foo = 'bar';
			return true;
		},
		function(req, res) {
			return [200, req.foo];
		}
	);
	method('GET2',
		function(req, res) {
			var p = local.promise();
			req.foo = 'baz';
			setTimeout(function() { p.fulfill(true); }, 10);
			return p;
		},
		function(req, res) {
			return [200, req.foo];
		}
	);
});
testserver.route('/route/pre-and-post-methods')
	.beforeMethod('GET', function(req) {
		req.foo = 'a';
		return true;
	})
	.method('GET', function(req) {
		req.foo += 'b';
		return true;
	})
	.afterMethod('GET', function(req) {
		req.foo += 'c';
		return [200, req.foo];
	})
	.beforeMethod('GET2', function() {
		return [200, 'this will'];
	})
	// no method() for GET2
	.afterMethod('GET2', function() {
		return [200, 'not work'];
	});

testserver.route('/opts/stream', function(link, method) {
	method('YES', { stream: true }, function(req, res) {
		res.writeHead(200, 'ok', { 'content-type': 'text/plain' });
		res.write('header:'+req.body+';');
		req.body_.then(function(body) {
			res.write('body:'+body);
			res.end();
		});
	});
	method('NO', function(req, res) {
		res.writeHead(200, 'ok', { 'content-type': 'text/plain' });
		res.write('header:'+req.body+';');
		req.body_.then(function(body) {
			res.write('body:'+body);
			res.end();
		});
	});
});

testserver.route('/success', function(link, method) {
	method('GETNUM', function(req, res) { return 204; });
	method('GETARRAY1', function(req, res) { return [200, 'hello, world']; });
	method('GETARRAY2', function(req, res) { return [200, { foo: 'bar' }]; });
	method('GETARRAY3', function(req, res) { return [200, '<h1>hello, world</h1>', { 'content-type': 'text/html' }]; });
	method('GETARRAY4', function(req, res) { return [204]; });
	method('GETOBJ1', function(req, res) { return {status: 204}; });
	method('GETOBJ2', function(req, res) { return {status: 204, reason: 'ok, no content'}; });
	method('GETOBJ3', function(req, res) { return {status: 200, body: 'hello, world'}; });
	method('GETOBJ4', function(req, res) { return {status: 200, body: {foo: 'bar'}}; });
	method('GETOBJ5', function(req, res) { return {status: 200, body: '<h1>hello, world</h1>', headers: { 'content-type': 'text/html' }}; });
	method('GETPROMISE1', function(req, res) {
		var prom = local.promise();
		setTimeout(function() { prom.fulfill(204); }, 1);
		return prom;
	});
	method('GETPROMISE2', function(req, res) {
		var prom = local.promise();
		setTimeout(function() { prom.fulfill([200, 'hello, world']); }, 1);
		return prom;
	});
	method('GETPROMISE3', function(req, res) {
		var prom = local.promise();
		setTimeout(function() { prom.fulfill({status: 200, body: '<h1>hello, world</h1>', headers: { 'content-type': 'text/html' }}); }, 1);
		return prom;
	});
	method('GETMANUAL', function(req, res) {
		res.writeHead(204, 'ok, no content').end();
	});
});

testserver.route('/failure', function(link, method) {
	method('GETNUM', function(req, res) { throw 500; });
	method('GETARRAY1', function(req, res) { throw [500, 'hello, world']; });
	method('GETARRAY2', function(req, res) { throw [500, { foo: 'bar' }]; });
	method('GETARRAY3', function(req, res) { throw [500, '<h1>hello, world</h1>', { 'content-type': 'text/html' }]; });
	method('GETARRAY4', function(req, res) { throw [500]; });
	method('GETOBJ1', function(req, res) { throw {status: 500}; });
	method('GETOBJ2', function(req, res) { throw {status: 500, reason: 'internal error'}; });
	method('GETOBJ3', function(req, res) { throw {status: 500, body: 'hello, world'}; });
	method('GETOBJ4', function(req, res) { throw {status: 500, body: {foo: 'bar'}}; });
	method('GETOBJ5', function(req, res) { throw {status: 500, body: '<h1>hello, world</h1>', headers: { 'content-type': 'text/html' }}; });
	method('GETPROMISE1', function(req, res) {
		var prom = local.promise();
		setTimeout(function() { prom.reject(500); }, 1);
		return prom;
	});
	method('GETPROMISE2', function(req, res) {
		var prom = local.promise();
		setTimeout(function() { prom.reject([500, 'hello, world']); }, 1);
		return prom;
	});
	method('GETPROMISE3', function(req, res) {
		var prom = local.promise();
		setTimeout(function() { prom.reject({status: 500, body: '<h1>hello, world</h1>', headers: { 'content-type': 'text/html' }}); }, 1);
		return prom;
	});
	method('GETMANUAL', function(req, res) {
		res.writeHead(500, 'internal error').end();
	});
});

testserver.route('/reqassert', function(link, method) {
	method('ACCEPT1', function(req, res) {
		req.assert({ accept: 'text/html' });
		return 204;
	});
	method('ACCEPT2', function(req, res) {
		req.assert({ accept: ['text/html', 'application/json'] });
		return 204;
	});
	method('TYPE', function(req, res) {
		req.assert({ type: 'application/json' });
		return 204;
	});
	method('BODY', function(req, res) {
		req.assert({
			body: {
				'string': 'a',
				'number': 'b',
				'boolean': ['c', 'd'],
				'object': ['e', 'f'],
				'notnull': ['e', 'g'],
				'defined': 'h',
				'truthy': ['i', 'j', 'k', 'l']
			}
		});
		return 204;
	});
});

testserver.route('/links')
	.mixinLink('up', { rel: 'via' })
	.link({ href: '/', rel: 'up service', foo: 'bar' })
	.mixinLink('via', { foo: 'bar' })
	.link({ href: '/link', rel: 'self service' })
	.link({ href: 'http://httplocal.com', rel: 'service', title: 'best site in world of web' })
	.method('ROUTELINKS', function(req, res) {
		return 200;
	})
	.method('METHODLINKS1', function(req, res) {
		res.link({ href: '/foo', rel: 'item', title: 'method link' });
		return 200;
	})
	.method('METHODLINKS2', function(req, res) {
		res.link({ href: '/bar', rel: 'item', title: 'method link 1' });
		res.link({ href: '/baz', rel: 'item', title: 'method link 2' });
		return 200;
	})
	.method('MODLINKS1', function(req, res) {
		res.modlinks({ rel: 'service' }, { title: 'All titles are this' });
		res.modlinks({ foo: 'bar' }, { foo: 'baz' });
		return 200;
	})
	.method('MODLINKS2', function(req, res) {
		res.modlinks({ rel: 'service' }, function(link) {
			if (link.foo == 'bar') link.title = 'Just this title is this';
		});
		return 200;
	});

testserver.route('/links/:foo/:bar', function(link, method) {
	link({ href: '/:foo', rel: 'up via service', id: ':foo' });
	link({ href: '/:foo/:bar', rel: 'self item', foo: ':foo', id: ':bar' });
	method('GET', function(req, res) { return 200; });
});

testserver.route('/rel/foo').protocol('stdrel.com/rel', {
	rel: 'test/rel/foo',
	html: '<h1>This is a reltype!</h1>',
	onMixin: function(route, cfg) {
		route.method('GET', function() { return [200, cfg.getMsg]; });
	}
});
testserver.route('/protocol/foo').protocol('test/rel/foo', { getMsg: 'Hello, world' });

servware.protocols.add('somewhere.com/rel/bar', function(route, cfg) {
	route.mixinLink('self', { rel: 'somewhere.com/rel/bar' });
	route.method('GET', function() { return [200, cfg.getHtml, {'Content-Type': 'text/html'}]; });
});
testserver.route('/protocol/bar')
	.link({ href: '/', rel: 'self', title: 'My Bar Protocol' })
	.protocol('somewhere.com/rel/bar', { getHtml: '<h1>Hello, world</h1>' });