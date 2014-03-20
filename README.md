Servware
========

**Server framework for [Local.js](https://github.com/grimwire/local).** Designed to be a simple, intuitive mapping between HTTPL messages and JS behaviors.

 - Generates responses from returned values, promises, and exceptions.
 - Helps construct "Link directories" (the Link response header)
 - Route construction helpers (protocols, mixins, method stacks)
 - Route middleware

## Examples

A server with `GET html` and `POST json` at `/`:

```javascript
var server = servware();
local.addServer('myserver', server);

server.route('/', function(link, method, protocol) {
  method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  });

  method('POST', function(req, res) {
    req.assert({ type: 'application/json' });
    doSomething(req.body);
    return 204;
  });
});

// Alternatively:

server.route('/')
  .method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  })
  .method('POST', function(req, res) {
    req.assert({ type: 'application/json' });
    doSomething(req.body);
    return 204;
  });
```

A media page with links:

```javascript
server.route('/about')
  .link({ href: '/', rel: 'up via service', title: 'My Server' })
  .link({ href: '/about', rel: 'self stdrel.com/media', type: 'text/html', title: 'About My Server' })
  .method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'It is a server', {'Content-Type': 'text/html'}];
  });
```

A stream transformer via protocols:

 - <a href="http://stdrel.com/transformer">stdrel.com/transformer</a>

```javascript
server.route('/stream/toupper')
  .link({ href: '/', rel: 'up via service', title: 'My Server' })
  .link({ href: '/util/toupper', rel: 'self', id: 'toupper', title: 'ToUppercase Transformer' })
  .protocol('stdrel.com/transformer', {
    transform: function(chunk) { return chunk.toUpperCase(); }
  });
```

A CRUD collection and item via protocols:

 - <a href="http://stdrel.com/crud-coll">stdrel.com/crud-coll</a>
 - <a href="http://stdrel.com/crud-item">stdrel.com/crud-item</a>

```javascript
var users = [];
server.route('/users')
  .link({ href: '/', rel: 'up via service', title: 'My Server' })
  .link({ href: '/users', rel: 'self', title: 'My Server Users', id: 'users' })
  .link({ href: '/users/{id}', rel: 'item' })
  .protocol('stdrel.com/crud-coll', {
    validate: function(item, req, res) {
      var errors = {};
      if (!item.fname) errors.fname = 'Required.';
      if (!item.lname) errors.lname = 'Required.';
      return errors;
    },
    add: function(item, req, res) {
      var addedItem = {
        id: users.length,
        fname: item.fname,
        lname: item.lname,
      };
      users.push(addedItem);
      return addedItem;
    }
  });
server.route('/users/:id')
  .link({ href: '/', rel: 'up via service', title: 'My Server' })
  .link({ href: '/users', rel: 'up', title: 'My Server Users', id: 'users' })
  .link({ href: '/users/:id', rel: 'self' })
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
```

Defining a protocol, using link mixins, and using the after-method stack:

```javascript
servware.protocols.add('stdrel.com/media', function(route, cfg) {
  // Add reltype
  route.mixinLink('self', { rel: 'stdrel.com/media', type: cfg.type });

  // Add behaviors
  route.method('GET', function(req, res) {
    // Type negotiation
    var accept = local.preferredType(req, [cfg.type]);
    if (!accept) {
      // Not valid? note that fault and let any subsequent methods run
      req.__stdrel_com_media__badaccept = true;
      return true;
    }

    // Serve media
    var content = cfg.content;
    if (typeof content == 'function') {
      content = content(req, res);
    }
    return local.promise(content).then(function(content) {
      return [200, content, {'Content-Type': cfg.type}];
    });
  });
  route.afterMethod('GET', function(req, res) {
    // Did we get here because of a bad accept? throw that error
    if (req.__stdrel_com_media__badaccept) { throw 406; }
  });
});
```


## Toplevel API


### `servware()` => serverFn

Creates a server function which can have behaviors added with the `route()` function.

```javascript
var server = servware();
local.addServer('myserver', server);

server.route('/', function(link, method, protocol) {
  method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  });

  method('POST', function(req, res) {
    req.assert({ type: 'application/json' });
    doSomething(req.body);
    return 204;
  });
});

// Alternatively:

server.route('/')
  .method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  })
  .method('POST', function(req, res) {
    req.assert({ type: 'application/json' });
    doSomething(req.body);
    return 204;
  });
```

<br>
-


## Route API


### `serverFn.route(path, defineFn)` => route

Adds a new `path` selector to the server function and calls `defineFn` to set its behaviors.

 - `path`: required string|RegExp
 - `defineFn`: required Function(link, method).

<br>
**Path Rules**

```javascript
// Using regexes:
server.route(/^\/foo$/, fooRoute);
server.route(/^\/foo\/(.*)$/, fooSubRoute);

// Using strings:
server.route('/foo', fooRoute);
server.route('/foo/(.*)', fooSubRoute);

// Using strings and path tokens:
server.route('/foo', fooRoute);
server.route('/foo/:subitem', fooSubRoute);
```

 - If `path` is a string, it will be converted to a RegExp with `new RegExp('^'+path+'$', 'i')`.
 - All matched regexp groups are placed in `req.params`.
 - Path tokens are converted to `([^/]*)`. Their extracted groups are placed on `req.params` using the token name.

<br>
**Defining the Route**

```javascript
server.route('/', function(link, method, protocol) {
  link({ href: '/', rel: 'self service', title: 'Hello World Server' });

  method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  });
});
```

When `route()` is called, it sets up the `path` selector, then calls immediately calls `defineFn()`.

Alternatively, the returned route instance can be used to chain definition functions:

```javascript
server.route('/')
  .link({ href: '/', rel: 'self service', title: 'Hello World Server' })
  .method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  });
```

By default, `route()` defines the HEAD method as `function() { return 204; }`. You can override that definition.

<br>
-


### `route.link(linkObj)`

 - `linkObj`: required Object, a link description

Stores an entry to be used in the Link response-header in the route.

```javascript
server.route('/foo/:subitem', function(link, method) {
  link({ href: '/', rel: 'via service', title: 'Hello World Server' });
  link({ href: '/foo', rel: 'up collection', id: 'foo', title: 'Foo Collection' });
  link({ href: '/foo/:subitem', rel: 'self item', id: ':subitem', title: 'Item :subitem' });

  method('GET', function(req, res) {
    // Will include the 3 links above.
    return [200, req.params.subitem];
  });
});
```

<br>
**Path Tokens**

Any tokens in the `route()` path will be substituted in the Link header response. In the above example, a request to `/foo/bar` would produce a `self` link to `/foo/bar`.

<br>
-


### `route.mixinLink(rel, linkObj)`

 - `rel`: required string, the reltypes to apply this to
 - `linkObj`: required object, the link attributes

Adds a mixin which will decorate links which are added via `route.link()`

```javascript
server.route('/links')
  .mixinLink('up', { rel: 'via' })
  .link({ href: '/', rel: 'up', foo: 'bar' })
  .mixinLink('via', { rel: 'service', foo: 'baz', hello: 'world' })

// produces:
Link: [{ href: '/', rel: 'up via service', foo: 'bar', hello: 'world' }]
```

Mixins are applied before the method handlers are called. If no link is created of the given reltype, the mixin will not be applied. If a non-`rel` attribute collides, the first value set is used.

<br>
-


### `route.method(methodName, [opts], ...handlerFns)`

 - `methodName`: required String
 - `opts`: optional Object
  - `opts.stream`: optional bool, handle the request on arrival (instead of waiting for the request 'end' event)? Default false.
 - `handlerFns`: required Function(req, res), the middleware/handlers.

Places the handlers in the default method queue. Execution through the queue is continued when a true value is returned, and stopped when a response value is returned.

<br>
**Return Values**

```javascript
server.route('/', function(link, method) {
  method('GET', function(req, res) {
    switch (req.query.foo) {
      case 1:
        return 204;
      case 2:
        return [200, 'The Response Body']; // Defaults Content-Type=text/plain
      case 3:
        return [200, {the:'Response Body'}]; // Defaults Content-Type=application/json
      case 4:
        return [200, '<h1>The Response Body</h1>', {'Content-Type': 'text/html'}];
      case 5:
        return {status: 200, reason: 'OK', headers: {'Content-Type': 'text/html'}, body: '<h1>The Response Body</h1>'};
      default:
        throw 400;
  });
});
```

 - Returning or throwing a value constructs a response.
 - Promises can be returned, then fulfilled with values to construct the response.
 - If nothing is returned (undefined), the the `res` object's API should be used to respond.

<br>
**Middleware**

```javascript
server.route('/', function(link, method) {
  function checkPerms(req, res) {
    if (req.header('From') == 'bob')
      throw 403; // nice try, bob
    return true; // continue handling with the next function
  }

  method('GET', checkPerms, function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  });
});
```

 - Returning `true` instructs servware to move on to the next function in the `method` handler list.

<br>
-

### `route.beforeMethod(methodName, ...handlerFns)`

 - `methodName`: required String
 - `handlerFns`: required Function(req, res), the middleware/handlers.

Like `route.method()`, but places the handlers in the "pre-queue" which is executed before the default method queue. Execution through the queues is continued when a true value is returned, and stopped when a response value is returned.

<br>
-

### `route.afterMethod(methodName, ...handlerFns)`

 - `methodName`: required String
 - `handlerFns`: required Function(req, res), the middleware/handlers.

Like `route.method()`, but places the handlers in the "post-queue" which is executed after the default method queue. Execution through the queues is continued when a true value is returned, and stopped when a response value is returned.

<br>
-


## Request API

The following functions are mixed into the Local.js requests:

### `req.assert(assertions)`

Checks the request against the given assertions. Throws a failure response on failed assert.

 - `assertions`: required Object
   - `assertions.type`: string|[string], the allowed Content-Type values (fails with 415)
   - `assertions.accept`: string|[string], the allowed Accept values (fails with 406)

<br>
-


## Response API

The following functions are mixed into the Local.js responses:


### `res.link(linkObj)`

 - `linkObj`: required Object, a link description

Stores an entry to be used in the Link response-header in the method. This differs from the other `link` function in that it only updates the response header for the current request.

```javascript
server.route('/foo/:subitem', function(link, method) {
  link({ href: '/', rel: 'via service', title: 'Hello World Server' });
  link({ href: '/foo', rel: 'up collection', id: 'foo', title: 'Foo Collection' });

  method('GET', function(req, res) {
    var id = req.params.subitem;
    res.link({ href: '/foo/'+id, rel: 'self item', id: id, title: 'Item '+id });
    return [200, req.params.subitem];
  });
});
```

<br>
-


### `res.modlinks(query, mods)`

Queries the Link header of the response and updates the matching links.

 - `query`: required object|[object]|string, fed to [queryLinks](https://grimwire.com/local/#docs/api/querylinks.md)
 - `mods`: required object|function, a map of KVs to update or a function to call on the matching links

```javascript
server.route('/', function(link, method) {
  link({ href: '/', rel: 'up via service', foo: 'bar' });
  link({ href: '/link', rel: 'self service' });
  link({ href: 'http://grimwire.com', rel: 'service', title: 'best site in world of web' });

  method('GET', function(req, res) {
  	res.modlinks({ rel: 'service' }, { title: 'All service titles are this' });
  	res.modlinks({ foo: 'bar' }, function(link) { link.title = 'Except this title'; });
  	return 200;
  });
});
```

<br>
-