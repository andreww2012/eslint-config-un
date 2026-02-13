describe('sonar config', () => {
  it('triggers sonarjs/no-empty-collection for empty collections', async () => {
    const fixtureFileName = 'using-includes-on-empty-array.js';

    const results = await testEslintConfig(
      {
        sonar: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const sonarNoEmptyCollectionError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'sonarjs/no-empty-collection',
    );

    expect(sonarNoEmptyCollectionError).toBeDefined();
  });

  it('does not trigger sonarjs/no-empty-collection for filled collections', async () => {
    const fixtureFileName = 'using-includes-on-non-empty-array.js';

    const results = await testEslintConfig(
      {
        sonar: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const sonarNoEmptyCollectionError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'sonarjs/no-empty-collection',
    );

    expect(sonarNoEmptyCollectionError).toBeUndefined();
  });
});
