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
        '["**/*.spec.?([cm])[jt]s", "**/*-spec.?([cm])[jt]s", "**/*_spec.?([cm])[jt]s", "**/*.test.?([cm])[jt]s", "**/__tests__/**/*.?([cm])[jt]s", "**/__test__/**/*.?([cm])[jt]s"]',
      );
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({eslintPlugin: {configRuleTests: true}});

      expect(configResult.getRuleSeverities('eslint-plugin/rule-tests')).toMatchObject({
        'eslint-plugin/consistent-output': 2,
        'no-empty-function': 0,
      });
    });

    // TODO test rule in action
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
