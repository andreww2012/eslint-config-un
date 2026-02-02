describe('yaml config', () => {
  it('lints .yaml files and triggers yaml rules', async () => {
    const results = await testEslintConfig(
      {
        yaml: true,
      },
      'yaml-empty-mapping.yaml',
    );

    const yamlNoEmptyMappingError = results[0]?.messages.find(
      (msg) => msg.ruleId === 'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeDefined();
  });

  it('lints .yml files and triggers yaml rules', async () => {
    const results = await testEslintConfig(
      {
        yaml: true,
      },
      'yaml-empty-mapping.yml',
    );

    const yamlNoEmptyMappingError = results[0]?.messages.find(
      (msg) => msg.ruleId === 'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeDefined();
  });
});
