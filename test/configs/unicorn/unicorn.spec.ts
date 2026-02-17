const FIXTURES = {
  nestedIfWithoutElse: 'nested-if-without-else.js',
  combinedCondition: 'combined-condition.js',
  textEncodingWithDash: 'text-encoding-with-dash.js',
  textEncodingWithoutDash: 'text-encoding-without-dash.js',
} as const;

describe('unicorn config', () => {
  it('triggers unicorn/no-lonely-if for a lonely if inside another if', async () => {
    const results = await testEslintConfig(
      'unicorn',
      FIXTURES.nestedIfWithoutElse,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nestedIfWithoutElse,
      'unicorn/no-lonely-if',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Unexpected \`if\` as the only statement in a \`if\` block without \`else\`."`);
  });

  it('does not trigger unicorn/no-lonely-if for a combined condition', async () => {
    const results = await testEslintConfig(
      'unicorn',
      FIXTURES.combinedCondition,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.combinedCondition,
      'unicorn/no-lonely-if',
    );

    expect(error).toBeUndefined();
  });

  describe('option: `enforceTextEncodingCaseAndNotation`', () => {
    const RULE_ID = 'unicorn/text-encoding-identifier-case';

    it('triggers for dashed encoding by default', async () => {
      const results = await testEslintConfig(
        'unicorn',
        FIXTURES.textEncodingWithDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.textEncodingWithDash, RULE_ID);

      expect(error?.message).toMatchInlineSnapshot(`"Prefer \`utf8\` over \`utf-8\`."`);
    });

    it('does not trigger for dash-less encoding by default', async () => {
      const results = await testEslintConfig(
        'unicorn',
        FIXTURES.textEncodingWithoutDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithoutDash,
        RULE_ID,
      );

      expect(error).toBeUndefined();
    });

    it('triggers for dash-less encoding when set to `dash`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: 'dash'}},
        FIXTURES.textEncodingWithoutDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithoutDash,
        RULE_ID,
      );

      expect(error?.message).toMatchInlineSnapshot(`"Prefer \`utf-8\` over \`utf8\`."`);
    });

    it('does not trigger for dashed encoding when set to `dash`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: 'dash'}},
        FIXTURES.textEncodingWithDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.textEncodingWithDash, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('does not trigger for dashed encoding when set to `false`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: false}},
        FIXTURES.textEncodingWithDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.textEncodingWithDash, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('does not trigger for dash-less encoding when set to `false`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: false}},
        FIXTURES.textEncodingWithoutDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithoutDash,
        RULE_ID,
      );

      expect(error).toBeUndefined();
    });
  });
});
