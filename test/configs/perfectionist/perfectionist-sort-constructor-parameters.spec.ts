const FIXTURES = {
  classesWithUnsortedConstructorParameters: 'classes-with-unsorted-constructor-parameters.ts',
} as const;

const OPTIONS = {
  useConfigurationIf: {
    matchesAstSelector:
      'ClassDeclaration:has(Decorator[expression.callee.name="Injectable"]) > ClassBody > MethodDefinition',
  },
} as const;

describe('perfectionist: sub config `sortConstructorParameters`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-constructor-parameters` eslint config when `configSortConstructorParameters` has `options`', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        perfectionist: {configSortConstructorParameters: {options: OPTIONS}},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-constructor-parameters');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();

      const ignores = config?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-constructor-parameters` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-constructor-parameters'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-constructor-parameters` eslint config when `configSortConstructorParameters` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortConstructorParameters: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-constructor-parameters'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortConstructorParameters: {options: OPTIONS}},
    });

    it('correctly sets severities by default', () => {
      expect(
        configResult.getRuleSeverities('perfectionist/sort-constructor-parameters'),
      ).toMatchObject({
        'perfectionist/sort-constructor-parameters': 2,
      });
    });

    it('keeps `perfectionist/sort-constructor-parameters` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist',
          'perfectionist/sort-constructor-parameters',
        ),
      ).toBe(0);
    });

    it('`perfectionist/sort-constructor-parameters` rule fires only on constructors of classes matched by `useConfigurationIf`', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortConstructorParameters: {options: OPTIONS}}},
        FIXTURES.classesWithUnsortedConstructorParameters,
        import.meta.dirname,
      );

      const errors = findLintMessageFromLintResults(
        results,
        FIXTURES.classesWithUnsortedConstructorParameters,
        'perfectionist/sort-constructor-parameters',
        {all: true},
      );

      expect(errors.map(({line, message}) => ({line, message}))).toMatchInlineSnapshot(
        '[{"line": 7, "message": "Expected "cache" to come before "logger"."}]',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-constructor-parameters` eslint config', async () => {
        const FILES = ['src/**/*.ts'] as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortConstructorParameters: {options: OPTIONS, files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-constructor-parameters')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-constructor-parameters` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortConstructorParameters: {options: OPTIONS, files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-constructor-parameters'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-constructor-parameters` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'] as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortConstructorParameters: {options: OPTIONS, ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-constructor-parameters',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-constructor-parameters` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortConstructorParameters: {
            options: OPTIONS,
            overrides: {'perfectionist/sort-constructor-parameters': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleSeverities('perfectionist/sort-constructor-parameters'),
      ).toMatchObject({
        'perfectionist/sort-constructor-parameters': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('passes user-provided rule options to `perfectionist/sort-constructor-parameters` rule', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortConstructorParameters: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-constructor-parameters',
            'perfectionist/sort-constructor-parameters',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
