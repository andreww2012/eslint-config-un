const FIXTURES = {
  wrongIndent: 'wrong-indent.toml',
  correctIndent: 'correct-indent.toml',
} as const;

describe('toml config', () => {
  it('lints .toml files and triggers toml rules', async () => {
    const results = await testEslintConfig('toml', FIXTURES.wrongIndent, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.wrongIndent, 'toml/indent');

    expect(error?.message).toMatchInlineSnapshot(`"Expected indentation of 0 spaces but found 1 spaces."`);
  });

  it('does not trigger toml/indent for valid .toml files', async () => {
    const results = await testEslintConfig('toml', FIXTURES.correctIndent, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, FIXTURES.correctIndent, 'toml/indent');

    expect(error).toBeUndefined();
  });
});
