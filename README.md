Servware
========

A server framework in development for Local.js. If possible, will also support Node.js.

Aiming for something along these lines:

```javascript
var s = new Servware();

s.route('/flock', function(link, method) {
	link({ href: '/', rel: 'service up via' });
	link({ href: '/flock', rel: 'collection self' });
	link({ href: '/flock/new', rel: 'create-form' });
	link({ href: '/flock/{id}', rel: 'item' });

	method('POST', function(req, res) {
		req.assert({
			type: 'application/json',
			accept: 'application/json',
			body: { 'string': ['childBehaviorHref', 'imageSrc'], 'number': 'n' }
		});

		var flock = new Ent.Flock(req.body.childBehaviorHref);
		return flock.createSprites(body)
			.succeed(function() {
				var flockId = ents.add(flock);
				return [201, { id: flockId }, { location: '/flock/'+flockId }];
			})
			.fail(function() { throw 502; });
	});
});

s.route('/flock/new', function(link, method) {
	link({ href: '/', rel: 'service via' });
	link({ href: '/flock', rel: 'collection up' });
	link({ href: '/flock/new', rel: 'create-form self' });
	link({ href: '/flock/{id}', rel: 'item' });

	method('GET', function(req, res) {
		req.assert({ accept: 'text/html' });
		return [200, flockCreateFormHTML];
	});
});

s.route('/flock/:id', function(link, method) {
	link({ href: '/', rel: 'service via' });
	link({ href: '/flock', rel: 'collection up' });
	link({ href: '/flock/{id}', rel: 'item' });

	method('TICK', function(req, res, ctx) {
		res.link({ href: '/flock/'+ctx.id, rel: 'item self' });

		var flock = ents.get(ctx.id);
		if (!flock)
			throw 404;

		return flock.tick(req.query.dT || 1000).then(function() { return 204; }, function() { throw 502; });
	});
});

// Multiple assert example
s.route('/flock', function(link, method) {
	link({ href: '/', rel: 'service up via' });
	link({ href: '/flock', rel: 'collection self' });
	link({ href: '/flock/new', rel: 'create-form' });
	link({ href: '/flock/{id}', rel: 'item' });

	method('GET', function(req, res) {
		try {
			req.assert({ accept: 'application/json' });
			return [200, fooObj];
		} catch (e) {}
		try {
			req.assert({ accept: 'text/html' });
			return [200, fooHtml];
		} catch (e) {}
		throw { code: 406, reason: 'bad accept - must be json or html' };
	});
});
```