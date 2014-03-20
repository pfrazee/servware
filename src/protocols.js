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