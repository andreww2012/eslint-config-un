import cf from 'cloudfront';

const kvsHandle = cf.kvs();

async function handler(event) {
  const request = event.request;
  let value = 'none';
  try {
    value = await kvsHandle.get(request.uri);
  } catch (error) {
    console.log(`Key ${request.uri} not found`);
  }
  request.headers['x-value'] = {value: value};
  return request;
}
