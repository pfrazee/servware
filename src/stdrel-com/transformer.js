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