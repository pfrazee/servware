// == SECTION linking

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'ROUTELINKS', url: 'httpl://test/links' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</>; rel=\"up via service\"; foo=\"bar\", </link>; rel=\"self service\", <http://grimwire.com>; rel=\"service\"; title=\"best site in world of web\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'METHODLINKS1', url: 'httpl://test/links' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</>; rel=\"up via service\"; foo=\"bar\", </link>; rel=\"self service\", <http://grimwire.com>; rel=\"service\"; title=\"best site in world of web\", </foo>; rel=\"item\"; title=\"method link\""
  },
  reason: "OK",
  status: 200
}
*/

done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'METHODLINKS2', url: 'httpl://test/links' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</>; rel=\"up via service\"; foo=\"bar\", </link>; rel=\"self service\", <http://grimwire.com>; rel=\"service\"; title=\"best site in world of web\", </bar>; rel=\"item\"; title=\"method link 1\", </baz>; rel=\"item\"; title=\"method link 2\""
  },
  reason: "OK",
  status: 200
}
*/


done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'GET', url: 'httpl://test/links/a/b' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</a>; rel=\"up via service\"; id=\"a\", </a/b>; rel=\"self item\"; foo=\"a\"; id=\"b\""
  },
  reason: "OK",
  status: 200
}
*/


done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'MODLINKS1', url: 'httpl://test/links' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</>; rel=\"up via service\"; foo=\"baz\"; title=\"All titles are this\", </link>; rel=\"self service\"; title=\"All titles are this\", <http://grimwire.com>; rel=\"service\"; title=\"All titles are this\""
  },
  reason: "OK",
  status: 200
}
*/


done = false;
startTime = Date.now();
var res = local.dispatch({ method: 'MODLINKS2', url: 'httpl://test/links' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "",
  headers: {
    link: "</>; rel=\"up via service\"; foo=\"bar\"; title=\"Just this title is this\", </link>; rel=\"self service\", <http://grimwire.com>; rel=\"service\"; title=\"best site in world of web\""
  },
  reason: "OK",
  status: 200
}
*/