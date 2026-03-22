const FIXTURES = {
  onlyTest: 'only-test/test.spec.js',
} as const;

describe('mocha: sub config `noOnlyTests`', () => {
  describe('basic tests', () => {
    it('creates `mocha/no-only-tests` eslint config by default', async () => {
      const configResult = await computeEslintConfig('mocha');

      expect(configResult.getConfigByUnPostfix('mocha/no-only-tests')).toBeDefined();
    });

    it('does not create `mocha/no-only-tests` eslint config when `configNoOnlyTests` is disabled', async () => {
      const configResult = await computeEslintConfig({mocha: {configNoOnlyTests: false}});

      expect(configResult.getConfigByUnPostfix('mocha/no-only-tests')).toBeUndefined();
    });

    it('has default `files` in `mocha/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig('mocha');

      expect(configResult.getConfigByUnPostfix('mocha/no-only-tests')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('inherits `files` from parent `mocha` config when `configNoOnlyTests` is enabled', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({
        mocha: {files: FILES, configNoOnlyTests: true},
      });

      expect(configResult.getConfigByUnPostfix('mocha/no-only-tests')?.files).toStrictEqual(FILES);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('mocha');

    it('enables `no-only-tests/no-only-tests` rule', () => {
      expect(
        configResult.getRuleEntrySeverity('mocha/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(2);
    });

    it('`no-only-tests/no-only-tests` rule fires when `it.only` is used', async () => {
      const results = await testEslintConfig(
        {mocha: {configNoOnlyTests: true}},
        FIXTURES.onlyTest,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.onlyTest,
        'no-only-tests/no-only-tests',
      );

      expect(error?.message).toMatchInlineSnapshot(`"it.only not permitted"`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `mocha/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];
        const configResult = await computeEslintConfig({
          mocha: {configNoOnlyTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('mocha/no-only-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `mocha/no-only-tests` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          mocha: {configNoOnlyTests: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('mocha/no-only-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `mocha/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          mocha: {configNoOnlyTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('mocha/no-only-tests')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `mocha/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mocha: {
          configNoOnlyTests: {
            overrides: {'no-only-tests/no-only-tests': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('mocha/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('mocha/no-only-tests', 'no-console')).toBe(0);
    });
  });
});
