const FIXTURES = {
  fetchApi: 'fetch-api.js',
  consoleApi: 'console-api.js',
} as const;

describe('compat config', () => {
  it('should trigger compat rule on fetch API with old browser target', async () => {
    const result = await testEslintConfig(
      {compat: {settings: {targets: ['ie 11']}}},
      FIXTURES.fetchApi,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(result, FIXTURES.fetchApi, 'compat/compat');

    expect(error?.message).toMatchInlineSnapshot(`"fetch is not supported in IE 11"`);
  });

  it('should not trigger compat rule on widely supported console API', async () => {
    const result = await testEslintConfig(
      {compat: {settings: {targets: ['ie 11']}}},
      FIXTURES.consoleApi,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(result, FIXTURES.consoleApi, 'compat/compat');

    expect(error).toBeUndefined();
  });
});
