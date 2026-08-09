const FIXTURES = {
  setWithUnsortedEntries: 'set-with-unsorted-entries.js',
} as const;

describe('perfectionist: sub config `sortSets`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-sets` eslint config when `configSortSets` is `true`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortSets: true}});

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-sets');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-sets` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-sets')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-sets` eslint config when `configSortSets` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortSets: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-sets')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortSets: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-sets')).toMatchObject({
        'perfectionist/sort-sets': 2,
      });
    });

    it('keeps `perfectionist/sort-sets` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-sets')).toBe(0);
    });

    it('`perfectionist/sort-sets` rule fires on set with unsorted entries', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortSets: true}},
        FIXTURES.setWithUnsortedEntries,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.setWithUnsortedEntries,
        'perfectionist/sort-sets',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-sets` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortSets: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-sets')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `perfectionist/sort-sets` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortSets: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-sets')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-sets` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortSets: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-sets')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-sets` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortSets: {
            overrides: {'perfectionist/sort-sets': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-sets')).toMatchObject({
        'perfectionist/sort-sets': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-sets` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortSets: true}});

        expect(
          configResult.getRuleEntryOptions('perfectionist/sort-sets', 'perfectionist/sort-sets'),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-sets` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortSets: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions('perfectionist/sort-sets', 'perfectionist/sort-sets'),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
