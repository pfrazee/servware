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
    link: "</>; rel=\"self somewhere.com/rel/bar\"; title=\"My Bar Protocol\""
  },
  reason: "OK",
  status: 200
}
*/