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