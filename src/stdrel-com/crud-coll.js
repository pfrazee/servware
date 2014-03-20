var protocols = require('../protocols');

// CRUD Collection protocol, hosts a manipulable collection of data
/*
route(...)
	.link({ href: '/my-coll', rel: 'self', title: 'My Collection' })
	.link({ href: '/my-coll/{id}', rel: 'item' })
	.protocol('stdrel.com/crud-coll', {
		validate: function(item, req, res) {
			var errors = {};
			if (!item.fname) errors.fname = 'Required.';
			if (!item.lname) errors.lname = 'Required.';
			return errors;
		},
		add: function(item, req, res) {
			var addedItem = {
				id: myitems.length,
				fname: item.fname,
				lname: item.lname,
			};
			myitems.push(addedItem);
			return addedItem;
		}
	});
*/
protocols.add('stdrel.com/crud-coll', function(route, cfg) {
	// Get item url
	var itemLink = local.queryLinks(route.links, { rel: 'item' })[0];
	if (!itemLink) throw "Must set a `rel=item` link with a `{id}` URI token.";
	var itemUrl = itemLink.href; console.log(itemUrl);
	var itemUrlTmpl = local.UriTemplate.parse(itemUrl);

	// Set links
	route.mixinLink('self', { rel: 'stdrel.com/crud-coll' });
	route.mixinLink('item', { rel: 'stdrel.com/crud-item' });

	// Add behaviors
	route.method('POST', function(req, res) {
		// Validate
		req.assert({ type: 'application/json' });
		if (!req.body || typeof req.body != 'object') {
			throw [422, { error: 'Body is required.' }];
		}
		if (cfg.validate) {
			var errors = cfg.validate(req.body, req, res);
			if (Object.keys(errors).length > 0) {
				throw [422, { errors: errors }];
			}
		}

		// Add to collection
		return local.promise(cfg.add(req.body, req, res)).then(function (addedItem) {
			var uri = itemUrlTmpl.expand({ id: addedItem.id });
			res.header('Location', uri);
			return 201;
		});
	});
});