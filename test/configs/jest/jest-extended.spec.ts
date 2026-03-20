const FIXTURES = {
  arrayAssertion: 'array-assertion/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({jest: '29.0.0', 'jest-extended': '7.0.0'});
});

describe('jest: sub config `configJestExtended`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({jest: {configJestExtended: true}});

    it('creates `jest/extended` eslint config when `configJestExtended` is enabled', () => {
      expect(configResult.getConfigByUnPostfix('jest/extended')).toBeDefined();
    });

    it('has default `files` in `jest/extended` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jest/extended')?.files).toMatchInlineSnapshot(
        '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `jest/extended` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('jest/extended')?.ignores?.length).toBeGreaterThan(
        0,
      );
    });

    it('inherits `files` from parent `jest` config when `configJestExtended` is enabled', () => {
      expect(configResult.getConfigByUnPostfix('jest/extended')?.files).toStrictEqual(
        configResult.getConfigByUnPostfix('jest')?.files,
      );
    });

    it('creates `jest/extended` eslint config when sub-config is not explicitly enabled but `jest-extended` package is installed', async () => {
      const configResultWithPackage = await computeEslintConfig({jest: {}});

      expect(configResultWithPackage.getConfigByUnPostfix('jest/extended')).toBeDefined();
    });

    describe('`jest-extended` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({jest: '29.0.0'});
      });

      it('does not create `jest/extended` eslint config by default', async () => {
        const configResultNoPackage = await computeEslintConfig({jest: {}});

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

    it('enables `jest-extended/prefer-to-be-array` rule by default when enabled', () => {
      expect(
        configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-array'),
      ).toBe(2);
    });

    it('enables `jest-extended/prefer-to-be-false` rule by default when enabled', () => {
      expect(
        configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-false'),
      ).toBe(2);
    });

    it('enables `jest-extended/prefer-to-be-object` rule by default when enabled', () => {
      expect(
        configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-object'),
      ).toBe(2);
    });

    it('enables `jest-extended/prefer-to-be-true` rule by default when enabled', () => {
      expect(
        configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-true'),
      ).toBe(2);
    });

    it('enables `jest-extended/prefer-to-have-been-called-once` rule by default when enabled', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'jest/extended',
          'jest-extended/prefer-to-have-been-called-once',
        ),
      ).toBe(2);
    });

    it('`jest-extended/prefer-to-be-array` rule fires when `Array.isArray` is used in `expect`', async () => {
      const results = await testEslintConfig(
        {jest: {settings: {version: 29}, configJestExtended: true}},
        FIXTURES.arrayAssertion,
        {searchFixturesRelativeToPath: import.meta.dirname},
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.arrayAssertion,
        'jest-extended/prefer-to-be-array',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Prefer using \`toBeArray()\` to test if a value is an array."`);
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

      it('disables `jest/extended` eslint config when `files` is empty array', async () => {
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

    describe('option: `forceSeverity`', () => {
      it('respects `forceSeverity` set to `error` in `jest/extended` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {forceSeverity: 'error'}},
        });

        expect(
          getAllRulesSeverities(configResult.getConfigByUnPostfix('jest/extended'), (ruleName) =>
            ruleName.startsWith('jest-extended/'),
          ),
        ).toStrictEqual([2]);
      });

      it('respects `forceSeverity` set to `warn` in `jest/extended` eslint config', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {forceSeverity: 'warn'}},
        });

        expect(
          getAllRulesSeverities(configResult.getConfigByUnPostfix('jest/extended'), (ruleName) =>
            ruleName.startsWith('jest-extended/'),
          ),
        ).toStrictEqual([1]);
      });
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

      it('enables all suggest-using rules when option is not set', async () => {
        const configResult = await computeEslintConfig({jest: {configJestExtended: true}});

        expect(
          SUGGEST_USING_RULES.map((rule) =>
            configResult.getRuleEntrySeverity('jest/extended', `jest-extended/${rule}`),
          ),
        ).toMatchInlineSnapshot('[2, 2, 2, 2, 2]');
      });

      it('enables all suggest-using rules when option is `true`', async () => {
        const configResult = await computeEslintConfig({
          jest: {configJestExtended: {suggestUsing: true}},
        });

        expect(
          SUGGEST_USING_RULES.map((rule) =>
            configResult.getRuleEntrySeverity('jest/extended', `jest-extended/${rule}`),
          ),
        ).toMatchInlineSnapshot('[2, 2, 2, 2, 2]');
      });

      it('disables all suggest-using rules when option is `false`', async () => {
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
        ).toMatchInlineSnapshot('0');
        expect(
          configResult.getRuleEntrySeverity('jest/extended', 'jest-extended/prefer-to-be-false'),
        ).toMatchInlineSnapshot('2');
      });
    });
  });
});
