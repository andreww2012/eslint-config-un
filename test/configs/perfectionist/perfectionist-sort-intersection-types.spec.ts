const FIXTURES = {
  unsortedIntersectionType: 'unsorted-intersection-type.ts',
} as const;

describe('perfectionist: sub config `sortIntersectionTypes`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortIntersectionTypes: true},
    });

    it('creates `perfectionist/sort-intersection-types` eslint config when `configSortIntersectionTypes` is `true`', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types'),
      ).toBeDefined();
    });

    it('does not create `perfectionist/sort-intersection-types` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-intersection-types` eslint config when `configSortIntersectionTypes` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortIntersectionTypes: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types'),
      ).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-intersection-types` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-intersection-types` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortIntersectionTypes: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-intersection-types')).toMatchObject(
        {
          'perfectionist/sort-intersection-types': 2,
        },
      );
    });

    it('keeps `perfectionist/sort-intersection-types` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-intersection-types'),
      ).toBe(0);
    });

    it('`perfectionist/sort-intersection-types` rule fires on unsorted intersection type', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortIntersectionTypes: true}},
        FIXTURES.unsortedIntersectionType,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedIntersectionType,
        'perfectionist/sort-intersection-types',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Expected "{a: string}" to come before "{b: string}"."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-intersection-types` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortIntersectionTypes: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-intersection-types` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortIntersectionTypes: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-intersection-types'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-intersection-types` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortIntersectionTypes: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-intersection-types',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-intersection-types` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortIntersectionTypes: {
            overrides: {'perfectionist/sort-intersection-types': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-intersection-types')).toMatchObject(
        {
          'perfectionist/sort-intersection-types': 1,
          'no-console': 0,
        },
      );
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-intersection-types` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortIntersectionTypes: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-intersection-types',
            'perfectionist/sort-intersection-types',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-intersection-types` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortIntersectionTypes: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-intersection-types',
            'perfectionist/sort-intersection-types',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
