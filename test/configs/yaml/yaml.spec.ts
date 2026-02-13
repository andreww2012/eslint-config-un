describe('yaml config', () => {
  it('lints .yaml files and triggers yaml rules', async () => {
    const fixtureFileName = 'empty-mapping.yaml';

    const results = await testEslintConfig(
      {
        yaml: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const yamlNoEmptyMappingError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeDefined();
  });

  it('lints .yml files and triggers yaml rules', async () => {
    const fixtureFileName = 'empty-mapping.yml';

    const results = await testEslintConfig(
      {
        yaml: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const yamlNoEmptyMappingError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeDefined();
  });
});
