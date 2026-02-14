describe('stylistic config', () => {
  it('triggers @stylistic/padding-line-between-statements for blank lines between imports', async () => {
    const fixtureFileName = 'imports-with-blank-line.js';

    const results = await testEslintConfig('stylistic', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      '@stylistic/padding-line-between-statements',
    );

    expect(error).toBeDefined();
  });

  it('does not trigger @stylistic/padding-line-between-statements for consecutive imports', async () => {
    const fixtureFileName = 'imports-without-blank-line.js';

    const results = await testEslintConfig('stylistic', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      '@stylistic/padding-line-between-statements',
    );

    expect(error).toBeUndefined();
  });

  describe('option: `customizeOptions`', () => {
    const RULE_ID = '@stylistic/quotes';

    it('triggers quotes rule for unnecessary template literals by default', async () => {
      const fixtureFileName = 'unnecessary-template-literal.js';

      const results = await testEslintConfig('stylistic', fixtureFileName, import.meta.dirname);

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeDefined();
    });

    it('does not trigger quotes rule for double-quoted strings by default', async () => {
      const fixtureFileName = 'double-quoted-string.js';

      const results = await testEslintConfig('stylistic', fixtureFileName, import.meta.dirname);

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('triggers quotes rule for double-quoted strings when customizeOptions is used', async () => {
      const fixtureFileName = 'double-quoted-string.js';

      const results = await testEslintConfig(
        {stylistic: {customizeOptions: {}}},
        fixtureFileName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeDefined();
    });

    it('does not trigger quotes rule for single-quoted strings when customizeOptions is used', async () => {
      const fixtureFileName = 'single-quoted-string.js';

      const results = await testEslintConfig(
        {stylistic: {customizeOptions: {}}},
        fixtureFileName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeUndefined();
    });
  });
});
