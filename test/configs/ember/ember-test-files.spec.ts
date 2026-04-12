const FIXTURES = {
  // `ember/no-pause-test` uses emberUtils.isTestFile() which only matches
  // Ember-style names ending in -test.js or _test.js; the file must also match
  // the ember/tests config files pattern (e.g. **/__tests__/**/*.js)
  pauseTest: 'pause-test/__tests__/pause-test.js',
} as const;

describe('ember: sub config `testFiles`', () => {
  describe('basic tests', () => {
    it('creates `ember/tests` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getConfigByUnPostfix('ember/tests')).toBeDefined();
    });

    it('does not create `ember/tests` eslint config when `configTestFiles` is `false`', async () => {
      const configResult = await computeEslintConfig({ember: {configTestFiles: false}});

      expect(configResult.getConfigByUnPostfix('ember/tests')).toBeUndefined();
    });

    it('creates `ember/tests` eslint config when `configTestFiles` is `true` explicitly', async () => {
      const configResult = await computeEslintConfig({ember: {configTestFiles: true}});

      expect(configResult.getConfigByUnPostfix('ember/tests')).toBeDefined();
    });

    it('creates `ember/tests` eslint config when `configTestFiles` is object', async () => {
      const configResult = await computeEslintConfig({ember: {configTestFiles: {}}});

      expect(configResult.getConfigByUnPostfix('ember/tests')).toBeDefined();
    });

    it('has default `files` in `ember/tests` eslint config', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getConfigByUnPostfix('ember/tests')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s", "**/*-spec.?([cm])[jt]s", "**/*_spec.?([cm])[jt]s", "**/*.test.?([cm])[jt]s", "**/__tests__/**/*.?([cm])[jt]s", "**/__test__/**/*.?([cm])[jt]s"]',
      );
    });

    it('has default `ignores` in `ember/tests` eslint config', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getConfigByUnPostfix('ember/tests')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('ember');

    it('enables `ember/no-pause-test` rule by default', () => {
      expect(configResult.getRuleEntrySeverity('ember/tests', 'ember/no-pause-test')).toBe(2);
    });

    it('sets `ember/no-replace-test-comments` to warning severity', () => {
      expect(
        configResult.getRuleEntrySeverity('ember/tests', 'ember/no-replace-test-comments'),
      ).toBe(1);
    });

    it('disables `ts/no-empty-function` rule in test files', () => {
      expect(configResult.getRuleEntrySeverity('ember/tests', 'ts/no-empty-function')).toBe(0);
    });

    it('`ember/no-pause-test` rule fires on `pauseTest()` usage', async () => {
      const results = await testEslintConfig('ember', FIXTURES.pauseTest, {
        searchFixturesRelativeToPath: import.meta.dirname,
      });

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.pauseTest,
        'ember/no-pause-test',
      );

      expect(error?.message).toMatchInlineSnapshot('"Do not commit `pauseTest()`"');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ember/tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          ember: {configTestFiles: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('ember/tests')?.files).toStrictEqual(FILES);
      });

      it('disables `ember/tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          ember: {configTestFiles: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('ember/tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ember/tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ember: {configTestFiles: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('ember/tests')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `ember/tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ember: {
          configTestFiles: {
            overrides: {'ember/no-pause-test': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleEntrySeverity('ember/tests', 'ember/no-pause-test')).toBe(0);
      expect(configResult.getRuleEntrySeverity('ember/tests', 'no-console')).toBe(0);
    });
  });
});
