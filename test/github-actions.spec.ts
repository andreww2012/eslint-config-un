describe('githubActions config', () => {
  it('does not trigger yaml/no-empty-mapping-value for empty trigger events', async () => {
    const results = await testEslintConfig(
      {
        githubActions: true,
      },
      'github-workflow-empty-mapping.yml',
    );

    const yamlNoEmptyMappingError = results[0]?.messages.find(
      (msg) => msg.ruleId === 'yaml/no-empty-mapping-value',
    );

    expect(yamlNoEmptyMappingError).toBeUndefined();
  });
});
