describe('unicorn config', () => {
  it('triggers unicorn/no-lonely-if for a lonely if inside another if', async () => {
    const fixtureFileName = 'nested-if-without-else.js';

    const results = await testEslintConfig('unicorn', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, fixtureFileName, 'unicorn/no-lonely-if');

    expect(error).toBeDefined();
  });

  it('does not trigger unicorn/no-lonely-if for a combined condition', async () => {
    const fixtureFileName = 'combined-condition.js';

    const results = await testEslintConfig('unicorn', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(results, fixtureFileName, 'unicorn/no-lonely-if');

    expect(error).toBeUndefined();
  });

  describe('option: `enforceTextEncodingCaseAndNotation`', () => {
    const RULE_ID = 'unicorn/text-encoding-identifier-case';

    it('triggers for dashed encoding by default', async () => {
      const fixtureFileName = 'text-encoding-with-dash.js';

      const results = await testEslintConfig('unicorn', fixtureFileName, import.meta.dirname);

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeDefined();
    });

    it('does not trigger for dash-less encoding by default', async () => {
      const fixtureFileName = 'text-encoding-without-dash.js';

      const results = await testEslintConfig('unicorn', fixtureFileName, import.meta.dirname);

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('triggers for dash-less encoding when set to `dash`', async () => {
      const fixtureFileName = 'text-encoding-without-dash.js';

      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: 'dash'}},
        fixtureFileName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeDefined();
    });

    it('does not trigger for dashed encoding when set to `dash`', async () => {
      const fixtureFileName = 'text-encoding-with-dash.js';

      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: 'dash'}},
        fixtureFileName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('does not trigger for dashed encoding when set to `false`', async () => {
      const fixtureFileName = 'text-encoding-with-dash.js';

      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: false}},
        fixtureFileName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('does not trigger for dash-less encoding when set to `false`', async () => {
      const fixtureFileName = 'text-encoding-without-dash.js';

      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: false}},
        fixtureFileName,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, fixtureFileName, RULE_ID);

      expect(error).toBeUndefined();
    });
  });
});
