describe('githubActions config', () => {
  it('does not trigger yaml/no-empty-mapping-value for empty trigger events', async () => {
    const fixtureFileName = 'github-workflow-empty-mapping.yml';

    const results = await testEslintConfig(
      {
        githubActions: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const yamlNoEmptyMappingError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeUndefined();
  });
});
