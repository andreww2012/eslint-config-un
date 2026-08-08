const FIXTURES = {
  testWithOnlyModifier: 'only-modifier/test.spec.js',
} as const;

describe('ava: sub config `noOnlyTests`', () => {
  describe('basic tests', () => {
    it('does not create `ava/no-only-tests` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ava');

      expect(configResult.getConfigByUnPostfix('ava/no-only-tests')).toBeUndefined();
    });

    it('creates `ava/no-only-tests` eslint config when `configNoOnlyTests` is enabled', async () => {
      const configResult = await computeEslintConfig({ava: {configNoOnlyTests: true}});

      expect(configResult.getConfigByUnPostfix('ava/no-only-tests')).toBeDefined();
    });

    it('has default `files` in `ava/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({ava: {configNoOnlyTests: true}});

      expect(configResult.getConfigByUnPostfix('ava/no-only-tests')?.files).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('inherits `files` from parent `ava` config when `configNoOnlyTests` is enabled', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({
        ava: {files: FILES, configNoOnlyTests: true},
      });

      expect(configResult.getConfigByUnPostfix('ava/no-only-tests')?.files).toStrictEqual(FILES);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({ava: {configNoOnlyTests: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('ava/no-only-tests')).toMatchObject({
        'no-only-tests/no-only-tests': 2,
      });
    });

    it('`no-only-tests/no-only-tests` rule fires on focused test', async () => {
      const results = await testEslintConfig(
        {ava: {configNoOnlyTests: true}},
        FIXTURES.testWithOnlyModifier,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.testWithOnlyModifier,
        'no-only-tests/no-only-tests',
      );

      expect(error?.message).toMatchInlineSnapshot('"test.only not permitted"');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ava/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          ava: {configNoOnlyTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('ava/no-only-tests')?.files).toStrictEqual(FILES);
      });

      it('disables `ava/no-only-tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          ava: {configNoOnlyTests: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('ava/no-only-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ava/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ava: {configNoOnlyTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('ava/no-only-tests')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `ava/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ava: {
          configNoOnlyTests: {
            overrides: {'no-only-tests/no-only-tests': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('ava/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('ava/no-only-tests', 'no-console')).toBe(0);
    });
  });
});
