const FIXTURES = {
  testWithOnlyModifier: 'only-modifier/test.spec.js',
} as const;

describe('cypress: sub config `noOnlyTests`', () => {
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
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.cy.?([cm])[jt]s?(x)"]',
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

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('cypress/no-only-tests')).toMatchObject({
        'no-only-tests/no-only-tests': 2,
      });
    });

    it('`no-only-tests/no-only-tests` rule fires on a test with the `.only` modifier', async () => {
      const results = await testEslintConfig(
        'cypress',
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
      it('uses user-provided `files` in `cypress/no-only-tests` eslint config', async () => {
        const FILES = ['e2e/**/*.cy.ts'];

        const configResult = await computeEslintConfig({
          cypress: {configNoOnlyTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('cypress/no-only-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `cypress/no-only-tests` eslint config when set to empty array', async () => {
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

        expect(ignores).toIncludeAllMembers(IGNORES);
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
