describe('sonar config', () => {
  it('triggers sonarjs/no-empty-collection for empty collections', async () => {
    const results = await testEslintConfig(
      {
        sonar: true,
      },
      'sonar-empty-collection.js',
    );

    const sonarNoEmptyCollectionError = results[0]?.messages.find(
      (msg) => msg.ruleId === 'sonarjs/no-empty-collection',
    );

    expect(sonarNoEmptyCollectionError).toBeDefined();
  });

  it('does not trigger sonarjs/no-empty-collection for filled collections', async () => {
    const results = await testEslintConfig(
      {
        sonar: true,
      },
      'sonar-filled-collection.js',
    );

    const sonarNoEmptyCollectionError = results[0]?.messages.find(
      (msg) => msg.ruleId === 'sonarjs/no-empty-collection',
    );

    expect(sonarNoEmptyCollectionError).toBeUndefined();
  });
});
