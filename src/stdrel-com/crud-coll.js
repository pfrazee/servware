var protocols = require('../protocols');

// CRUD Collection protocol, hosts a manipulable collection of data
/*
route(...)
	.link({ href: '/my-coll', rel: 'self', title: 'My Collection' })
	.protocol('stdrel.com/crud-coll', {
		itemUrl: '/my-coll/{id}',
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
	var itemUrl = cfg.itemUrl || cfg.itemUri;
	var itemUrlTmpl = local.UriTemplate.parse(itemUrl);

	// Set links
	route.mixinLink('self', { rel: 'stdrel.com/crud-coll' });
	route.link({ href: itemUrl, rel: 'item stdrel.com/crud-item' });

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
			var uri = itemUrlTmpl.expand(addedItem);
			res.header('Location', uri);
			return 201;
		});
	});
});