describe('compat config', () => {
  it('should trigger compat rule on fetch API with old browser target', async () => {
    const result = await testEslintConfig(
      {
        compat: {
          settings: {
            targets: ['ie 11'],
          },
        },
      },
      'compat-fetch-api.js',
    );

    const message = result
      .find((r) => r.filePath.endsWith('compat-fetch-api.js'))
      ?.messages.find((m) => m.ruleId === 'compat/compat');

    expect(message).toBeDefined();
  });

  it('should not trigger compat rule on widely supported console API', async () => {
    const result = await testEslintConfig(
      {
        compat: {
          settings: {
            targets: ['ie 11'],
          },
        },
      },
      'compat-console-api.js',
    );

    const message = result
      .find((r) => r.filePath.endsWith('compat-console-api.js'))
      ?.messages.find((m) => m.ruleId === 'compat/compat');

    expect(message).toBeUndefined();
  });
});
