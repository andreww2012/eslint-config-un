const FIXTURES = {
  unsortedImports: 'unsorted-imports.js',
} as const;

describe('perfectionist: sub config `sortImports`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortImports: true}});

    it('creates `perfectionist/sort-imports` eslint config when `configSortImports` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-imports')).toBeDefined();
    });

    it('does not create `perfectionist/sort-imports` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-imports')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-imports` eslint config when `configSortImports` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortImports: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-imports')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-imports` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-imports')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-imports` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-imports')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortImports: true}});

    it('enables `perfectionist/sort-imports` rule', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist/sort-imports',
          'perfectionist/sort-imports',
        ),
      ).toBe(2);
    });

    it('`perfectionist/sort-imports` rule fires on unsorted imports', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortImports: true}},
        FIXTURES.unsortedImports,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedImports,
        'perfectionist/sort-imports',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Expected "express-session" to come before "node:fs/promises"."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-imports` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortImports: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-imports')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-imports` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortImports: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-imports')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-imports` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortImports: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-imports')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-imports` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortImports: {
            overrides: {'perfectionist/sort-imports': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist/sort-imports',
          'perfectionist/sort-imports',
        ),
      ).toBe(1);
      expect(configResult.getRuleEntrySeverity('perfectionist/sort-imports', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('passes custom rule options to `perfectionist/sort-imports` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortImports: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-imports',
            'perfectionist/sort-imports',
          ),
        ).toStrictEqual([]);
      });

      it('passes custom rule options to `perfectionist/sort-imports` rule when set to a value', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortImports: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-imports',
            'perfectionist/sort-imports',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
