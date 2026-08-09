const FIXTURES = {
  unsortedNamedImports: 'unsorted-named-imports.js',
} as const;

describe('perfectionist: sub config `sortNamedImports`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-named-imports` eslint config when `configSortNamedImports` is `true`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortNamedImports: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-named-imports');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-named-imports` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-named-imports')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-named-imports` eslint config when `configSortNamedImports` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortNamedImports: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-named-imports')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortNamedImports: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-named-imports')).toMatchObject({
        'perfectionist/sort-named-imports': 2,
      });
    });

    it('keeps `perfectionist/sort-named-imports` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-named-imports'),
      ).toBe(0);
    });

    it('`perfectionist/sort-named-imports` rule fires on unsorted named imports', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortNamedImports: true}},
        FIXTURES.unsortedNamedImports,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedNamedImports,
        'perfectionist/sort-named-imports',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-named-imports` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedImports: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-named-imports')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-named-imports` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedImports: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-named-imports'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-named-imports` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedImports: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-named-imports',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-named-imports` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortNamedImports: {
            overrides: {'perfectionist/sort-named-imports': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-named-imports')).toMatchObject({
        'perfectionist/sort-named-imports': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-named-imports` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedImports: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-named-imports',
            'perfectionist/sort-named-imports',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-named-imports` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedImports: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-named-imports',
            'perfectionist/sort-named-imports',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
