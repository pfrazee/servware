var testserver = servware();
local.addServer('test', testserver);

testserver.route('/success', function(link, method) {
	method('GETNUM', function(req, res) {
		return 204;
	});
	method('GETARRAY1', function(req, res) {
		return [200, 'hello, world'];
	});
	method('GETARRAY2', function(req, res) {
		return [200, { foo: 'bar' }];
	});
	method('GETARRAY3', function(req, res) {
		return [200, '<h1>hello, world</h1>', { 'content-type': 'text/html' }];
	});
	method('GETARRAY4', function(req, res) {
		return [204];
	});
	method('GETOBJ1', function(req, res) {
		return {status: 204};
	});
	method('GETOBJ2', function(req, res) {
		return {status: 204, reason: 'ok, no content'};
	});
	method('GETOBJ3', function(req, res) {
		return {status: 200, body: 'hello, world'};
	});
	method('GETOBJ4', function(req, res) {
		return {status: 200, body: {foo: 'bar'}};
	});
	method('GETOBJ5', function(req, res) {
		return {status: 200, body: '<h1>hello, world</h1>', headers: { 'content-type': 'text/html' }};
	});
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
	method('GETNUM', function(req, res) {
		throw 500;
	});
	method('GETARRAY1', function(req, res) {
		throw [500, 'hello, world'];
	});
	method('GETARRAY2', function(req, res) {
		throw [500, { foo: 'bar' }];
	});
	method('GETARRAY3', function(req, res) {
		throw [500, '<h1>hello, world</h1>', { 'content-type': 'text/html' }];
	});
	method('GETARRAY4', function(req, res) {
		throw [500];
	});
	method('GETOBJ1', function(req, res) {
		throw {status: 500};
	});
	method('GETOBJ2', function(req, res) {
		throw {status: 500, reason: 'internal error'};
	});
	method('GETOBJ3', function(req, res) {
		throw {status: 500, body: 'hello, world'};
	});
	method('GETOBJ4', function(req, res) {
		throw {status: 500, body: {foo: 'bar'}};
	});
	method('GETOBJ5', function(req, res) {
		throw {status: 500, body: '<h1>hello, world</h1>', headers: { 'content-type': 'text/html' }};
	});
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