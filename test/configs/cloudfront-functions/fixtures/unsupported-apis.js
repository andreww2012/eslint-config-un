function handler(event) {
  console.log('uri:', event.request.uri);
  const headers = Object.create(null, {host: {value: 'example.com'}});
  const promises = [1, 2].map(async (value) => value);
  return [headers, promises];
}
