describe('githubActions config', () => {
  it('does not trigger yaml/no-empty-mapping-value for empty trigger events', async () => {
    const results = await testEslintConfig(
      {
        githubActions: true,
      },
      'github-workflow-empty-mapping.yml',
    );

    const yamlNoEmptyMappingError = findLintMessageFromLintResults(
      results,
      'github-workflow-empty-mapping.yml',
      'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeUndefined();
  });
});
