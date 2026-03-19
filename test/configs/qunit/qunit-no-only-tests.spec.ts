describe('qunit: sub config `configNoOnlyTests`', () => {
  describe('basic tests', () => {
    it('does not create `qunit/no-only-tests` eslint config by default (`configNoOnlyTests` is disabled by default)', async () => {
      const configResult = await computeEslintConfig('qunit');

      expect(configResult.getConfigByUnPostfix('qunit/no-only-tests')).toBeUndefined();
    });

    it('creates `qunit/no-only-tests` eslint config when `configNoOnlyTests` is enabled', async () => {
      const configResult = await computeEslintConfig({qunit: {configNoOnlyTests: true}});

      expect(configResult.getConfigByUnPostfix('qunit/no-only-tests')).toBeDefined();
    });

    it('has default `files` in `qunit/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({qunit: {configNoOnlyTests: true}});

      expect(configResult.getConfigByUnPostfix('qunit/no-only-tests')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('inherits `files` from parent `qunit` config when `configNoOnlyTests` is enabled', async () => {
      const FILES = ['tests/**/*.spec.ts'];
      const configResult = await computeEslintConfig({
        qunit: {files: FILES, configNoOnlyTests: true},
      });

      expect(configResult.getConfigByUnPostfix('qunit/no-only-tests')?.files).toStrictEqual(FILES);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({qunit: {configNoOnlyTests: true}});

    it('enables `no-only-tests/no-only-tests` rule', () => {
      expect(
        configResult.getRuleEntrySeverity('qunit/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `qunit/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];
        const configResult = await computeEslintConfig({
          qunit: {configNoOnlyTests: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('qunit/no-only-tests')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `qunit/no-only-tests` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          qunit: {configNoOnlyTests: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('qunit/no-only-tests')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `qunit/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          qunit: {configNoOnlyTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('qunit/no-only-tests')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `qunit/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        qunit: {
          configNoOnlyTests: {
            overrides: {'no-only-tests/no-only-tests': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('qunit/no-only-tests', 'no-only-tests/no-only-tests'),
      ).toBe(0);

      expect(configResult.getRuleEntrySeverity('qunit/no-only-tests', 'no-console')).toBe(0);
    });
  });
});
