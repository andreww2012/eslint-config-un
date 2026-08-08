const FIXTURES = {
  includesCallOnUnsortedArray: 'includes-call-on-unsorted-array.js',
} as const;

describe('perfectionist: sub config `sortArrayIncludes`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortArrayIncludes: true},
    });

    it('creates `perfectionist/sort-array-includes` eslint config when `configSortArrayIncludes` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-array-includes')).toBeDefined();
    });

    it('does not create `perfectionist/sort-array-includes` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-array-includes'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-array-includes` eslint config when `configSortArrayIncludes` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortArrayIncludes: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-array-includes'),
      ).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-array-includes` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-array-includes')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-array-includes` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-array-includes')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortArrayIncludes: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-array-includes')).toMatchObject({
        'perfectionist/sort-array-includes': 2,
      });
    });

    it('keeps `perfectionist/sort-array-includes` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-array-includes'),
      ).toBe(0);
    });

    it('`perfectionist/sort-array-includes` rule fires on includes call on unsorted array', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortArrayIncludes: true}},
        FIXTURES.includesCallOnUnsortedArray,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.includesCallOnUnsortedArray,
        'perfectionist/sort-array-includes',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-array-includes` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrayIncludes: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-array-includes')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-array-includes` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrayIncludes: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-array-includes'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-array-includes` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrayIncludes: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-array-includes',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-array-includes` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortArrayIncludes: {
            overrides: {'perfectionist/sort-array-includes': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-array-includes')).toMatchObject({
        'perfectionist/sort-array-includes': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-array-includes` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrayIncludes: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-array-includes',
            'perfectionist/sort-array-includes',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-array-includes` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrayIncludes: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-array-includes',
            'perfectionist/sort-array-includes',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
