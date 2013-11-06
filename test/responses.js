// == SECTION success response generation

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETNUM', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY1', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "hello, world",
  headers: {"content-type": "text/plain"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY2', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {"content-type": "application/json"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY3', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>hello, world</h1>",
  headers: {"content-type": "text/html"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY4', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ1', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ2', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "ok, no content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ3', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "hello, world",
  headers: {"content-type": "text/plain"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ4', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {"content-type": "application/json"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ5', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>hello, world</h1>",
  headers: {"content-type": "text/html"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETPROMISE1', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETPROMISE2', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "hello, world",
  headers: {"content-type": "text/plain"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETPROMISE3', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>hello, world</h1>",
  headers: {"content-type": "text/html"},
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETMANUAL', url: 'httpl://test/success' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "ok, no content", status: 204}
*/

// == SECTION failure response generation

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETNUM', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Internal Server Error", status: 500}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY1', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "hello, world",
  headers: {"content-type": "text/plain"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY2', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {"content-type": "application/json"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY3', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>hello, world</h1>",
  headers: {"content-type": "text/html"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETARRAY4', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Internal Server Error", status: 500}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ1', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Internal Server Error", status: 500}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ2', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "internal error", status: 500}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ3', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "hello, world",
  headers: {"content-type": "text/plain"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ4', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {foo: "bar"},
  headers: {"content-type": "application/json"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETOBJ5', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>hello, world</h1>",
  headers: {"content-type": "text/html"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETPROMISE1', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Internal Server Error", status: 500}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETPROMISE2', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "hello, world",
  headers: {"content-type": "text/plain"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETPROMISE3', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>hello, world</h1>",
  headers: {"content-type": "text/html"},
  reason: "Internal Server Error",
  status: 500
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GETMANUAL', url: 'httpl://test/failure' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "internal error", status: 500}
*/