import cf from 'cloudfront';

const crypto = require('crypto');

const kvsHandle = cf.kvs();

async function handler(event) {
  const request = event.request;
  const keys = ['first', 'second'];
  const values = [];
  for (let index = 0; index < keys.length; index++) {
    values.push(await kvsHandle.get(keys[index]));
  }

  const signature = crypto.createHmac('sha256', values.join('')).update(request.uri).digest('hex');
  const token = Buffer.from(signature, 'hex').toString('base64url');
  const encoded = new TextEncoder().encode(btoa(token));
  const descriptors = Object.getOwnPropertyDescriptors(request.headers);
  const match = /^\/(?<page>\d+)$/y.exec(request.uri);
  const key = Symbol.for('key');
  const limit = 2 ** 20 + 10_000;
  globalThis.limit = limit;

  console.log(`${encoded.length} ${Object.keys(descriptors).length} ${String(key)}`);
  return match ? {statusCode: 302, headers: {location: {value: match.groups.page}}} : request;
}
