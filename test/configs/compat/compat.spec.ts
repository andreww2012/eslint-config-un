describe('compat config', () => {
  it('should trigger compat rule on fetch API with old browser target', async () => {
    const fixtureFileName = 'fetch-api.js';

    const result = await testEslintConfig(
      {
        compat: {
          settings: {
            targets: ['ie 11'],
          },
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const message = findLintMessageFromLintResults(result, fixtureFileName, 'compat/compat');

    expect(message).toBeDefined();
  });

  it('should not trigger compat rule on widely supported console API', async () => {
    const fixtureFileName = 'console-api.js';

    const result = await testEslintConfig(
      {
        compat: {
          settings: {
            targets: ['ie 11'],
          },
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const message = findLintMessageFromLintResults(result, fixtureFileName, 'compat/compat');

    expect(message).toBeUndefined();
  });
});
