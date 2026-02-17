const FIXTURES = {
  importsWithBlankLine: 'imports-with-blank-line.js',
  importsWithoutBlankLine: 'imports-without-blank-line.js',
  unnecessaryTemplateLiteral: 'unnecessary-template-literal.js',
  doubleQuotedString: 'double-quoted-string.js',
  singleQuotedString: 'single-quoted-string.js',
} as const;

describe('stylistic config', () => {
  it('triggers @stylistic/padding-line-between-statements for blank lines between imports', async () => {
    const results = await testEslintConfig(
      'stylistic',
      FIXTURES.importsWithBlankLine,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.importsWithBlankLine,
      '@stylistic/padding-line-between-statements',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Unexpected blank line before this statement."`);
  });

  it('does not trigger @stylistic/padding-line-between-statements for consecutive imports', async () => {
    const results = await testEslintConfig(
      'stylistic',
      FIXTURES.importsWithoutBlankLine,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.importsWithoutBlankLine,
      '@stylistic/padding-line-between-statements',
    );

    expect(error).toBeUndefined();
  });

  describe('option: `customizeOptions`', () => {
    const RULE_ID = '@stylistic/quotes';

    it('triggers quotes rule for unnecessary template literals by default', async () => {
      const results = await testEslintConfig(
        'stylistic',
        FIXTURES.unnecessaryTemplateLiteral,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unnecessaryTemplateLiteral,
        RULE_ID,
      );

      expect(error?.message).toMatchInlineSnapshot(`"Strings must use singlequote."`);
    });

    it('does not trigger quotes rule for double-quoted strings by default', async () => {
      const results = await testEslintConfig(
        'stylistic',
        FIXTURES.doubleQuotedString,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.doubleQuotedString, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('triggers quotes rule for double-quoted strings when customizeOptions is used', async () => {
      const results = await testEslintConfig(
        {stylistic: {customizeOptions: {}}},
        FIXTURES.doubleQuotedString,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.doubleQuotedString, RULE_ID);

      expect(error?.message).toMatchInlineSnapshot(`"Strings must use singlequote."`);
    });

    it('does not trigger quotes rule for single-quoted strings when customizeOptions is used', async () => {
      const results = await testEslintConfig(
        {stylistic: {customizeOptions: {}}},
        FIXTURES.singleQuotedString,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.singleQuotedString, RULE_ID);

      expect(error).toBeUndefined();
    });
  });
});
