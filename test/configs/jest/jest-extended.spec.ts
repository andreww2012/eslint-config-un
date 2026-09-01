const FIXTURES = {
  arrayAssertion: 'array-assertion/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({jest: '29.0.0', 'jest-extended': '7.0.0'});
});

describe('jest: sub config `jestExtended`', () => {
  describe('basic tests', () => {
    it('creates `jest/extended` eslint config when `configJestExtended` is enabled', async () => {
      const configResult = await computeEslintConfig({jest: {configJestExtended: true}});

      const config = configResult.getConfigByUnPostfix('jest/extended');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
      );
      expect(config?.ignores?.length).toBeGreaterThan(0);
      expect(config?.files).toStrictEqual(configResult.getConfigByUnPostfix('jest')?.files);
    });

    it('does not create `jest/extended` eslint config when `configJestExtended` is disabled', async () => {
      const configResult = await computeEslintConfig({jest: {configJestExtended: false}});

      expect(configResult.getConfigByUnPostfix('jest/extended')).toBeUndefined();
    });

    it('creates `jest/extended` eslint config when sub-config is not explicitly enabled but `jest-extended` package is installed', async () => {
      const configResultWithPackage = await computeEslintConfig('jest');

      expect(configResultWithPackage.getConfigByUnPostfix('jest/extended')).toBeDefined();
    });

    describe('`jest-extended` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({jest: '29.0.0'});
      });

      it('does not create `jest/extended` eslint config by default', async () => {
        const configResultNoPackage = await computeEslintConfig('jest');

        expect(configResultNoPackage.getConfigByUnPostfix('jest/extended')).toBeUndefined();
      });

      it('creates `jest/extended` eslint config when explicitly enabled', async () => {
        const configResultExplicit = await computeEslintConfig({jest: {configJestExtended: true}});

        expect(configResultExplicit.getConfigByUnPostfix('jest/extended')).toBeDefined();
      });
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      jest: {configJestExtended: {suggestUsing: true}},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('jest/extended')).toMatchObject({
        'jest-extended/prefer-to-be-array': 2,
        'jest-extended/prefer-to-be-false': 2,
      });
    });

    it('`jest-extended/prefer-to-be-array` rule fires when `Array.isArray` is used in `expect`', async () => {
      const results = await testEslintConfig(
        {jest: {configJestExtended: true}},
        FIXTURES.arrayAssertion,
        {
          un: {plugins: {jest: {settings: {version: 29}}}},
          searchFixturesRelativeToPath: import.meta.dirname,
        },
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.arrayAssertion,
        'jest-extended/prefer-to-be-array',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Prefer using `toBeArray()` to test if a value is an array."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jest/extended` eslint config', async () => {
        const FILES = ['tests/**/*.spec.ts'];

        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('jest/extended')?.files).toStrictEqual(FILES);
      });

      it('disables `jest/extended` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('jest/extended')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jest/extended` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('jest/extended')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jest/extended` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jest: {
          configJestExtended: {
            suggestUsing: true,
            overrides: {'jest-extended/prefer-to-be-array': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-array'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('jest/extended', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `suggestUsing`', () => {
      const SUGGEST_USING_RULES = [
        'prefer-to-be-array',
        'prefer-to-be-false',
        'prefer-to-be-object',
        'prefer-to-be-true',
        'prefer-to-have-been-called-once',
      ];

      it('enables all suggest-using rules by default', async () => {
        const configResult = await computeEslintConfig({jest: {configJestExtended: true}});

        expect(
          SUGGEST_USING_RULES.map((rule) =>
            configResult.getRuleEntrySeverity('jest/extended', `jest-extended/${rule}`),
          ),
        ).toMatchInlineSnapshot('[2, 2, 2, 2, 2]');
      });

      it('enables all suggest-using rules when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {suggestUsing: true}},
        });

        expect(
          SUGGEST_USING_RULES.map((rule) =>
            configResult.getRuleEntrySeverity('jest/extended', `jest-extended/${rule}`),
          ),
        ).toMatchInlineSnapshot('[2, 2, 2, 2, 2]');
      });

      it('disables all suggest-using rules when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {suggestUsing: false}},
        });

        expect(
          SUGGEST_USING_RULES.map((rule) =>
            configResult.getRuleEntrySeverity('jest/extended', `jest-extended/${rule}`),
          ),
        ).toMatchInlineSnapshot('[0, 0, 0, 0, 0]');
      });

      it('supports object form to disable only selected suggest-using rules', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {suggestUsing: {toBeArray: false}}},
        });

        expect(
          configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-array'),
        ).toBe(0);
        expect(
          configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-false'),
        ).toBe(2);
      });
    });
  });
});
