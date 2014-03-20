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