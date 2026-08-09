const FIXTURES = {
  interfaceWithUnsortedHeritageClauses: 'interface-with-unsorted-heritage-clauses.ts',
} as const;

describe('perfectionist: sub config `sortHeritageClauses`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-heritage-clauses` eslint config when `configSortHeritageClauses` is `true`', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        perfectionist: {configSortHeritageClauses: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-heritage-clauses');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-heritage-clauses` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-heritage-clauses'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-heritage-clauses` eslint config when `configSortHeritageClauses` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortHeritageClauses: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-heritage-clauses'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortHeritageClauses: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-heritage-clauses')).toMatchObject({
        'perfectionist/sort-heritage-clauses': 2,
      });
    });

    it('keeps `perfectionist/sort-heritage-clauses` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-heritage-clauses'),
      ).toBe(0);
    });

    it('`perfectionist/sort-heritage-clauses` rule fires on interface with unsorted heritage clauses', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortHeritageClauses: true}},
        FIXTURES.interfaceWithUnsortedHeritageClauses,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.interfaceWithUnsortedHeritageClauses,
        'perfectionist/sort-heritage-clauses',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "A" to come before "B"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-heritage-clauses` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortHeritageClauses: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-heritage-clauses')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-heritage-clauses` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortHeritageClauses: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-heritage-clauses'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-heritage-clauses` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortHeritageClauses: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-heritage-clauses',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-heritage-clauses` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortHeritageClauses: {
            overrides: {'perfectionist/sort-heritage-clauses': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-heritage-clauses')).toMatchObject({
        'perfectionist/sort-heritage-clauses': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-heritage-clauses` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortHeritageClauses: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-heritage-clauses',
            'perfectionist/sort-heritage-clauses',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-heritage-clauses` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortHeritageClauses: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-heritage-clauses',
            'perfectionist/sort-heritage-clauses',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
