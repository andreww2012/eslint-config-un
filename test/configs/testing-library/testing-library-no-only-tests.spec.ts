describe('testing-library: sub config `noOnlyTests`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('testingLibrary');

    it('creates `testing-library/dom/no-only-tests` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')).toBeDefined();
    });

    it('does not create `testing-library/dom/no-only-tests` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {configNoOnlyTests: false}});

      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests'),
      ).toBeUndefined();
    });

    it('has default `files` in `testing-library/dom/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/dom/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')?.ignores?.length,
      ).toBeGreaterThan(0);
    });

    it('inherits `files` from the parent `testing-library/dom` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({testingLibrary: {files: FILES}});

      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')?.files,
      ).toStrictEqual(FILES);
    });

    it('does not create `testing-library/dom/no-only-tests` eslint config when the parent `testing-library/dom` eslint config is disabled via empty `files`', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {files: []}});

      expect(
        configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('testingLibrary');

    it('enables `no-only-tests/no-only-tests` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom/no-only-tests',
          'no-only-tests/no-only-tests',
        ),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `testing-library/dom/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configNoOnlyTests: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `testing-library/dom/no-only-tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configNoOnlyTests: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('testing-library/dom/no-only-tests'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/dom/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configNoOnlyTests: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'testing-library/dom/no-only-tests',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/dom/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configNoOnlyTests: {
            overrides: {'no-only-tests/no-only-tests': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('testing-library/dom/no-only-tests')).toMatchObject({
        'no-only-tests/no-only-tests': 0,
        'no-console': 0,
      });
    });
  });
});
