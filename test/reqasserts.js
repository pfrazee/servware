// == SECTION request assertions

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'ACCEPT1', url: 'httpl://test/reqassert', headers: { accept: 'text/html' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'ACCEPT1', url: 'httpl://test/reqassert', headers: { accept: 'application/json' } });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Not Acceptable", status: 406}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'ACCEPT2', url: 'httpl://test/reqassert', headers: { accept: 'text/html' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'ACCEPT2', url: 'httpl://test/reqassert', headers: { accept: 'application/json' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'ACCEPT2', url: 'httpl://test/reqassert', headers: { accept: 'text/plain' } });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Not Acceptable", status: 406}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'TYPE', url: 'httpl://test/reqassert', headers: { accept: 'application/json' }, body: { foo: 'bar' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'TYPE', url: 'httpl://test/reqassert', headers: { accept: 'text/plain' }, body: 'foobar' });
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "Unsupported Media Type", status: 415}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: 5,
	c: true,
	d: false,
	e: { foo: 'bar' },
	f: null,
	g: 0,
	h: 0,
	i: 1,
	j: 'foo',
	k: { foo: 'bar' },
	l: true
}});
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "No Content", status: 204}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: 5,
	c: true,
	d: false,
	e: { foo: 'bar' },
	f: null,
	g: 0,
	h: 0,
	i: false
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "bad ent - `i` must not be falsey", status: 422}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: 5,
	c: true,
	d: false,
	e: { foo: 'bar' },
	f: null,
	g: 0
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {},
  reason: "bad ent - `h` must not be undefined",
  status: 422
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: 5,
	c: true,
	d: false,
	e: { foo: 'bar' },
	f: null,
	g: null
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {}, reason: "bad ent - `g` must not be null", status: 422}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: 5,
	c: true,
	d: false,
	e: 'foo'
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {},
  reason: "bad ent - `e` must be of type \"object\"",
  status: 422
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: 5,
	c: 'true'
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {},
  reason: "bad ent - `c` must be of type \"boolean\"",
  status: 422
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 'foo',
	b: '5'
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {},
  reason: "bad ent - `b` must be of type \"number\"",
  status: 422
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'BODY', url: 'httpl://test/reqassert', body: {
	a: 1
}});
res.then(printError, printSuccess).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {},
  reason: "bad ent - `a` must be of type \"string\"",
  status: 422
}
*/