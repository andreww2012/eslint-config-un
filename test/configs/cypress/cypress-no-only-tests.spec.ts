describe('cypress: sub config `configNoOnlyTests`', () => {
  describe('basic tests', () => {
    it('creates `cypress/no-only-tests` eslint config by default (`configNoOnlyTests` is enabled by default)', async () => {
      const configResult = await computeEslintConfig('cypress');

      expect(configResult.getConfigByUnPostfix('cypress/no-only-tests')).toBeDefined();
    });

    it('does not create `cypress/no-only-tests` eslint config when `configNoOnlyTests` is disabled', async () => {
      const configResult = await computeEslintConfig({cypress: {configNoOnlyTests: false}});

      expect(configResult.getConfigByUnPostfix('cypress/no-only-tests')).toBeUndefined();
    });

    it('has default `files` in `cypress/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig('cypress');

      expect(
        configResult.getConfigByUnPostfix('cypress/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)", "**/*.cy.?([cm])[jt]s?(x)"]',
      );
    });

    it('inherits `files` from parent `cypress` config when `configNoOnlyTests` is enabled', async () => {
      const FILES = ['e2e/**/*.cy.ts'];
      const configResult = await computeEslintConfig({
        cypress: {files: FILES, configNoOnlyTests: true},
      });

      expect(configResult.getConfigByUnPostfix('cypress/no-only-tests')?.files).toStrictEqual(
        FILES,
      );
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('cypress');

    it('enables `no-only-tests/no-only-tests` rule', () => {
      expect(
        configResult.getRuleEntrySeverity('cypress/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `cypress/no-only-tests` eslint config', async () => {
        const FILES = ['e2e/**/*.cy.ts'];
        const configResult = await computeEslintConfig({
          cypress: {configNoOnlyTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('cypress/no-only-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `cypress/no-only-tests` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          cypress: {configNoOnlyTests: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('cypress/no-only-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `cypress/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          cypress: {configNoOnlyTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('cypress/no-only-tests')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `cypress/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        cypress: {
          configNoOnlyTests: {
            overrides: {'no-only-tests/no-only-tests': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('cypress/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('cypress/no-only-tests', 'no-console')).toBe(0);
    });
  });
});
