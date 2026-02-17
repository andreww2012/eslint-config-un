const FIXTURES = {
  emptyMappingYaml: 'empty-mapping.yaml',
  emptyMappingYml: 'empty-mapping.yml',
} as const;

describe('yaml config', () => {
  it('lints .yaml files and triggers yaml rules', async () => {
    const results = await testEslintConfig('yaml', FIXTURES.emptyMappingYaml, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.emptyMappingYaml,
      'yaml/no-empty-mapping-value',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Empty mapping values are forbidden."`);
  });

  it('lints .yml files and triggers yaml rules', async () => {
    const results = await testEslintConfig('yaml', FIXTURES.emptyMappingYml, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.emptyMappingYml,
      'yaml/no-empty-mapping-value',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Empty mapping values are forbidden."`);
  });
});
