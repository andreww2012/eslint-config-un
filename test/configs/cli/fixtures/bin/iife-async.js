(async () => {
  const result = await Promise.resolve('done');
  console.log(result);
})();
