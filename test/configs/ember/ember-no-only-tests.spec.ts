const FIXTURES = {
  itOnly: 'it-only/test.spec.js',
} as const;

describe('ember: sub config `noOnlyTests`', () => {
  describe('basic tests', () => {
    it('creates `ember/no-only-tests` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getConfigByUnPostfix('ember/no-only-tests')).toBeDefined();
    });

    it('does not create `ember/no-only-tests` eslint config when `configNoOnlyTests` is `false`', async () => {
      const configResult = await computeEslintConfig({
        ember: {configTestFiles: {configNoOnlyTests: false}},
      });

      expect(configResult.getConfigByUnPostfix('ember/no-only-tests')).toBeUndefined();
    });

    it('still creates `ember/no-only-tests` eslint config when `configTestFiles` is `false`', async () => {
      const configResult = await computeEslintConfig({ember: {configTestFiles: false}});

      expect(configResult.getConfigByUnPostfix('ember/no-only-tests')).toBeDefined();
    });

    it('creates `ember/no-only-tests` eslint config when `configNoOnlyTests` is `true` explicitly', async () => {
      const configResult = await computeEslintConfig({
        ember: {configTestFiles: {configNoOnlyTests: true}},
      });

      expect(configResult.getConfigByUnPostfix('ember/no-only-tests')).toBeDefined();
    });

    it('has default `files` in `ember/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getConfigByUnPostfix('ember/no-only-tests')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s", "**/*-spec.?([cm])[jt]s", "**/*_spec.?([cm])[jt]s", "**/*.test.?([cm])[jt]s", "**/__tests__/**/*.?([cm])[jt]s", "**/__test__/**/*.?([cm])[jt]s"]',
      );
    });

    it('inherits `files` from `configTestFiles` when provided', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({
        ember: {configTestFiles: {files: FILES}},
      });

      expect(configResult.getConfigByUnPostfix('ember/no-only-tests')?.files).toStrictEqual(FILES);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('ember');

    it('enables `no-only-tests/no-only-tests` rule', () => {
      expect(
        configResult.getRuleEntrySeverity('ember/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(2);
    });

    it('`no-only-tests/no-only-tests` rule fires on focused test', async () => {
      const results = await testEslintConfig('ember', FIXTURES.itOnly, {
        searchFixturesRelativeToPath: import.meta.dirname,
      });

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.itOnly,
        'no-only-tests/no-only-tests',
      );

      expect(error?.message).toMatchInlineSnapshot('"it.only not permitted"');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ember/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          ember: {configTestFiles: {configNoOnlyTests: {files: FILES}}},
        });

        expect(configResult.getConfigByUnPostfix('ember/no-only-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `ember/no-only-tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          ember: {configTestFiles: {configNoOnlyTests: {files: []}}},
        });

        expect(configResult.getConfigByUnPostfix('ember/no-only-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ember/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ember: {configTestFiles: {configNoOnlyTests: {ignores: IGNORES}}},
        });

        const ignores = configResult.getConfigByUnPostfix('ember/no-only-tests')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `ember/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ember: {
          configTestFiles: {
            configNoOnlyTests: {
              overrides: {'no-only-tests/no-only-tests': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('ember/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('ember/no-only-tests', 'no-console')).toBe(0);
    });
  });
});
