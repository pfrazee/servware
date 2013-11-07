// == SECTION method options

done = false;
startTime = Date.now();
var req = new local.Request({ method: 'YES', url: 'httpl://test/opts/stream' });
var res = local.dispatch(req);
res.then(printSuccess, printError).always(finishTest);
setTimeout(function() { req.write('foobar'); req.end(); }, 100);
wait(function () { return done; });

/* =>
success
{
  body: "header:;body:foobar",
  headers: {"content-type": "text/plain"},
  reason: "ok",
  status: 200
}
*/

done = false;
startTime = Date.now();
var req = new local.Request({ method: 'NO', url: 'httpl://test/opts/stream' });
var res = local.dispatch(req);
res.then(printSuccess, printError).always(finishTest);
setTimeout(function() { req.write('foobar'); req.end(); }, 100);
wait(function () { return done; });

/* =>
success
{
  body: "header:foobar;body:foobar",
  headers: {"content-type": "text/plain"},
  reason: "ok",
  status: 200
}
*/