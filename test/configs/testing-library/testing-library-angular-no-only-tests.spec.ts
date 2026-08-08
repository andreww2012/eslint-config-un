describe('testing-library: sub config `angular.noOnlyTests`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

    it('creates `testing-library/angular/no-only-tests` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
      ).toBeDefined();
    });

    it('does not create `testing-library/angular/no-only-tests` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {configAngular: {configNoOnlyTests: false}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
      ).toBeUndefined();
    });

    it('has default `files` in `testing-library/angular/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/angular/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests')?.ignores?.length,
      ).toBeGreaterThan(0);
    });

    it('inherits `files` from the parent `testing-library/angular` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({
        testingLibrary: {configAngular: {files: FILES}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests')?.files,
      ).toStrictEqual(FILES);
    });

    it('does not create `testing-library/angular/no-only-tests` eslint config when the parent `testing-library/angular` eslint config is disabled via empty `files`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {configAngular: {files: []}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configAngular: true}});

    it('enables `no-only-tests/no-only-tests` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/angular/no-only-tests',
          'no-only-tests/no-only-tests',
        ),
      ).toBe(2);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `testing-library/angular/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {configNoOnlyTests: {files: FILES}}},
        });

        expect(
          configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `testing-library/angular/no-only-tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {configNoOnlyTests: {files: []}}},
        });

        expect(
          configResult.getConfigByUnPostfix('testing-library/angular/no-only-tests'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/angular/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configAngular: {configNoOnlyTests: {ignores: IGNORES}}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'testing-library/angular/no-only-tests',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/angular/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configAngular: {
            configNoOnlyTests: {
              overrides: {'no-only-tests/no-only-tests': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
      });

      expect(configResult.getRuleSeverities('testing-library/angular/no-only-tests')).toMatchObject(
        {
          'no-only-tests/no-only-tests': 0,
          'no-console': 0,
        },
      );
    });
  });
});
