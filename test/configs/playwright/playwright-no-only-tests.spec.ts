const FIXTURES = {
  testWithOnlyModifier: 'only-modifier/test.spec.js',
} as const;

describe('playwright: sub config `noOnlyTests`', () => {
  describe('basic tests', () => {
    it('does not create `playwright/no-only-tests` eslint config by default (`configNoOnlyTests` is disabled by default)', async () => {
      const configResult = await computeEslintConfig('playwright');

      expect(configResult.getConfigByUnPostfix('playwright/no-only-tests')).toBeUndefined();
    });

    it('creates `playwright/no-only-tests` eslint config when `configNoOnlyTests` is enabled', async () => {
      const configResult = await computeEslintConfig({
        playwright: {configNoOnlyTests: true},
      });

      expect(configResult.getConfigByUnPostfix('playwright/no-only-tests')).toBeDefined();
    });

    it('has default `files` in `playwright/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        playwright: {configNoOnlyTests: true},
      });

      expect(
        configResult.getConfigByUnPostfix('playwright/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('inherits `files` from parent `playwright` config when `configNoOnlyTests` is enabled', async () => {
      const FILES = ['e2e/**/*.spec.ts'];

      const configResult = await computeEslintConfig({
        playwright: {files: FILES, configNoOnlyTests: true},
      });

      expect(configResult.getConfigByUnPostfix('playwright/no-only-tests')?.files).toStrictEqual(
        FILES,
      );
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        playwright: {configNoOnlyTests: true},
      });

      expect(configResult.getRuleSeverities('playwright/no-only-tests')).toMatchObject({
        'no-only-tests/no-only-tests': 2,
      });
    });

    it('`no-only-tests/no-only-tests` rule fires on a test with the `.only` modifier', async () => {
      const results = await testEslintConfig(
        {playwright: {configNoOnlyTests: true}},
        FIXTURES.testWithOnlyModifier,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.testWithOnlyModifier,
        'no-only-tests/no-only-tests',
      );

      expect(error?.message).toMatchInlineSnapshot('"describe.only not permitted"');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `playwright/no-only-tests` eslint config', async () => {
        const FILES = ['e2e/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          playwright: {configNoOnlyTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('playwright/no-only-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `playwright/no-only-tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          playwright: {configNoOnlyTests: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('playwright/no-only-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `playwright/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          playwright: {configNoOnlyTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('playwright/no-only-tests')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `playwright/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        playwright: {
          configNoOnlyTests: {
            overrides: {'no-only-tests/no-only-tests': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'playwright/no-only-tests',
          'no-only-tests/no-only-tests',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('playwright/no-only-tests', 'no-console')).toBe(0);
    });
  });
});
