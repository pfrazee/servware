Servware
========

**Server framework for Local.js.** Designed to be a simple, intuitive mapping between HTTPL messages and JS behaviors.

 - Generates responses from returned values, promises, and exceptions.
 - Helps construct "Link directories" (the Link response header)
 - Supports middleware functions
 - Convenient defaults & helpers


## API


### `servware()` => serverFn

Creates a server function which can have behaviors added with the `route()` function.

```javascript
var server = servware();
local.addServer('myserver', server);

server.route('/', function(link, method) {
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
```

<br>
-


### `serverFn.route(path, defineFn)`

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
server.route('/', function(link, method) {
  link({ href: '/', rel: 'self service', title: 'Hello World Server' });

  method('GET', function(req, res) {
    req.assert({ accept: 'text/html' });
    return [200, 'Hello, World', {'Content-Type': 'text/html'}];
  });
});
```

When `route()` is called, it sets up the `path` selector, then calls immediately calls `defineFn()`.

By default, `route()` defines the HEAD method as `function() { return 204; }`. You can override that definition.

<br>
-


### `link(linkObj)`

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


### `method(methodName, [opts], ...handlerFns)`

 - `methodName`: required String
 - `opts`: optional Object
  - `opts.stream`: optional bool, handle the request on arrival (instead of waiting for the request 'end' event)? Default false.
 - `handlerFns`: required Function(req, res), the middleware/handlers.

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


### `req.assert(assertions)`

Checks the request against the given assertions. Throws a failure response on failed assert.

 - `assertions`: required Object
   - `assertions.type`: string|[string], the allowed Content-Type values (fails with 415)
   - `assertions.accept`: string|[string], the allowed Accept values (fails with 406)

<br>
-


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