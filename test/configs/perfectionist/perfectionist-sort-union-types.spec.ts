const FIXTURES = {
  unsortedUnionType: 'unsorted-union-type.ts',
} as const;

describe('perfectionist: sub config `sortUnionTypes`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-union-types` eslint config when `configSortUnionTypes` is `true`', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        perfectionist: {configSortUnionTypes: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-union-types');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-union-types` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-union-types')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-union-types` eslint config when `configSortUnionTypes` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortUnionTypes: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-union-types')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortUnionTypes: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-union-types')).toMatchObject({
        'perfectionist/sort-union-types': 2,
      });
    });

    it('keeps `perfectionist/sort-union-types` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-union-types'),
      ).toBe(0);
    });

    it('`perfectionist/sort-union-types` rule fires on unsorted union type', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortUnionTypes: true}},
        FIXTURES.unsortedUnionType,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedUnionType,
        'perfectionist/sort-union-types',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected "'a'" to come before "'b'"."`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-union-types` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortUnionTypes: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-union-types')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-union-types` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortUnionTypes: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-union-types')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-union-types` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortUnionTypes: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-union-types',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-union-types` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortUnionTypes: {
            overrides: {'perfectionist/sort-union-types': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-union-types')).toMatchObject({
        'perfectionist/sort-union-types': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-union-types` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortUnionTypes: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-union-types',
            'perfectionist/sort-union-types',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-union-types` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortUnionTypes: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-union-types',
            'perfectionist/sort-union-types',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
