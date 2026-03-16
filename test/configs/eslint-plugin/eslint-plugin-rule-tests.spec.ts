const getRuleTestsEslintConfig = (configResult: Awaited<ReturnType<typeof computeEslintConfig>>) =>
  configResult
    .getConfigsByUnPostfix((n) => n === 'eslint-plugin')
    .find(({config}) => config.files && config.files.length > 0)?.config;

describe('eslint-plugin: sub config `configRuleTests`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({eslintPlugin: {configRuleTests: true}});

    it('does not create rule tests eslint config by default', async () => {
      const configResult = await computeEslintConfig('eslintPlugin');

      expect(getRuleTestsEslintConfig(configResult)).toBeUndefined();
    });

    it('creates rule tests eslint config when `configRuleTests` is `true`', () => {
      expect(getRuleTestsEslintConfig(configResult)).toBeDefined();
    });

    it('creates rule tests eslint config with default test file `files`', () => {
      expect(getRuleTestsEslintConfig(configResult)?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s", "**/*-spec.?([cm])[jt]s", "**/*_spec.?([cm])[jt]s", "**/*.test.?([cm])[jt]s", "**/__tests__/**/*.?([cm])[jt]s", "**/__test__/**/*.?([cm])[jt]s"]',
      );
    });

    it('has default `ignores` in rule tests eslint config', () => {
      const ignores = getRuleTestsEslintConfig(configResult)?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({eslintPlugin: {configRuleTests: true}});

    it('enables `eslint-plugin/consistent-output` rule in rule tests config', () => {
      expect(
        getRuleSeverityFromEslintRuleEntry(
          getRuleTestsEslintConfig(configResult)?.rules?.['eslint-plugin/consistent-output'],
        ),
      ).toBe(2);
    });

    it('does not enable `eslint-plugin/consistent-output` rule in main config', () => {
      expect(
        configResult.getRuleEntrySeverity('eslint-plugin', 'eslint-plugin/consistent-output'),
      ).toBe(0);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in rule tests eslint config', async () => {
        const FILES = ['src/rules/**/*.spec.js'];
        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {files: FILES}},
        });

        expect(getRuleTestsEslintConfig(configResult)?.files).toStrictEqual(FILES);
      });

      it('disables rule tests eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {files: []}},
        });

        expect(getRuleTestsEslintConfig(configResult)).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in rule tests eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {ignores: IGNORES}},
        });

        const ignores = getRuleTestsEslintConfig(configResult)?.ignores;

        expect(ignores).to.include.members(IGNORES);
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

      expect(
        getRuleSeverityFromEslintRuleEntry(
          getRuleTestsEslintConfig(configResult)?.rules?.['eslint-plugin/consistent-output'],
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          getRuleTestsEslintConfig(configResult)?.rules?.['no-console'],
        ),
      ).toBe(0);
    });

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in rule tests eslint config', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(getRuleTestsEslintConfig(configResult), (ruleName) =>
            ruleName.startsWith('eslint-plugin/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in rule tests eslint config', async () => {
        const configResult = await computeEslintConfig({
          eslintPlugin: {configRuleTests: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(getRuleTestsEslintConfig(configResult), (ruleName) =>
            ruleName.startsWith('eslint-plugin/'),
          ),
        ).toStrictEqual([1]);
      });
    });
  });
});
