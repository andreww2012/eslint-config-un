const FIXTURES = {
  ruleTestWithOnlyModifier: 'rule-test-with-only-modifier.spec.js',
} as const;

describe('eslint-plugin: sub config `ruleTests`', () => {
  describe('basic tests', () => {
    it('does not create `eslint-plugin/rule-tests` eslint config by default', async () => {
      const configResult = await computeEslintConfig('eslintPlugin');

      expect(configResult.getConfigByUnPostfix('eslint-plugin/rule-tests')).toBeUndefined();
    });

    it('creates `eslint-plugin/rule-tests` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({eslintPlugin: {configRuleTests: true}});

      const config = configResult.getConfigByUnPostfix('eslint-plugin/rule-tests');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s", "**/*.test.?([cm])[jt]s", "**/__test?(s)__/**/*.?([cm])[jt]s"]',
      );
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({eslintPlugin: {configRuleTests: true}});

      expect(configResult.getRuleSeverities('eslint-plugin/rule-tests')).toMatchObject({
        'eslint-plugin/consistent-output': 2,
        'eslint-plugin/no-only-tests': 2,
      });
    });

    it('`eslint-plugin/no-only-tests` rule fires on a rule test case with an `only` property', async () => {
      const results = await testEslintConfig(
        {eslintPlugin: {configRuleTests: true}},
        FIXTURES.ruleTestWithOnlyModifier,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.ruleTestWithOnlyModifier,
        'eslint-plugin/no-only-tests',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"The test case property `only` can be used during development, but should not be checked-in, since it prevents all the tests from running."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in rule tests eslint config', async () => {
        const FILES = ['src/rules/**/*.spec.js'];

        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('eslint-plugin/rule-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables rule tests eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('eslint-plugin/rule-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in rule tests eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('eslint-plugin/rule-tests')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in rule tests eslint config', async () => {
      const configResult = await computeEslintConfig({
        eslintPlugin: {
          configRuleTests: {
            overrides: {'eslint-plugin/consistent-output': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('eslint-plugin/rule-tests')).toMatchObject({
        'eslint-plugin/consistent-output': 0,
        'no-console': 0,
      });
    });
  });
});
