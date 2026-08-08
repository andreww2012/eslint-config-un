const FIXTURES = {
  unsortedArray: 'unsorted-array.js',
} as const;

/**
 * `perfectionist/sort-arrays` only sorts arrays matched by `useConfigurationIf`,
 * so its schema makes that option mandatory.
 */
const OPTIONS = {useConfigurationIf: {allNamesMatchPattern: '^[a-z]$'}} as const;

describe('perfectionist: sub config `sortArrays`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortArrays: true}});

    it('creates `perfectionist/sort-arrays` eslint config when `configSortArrays` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-arrays')).toBeDefined();
    });

    it('does not create `perfectionist/sort-arrays` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-arrays')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-arrays` eslint config when `configSortArrays` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortArrays: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-arrays')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-arrays` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-arrays')?.files).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-arrays` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-arrays')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortArrays: true}});

    it('enables `perfectionist/sort-arrays` rule', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist/sort-arrays', 'perfectionist/sort-arrays'),
      ).toBe(2);
    });

    it('keeps `perfectionist/sort-arrays` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-arrays')).toBe(
        0,
      );
    });

    it('`perfectionist/sort-arrays` rule fires on unsorted array', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortArrays: {options: OPTIONS}}},
        FIXTURES.unsortedArray,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedArray,
        'perfectionist/sort-arrays',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-arrays` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrays: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-arrays')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `perfectionist/sort-arrays` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrays: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-arrays')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-arrays` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrays: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-arrays')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-arrays` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortArrays: {
            overrides: {'perfectionist/sort-arrays': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-arrays')).toMatchObject({
        'perfectionist/sort-arrays': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-arrays` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortArrays: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-arrays',
            'perfectionist/sort-arrays',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-arrays` rule', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortArrays: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-arrays',
            'perfectionist/sort-arrays',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
