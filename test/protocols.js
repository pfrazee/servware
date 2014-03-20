// == SECTION protocols

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/rel/foo' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>This is a reltype!</h1>",
  headers: {"content-type": "text/html"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/protocol/foo' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "Hello, world",
  headers: {"content-type": "text/plain"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/protocol/bar' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>Hello, world</h1>",
  headers: {
    "content-type": "text/html",
    link: "</protocol/bar>; rel=\"self somewhere.com/rel/bar\"; title=\"My Bar Protocol\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/protocol/media1' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {
    "content-type": "application/json",
    link: "</protocol/media1>; rel=\"self stdrel.com/media\"; title=\"Media1\"; type=\"application/json\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/protocol/media2' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {
    "content-type": "application/json",
    link: "</protocol/media2>; rel=\"self stdrel.com/media\"; title=\"Media2\"; type=\"application/json\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/protocol/media3' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {
    "content-type": "application/json",
    link: "</protocol/media3>; rel=\"self stdrel.com/media\"; title=\"Media3\"; type=\"application/json\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'POST', url: 'httpl://test/protocol/transformer', body: 'hello, world' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "HELLO, WORLD",
  headers: {
    "content-type": "text/plain",
    link: "</protocol/transformer>; rel=\"self stdrel.com/transformer\"; title=\"ToUppercase Transformer\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'POST', url: 'httpl://test/protocol/crud-coll', body: { fname: 'bob', lname: 'robertson' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</protocol/crud-coll>; rel=\"self stdrel.com/crud-coll\"; title=\"My Collection\", </protocol/crud-coll/{id}>; rel=\"item stdrel.com/crud-item\"",
    location: "/protocol/crud-coll/0"
  },
  reason: "Created",
  status: 201
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'POST', url: 'httpl://test/protocol/crud-coll', body: {} });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{
  body: {errors: {fname: "Required.", lname: "Required."}},
  headers: {
    "content-type": "application/json",
    link: "</protocol/crud-coll>; rel=\"self stdrel.com/crud-coll\"; title=\"My Collection\", </protocol/crud-coll/{id}>; rel=\"item stdrel.com/crud-item\""
  },
  reason: "Unprocessable Entity",
  status: 422
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/protocol/crud-coll/0' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {fname: "bob", id: 0, lname: "robertson"},
  headers: {
    "content-type": "application/json",
    link: "</protocol/crud-coll/0>; rel=\"self stdrel.com/crud-item\"; id=\"0\", </protocol/crud-coll>; rel=\"up stdrel.com/crud-item\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'PUT', url: 'httpl://test/protocol/crud-coll/0', body: { fname: 'alice', lname: 'alicerson' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</protocol/crud-coll/0>; rel=\"self stdrel.com/crud-item\"; id=\"0\", </protocol/crud-coll>; rel=\"up stdrel.com/crud-item\""
  },
  reason: "No Content",
  status: 204
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'PUT', url: 'httpl://test/protocol/crud-coll/0', body: { } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{
  body: {errors: {fname: "Required.", lname: "Required."}},
  headers: {
    "content-type": "application/json",
    link: "</protocol/crud-coll/0>; rel=\"self stdrel.com/crud-item\"; id=\"0\", </protocol/crud-coll>; rel=\"up stdrel.com/crud-item\""
  },
  reason: "Unprocessable Entity",
  status: 422
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'DELETE', url: 'httpl://test/protocol/crud-coll/0' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</protocol/crud-coll/0>; rel=\"self stdrel.com/crud-item\"; id=\"0\", </protocol/crud-coll>; rel=\"up stdrel.com/crud-item\""
  },
  reason: "No Content",
  status: 204
}
*/