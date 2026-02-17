const FIXTURES = {
  githubWorkflowEmptyMapping: 'github-workflow-empty-mapping.yml',
} as const;

describe('githubActions config', () => {
  it('does not trigger yaml/no-empty-mapping-value for empty trigger events', async () => {
    const results = await testEslintConfig(
      'githubActions',
      FIXTURES.githubWorkflowEmptyMapping,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.githubWorkflowEmptyMapping,
      'yaml/no-empty-mapping-value',
    );

    expect(error).toBeUndefined();
  });
});
