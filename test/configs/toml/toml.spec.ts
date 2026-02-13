describe('toml config', () => {
  it('lints .toml files and triggers toml rules', async () => {
    const fixtureFileName = 'wrong-indent.toml';

    const results = await testEslintConfig(
      {
        toml: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const tomlIndentError = findLintMessageFromLintResults(results, fixtureFileName, 'toml/indent');

    expect(tomlIndentError).toBeDefined();
  });

  it('does not trigger toml/indent for valid .toml files', async () => {
    const fixtureFileName = 'correct-indent.toml';

    const results = await testEslintConfig(
      {
        toml: true,
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const tomlIndentError = findLintMessageFromLintResults(results, fixtureFileName, 'toml/indent');

    expect(tomlIndentError).toBeUndefined();
  });
});
