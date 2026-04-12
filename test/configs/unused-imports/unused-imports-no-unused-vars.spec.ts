const FIXTURES = {
  unusedVar: 'unused-var.js',
} as const;

describe('unused-imports: sub config `noUnusedVars`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({unusedImports: {configNoUnusedVars: true}});

    it('creates `unused-imports/no-unused-vars` eslint config when enabled', () => {
      expect(configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')).toBeDefined();
    });

    it('does not create `unused-imports/no-unused-vars` eslint config when disabled (default)', async () => {
      const configResult = await computeEslintConfig('unusedImports');

      expect(configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')).toBeUndefined();
    });

    it('has no explicit `files` restriction in `unused-imports/no-unused-vars` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `unused-imports/no-unused-vars` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({unusedImports: {configNoUnusedVars: true}});

    it('enables `unused-imports/no-unused-vars` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'unused-imports/no-unused-vars',
          'unused-imports/no-unused-vars',
        ),
      ).toBe(2);
    });

    it('disables `no-unused-vars`, `sonarjs/no-unused-vars` and `ts/no-unused-vars` rules in `unused-imports/no-unused-vars` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('unused-imports/no-unused-vars', 'no-unused-vars'),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity(
          'unused-imports/no-unused-vars',
          'sonarjs/no-unused-vars',
        ),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity('unused-imports/no-unused-vars', 'ts/no-unused-vars'),
      ).toBe(0);
    });

    it('`unused-imports/no-unused-vars` rule fires on a file with an unused variable', async () => {
      const results = await testEslintConfig(
        {unusedImports: {configNoUnusedVars: true}},
        FIXTURES.unusedVar,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unusedVar,
        'unused-imports/no-unused-vars',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"'unusedVariable' is assigned a value but never used."`,
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unused-imports/no-unused-vars` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          unusedImports: {configNoUnusedVars: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `unused-imports/no-unused-vars` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unusedImports: {configNoUnusedVars: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unused-imports/no-unused-vars` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          unusedImports: {configNoUnusedVars: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('unused-imports/no-unused-vars')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unused-imports/no-unused-vars` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unusedImports: {
          configNoUnusedVars: {
            overrides: {'unused-imports/no-unused-vars': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'unused-imports/no-unused-vars',
          'unused-imports/no-unused-vars',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('unused-imports/no-unused-vars', 'no-console')).toBe(
        0,
      );
    });
  });

  describe('options', () => {
    describe('option: `ruleOptions`', () => {
      it('does not add options to `unused-imports/no-unused-vars` rule by default', async () => {
        const configResult = await computeEslintConfig({
          unusedImports: {configNoUnusedVars: true},
        });

        expect(
          configResult.getRuleEntry(
            'unused-imports/no-unused-vars',
            'unused-imports/no-unused-vars',
          ),
        ).toMatchInlineSnapshot('[2]');
      });

      it('adds options to `unused-imports/no-unused-vars` rule when `ruleOptions` is provided', async () => {
        const OPTIONS = {vars: 'all' as const, args: 'after-used' as const};

        const configResult = await computeEslintConfig({
          unusedImports: {configNoUnusedVars: {ruleOptions: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'unused-imports/no-unused-vars',
            'unused-imports/no-unused-vars',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
