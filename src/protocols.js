// Protocol registry
var reltypes = {};
function getProtocol(type) {
	if (type in reltypes) return reltypes[type];
	throw "Protocol not found for reltype: "+type;
}
function addProtocol(reltype, protocol) {
	reltypes[reltype] = protocol;
}

// Reltype protocol, adds new protocols
addProtocol('stdrel.com/rel', function(route, cfg) {
	var invalid = true;
	if (cfg.rel && cfg.onMixin) {
		addProtocol(cfg.rel, cfg.onMixin);
		invalid = false;
	}
	if (cfg.html) {
		addHtmlMethod(route, cfg.html);
		invalid = false;
	}
	if (invalid) {
		throw "No applicable stdrel.com/rel config: `{ rel:, onMixin: }` to add a protocol, `{ html: }` to serve html";
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

module.exports = {
	get: getProtocol,
	add: addProtocol
};