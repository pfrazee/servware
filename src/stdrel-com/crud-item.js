var protocols = require('../protocols');

// CRUD Item protocol, hosts a manipulable item within a collection
/*
route(...)
	.link({ href: '/my-coll', rel: 'up' })
	.link({ href: '/my-coll/:id', rel: 'self' })
	.protocol('stdrel.com/crud-item', {
		validate: function(item, req, res) {
			var errors = {};
			if (!item.fname) errors.fname = 'Required.';
			if (!item.lname) errors.lname = 'Required.';
			return errors;
		},
		get: function(id, req, res) {
			return myitems[id];
		},
		put: function(id, values, req, res) {
			myitems[id] = {
				id: id,
				fname: values.fname,
				lname: values.lname
			};
		},
		delete: function(id, req, res) {
			delete myitems[id];
		}
	});
*/
protocols.add('stdrel.com/crud-item', function(route, cfg) {
	// Set links
	route.mixinLink('self', { rel: 'stdrel.com/crud-item' });
	route.mixinLink('up', { rel: 'stdrel.com/crud-coll' });

	// Add behaviors
	route.method('GET', function(req, res) {
		// Update links
		res.modlinks({ rel: 'self' }, { id: req.params.id });

		// Validate
		req.assert({ accept: 'application/json' });

		// Add to collection
		return local.promise(cfg.get(req.params.id, req, res)).then(function (fetchedItem) {
			return [200, fetchedItem];
		});
	});
	route.method('PUT', function(req, res) {
		// Update links
		res.modlinks({ rel: 'self' }, { id: req.params.id });

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

		// Update collection
		return local.promise(cfg.put(req.params.id, req.body, req, res) || true).then(function () {
			return 204;
		});
	});
	route.method('DELETE', function(req, res) {
		// Update links
		res.modlinks({ rel: 'self' }, { id: req.params.id });

		// Update collection
		return local.promise(cfg.delete(req.params.id, req, res) || true).then(function () {
			return 204;
		});
	});
});