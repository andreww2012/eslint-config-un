const FIXTURES = {
  testWithOnlyModifier: 'only-modifier/test.spec.js',
} as const;

describe('testing-library: sub config `react.noOnlyTests`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

    it('creates `testing-library/react/no-only-tests` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/react/no-only-tests'),
      ).toBeDefined();
    });

    it('does not create `testing-library/react/no-only-tests` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {configReact: {configNoOnlyTests: false}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/react/no-only-tests'),
      ).toBeUndefined();
    });

    it('has default `files` in `testing-library/react/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/react/no-only-tests')?.files,
      ).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `testing-library/react/no-only-tests` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('testing-library/react/no-only-tests')?.ignores?.length,
      ).toBeGreaterThan(0);
    });

    it('inherits `files` from the parent `testing-library/react` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({
        testingLibrary: {configReact: {files: FILES}},
      });

      expect(
        configResult.getConfigByUnPostfix('testing-library/react/no-only-tests')?.files,
      ).toStrictEqual(FILES);
    });

    it('does not create `testing-library/react/no-only-tests` eslint config when the parent `testing-library/react` eslint config is disabled via empty `files`', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {configReact: {files: []}}});

      expect(
        configResult.getConfigByUnPostfix('testing-library/react/no-only-tests'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('testing-library/react/no-only-tests')).toMatchObject({
        'no-only-tests/no-only-tests': 2,
      });
    });

    it('`no-only-tests/no-only-tests` rule fires on a test with the `.only` modifier', async () => {
      const results = await testEslintConfig(
        {testingLibrary: {configReact: true}},
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
      it('uses user-provided `files` in `testing-library/react/no-only-tests` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {configNoOnlyTests: {files: FILES}}},
        });

        expect(
          configResult.getConfigByUnPostfix('testing-library/react/no-only-tests')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `testing-library/react/no-only-tests` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {configNoOnlyTests: {files: []}}},
        });

        expect(
          configResult.getConfigByUnPostfix('testing-library/react/no-only-tests'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `testing-library/react/no-only-tests` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          testingLibrary: {configReact: {configNoOnlyTests: {ignores: IGNORES}}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'testing-library/react/no-only-tests',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `testing-library/react/no-only-tests` eslint config', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {
          configReact: {
            configNoOnlyTests: {
              overrides: {'no-only-tests/no-only-tests': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
      });

      expect(configResult.getRuleSeverities('testing-library/react/no-only-tests')).toMatchObject({
        'no-only-tests/no-only-tests': 0,
        'no-console': 0,
      });
    });
  });
});
