var crypto = require('crypto');
var querystring = require('querystring');

var PAGE_REGEX = /^\/(?<page>\d+)$/;

function handler(event) {
  var request = event.request;
  var hash = crypto.createHash('sha256').update(request.uri).digest('hex');
  var query = querystring.stringify({limit: 2 ** 10});
  var match = PAGE_REGEX.exec(request.uri);
  var bytes = hash.toBytes();
  var body;
  try {
    body = JSON.parse(request.uri);
  } catch (error) {
    body = {uri: request.uri};
  }

  globalThis.body = body;
  console.log(`${query} ${bytes.length}`);
  return match ? {statusCode: 302, headers: {location: {value: match.groups.page}}} : request;
}
