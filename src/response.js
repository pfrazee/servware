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