describe('toml config', () => {
  it('lints .toml files and triggers toml rules', async () => {
    const results = await testEslintConfig(
      {
        toml: true,
      },
      'toml-wrong-indent.toml',
    );

    const tomlIndentError = findLintMessageFromLintResults(
      results,
      'toml-wrong-indent.toml',
      'toml/indent',
    );

    expect(tomlIndentError).toBeDefined();
  });

  it('does not trigger toml/indent for valid .toml files', async () => {
    const results = await testEslintConfig(
      {
        toml: true,
      },
      'toml-correct-indent.toml',
    );

    const tomlIndentError = findLintMessageFromLintResults(
      results,
      'toml-correct-indent.toml',
      'toml/indent',
    );

    expect(tomlIndentError).toBeUndefined();
  });
});
