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
        '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
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
    it('enables `no-only-tests/no-only-tests` rule', async () => {
      const configResult = await computeEslintConfig({
        playwright: {configNoOnlyTests: true},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'playwright/no-only-tests',
          'no-only-tests/no-only-tests',
        ),
      ).toBe(2);
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
