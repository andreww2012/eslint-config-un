// Loading this config is meant to throw, which is exactly what the test asserts on
export default (() => {
  throw new Error('Intentionally broken Nuxt config');
})();
