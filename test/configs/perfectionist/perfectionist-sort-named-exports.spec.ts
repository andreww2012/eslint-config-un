const FIXTURES = {
  unsortedNamedExports: 'unsorted-named-exports.js',
} as const;

describe('perfectionist: sub config `sortNamedExports`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortNamedExports: true}});

    it('creates `perfectionist/sort-named-exports` eslint config when `configSortNamedExports` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-named-exports')).toBeDefined();
    });

    it('does not create `perfectionist/sort-named-exports` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-named-exports')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-named-exports` eslint config when `configSortNamedExports` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortNamedExports: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-named-exports')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-named-exports` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-named-exports')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-named-exports` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-named-exports')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortNamedExports: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-named-exports')).toMatchObject({
        'perfectionist/sort-named-exports': 2,
      });
    });

    it('keeps `perfectionist/sort-named-exports` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-named-exports'),
      ).toBe(0);
    });

    it('`perfectionist/sort-named-exports` rule fires on unsorted named exports', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortNamedExports: true}},
        FIXTURES.unsortedNamedExports,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedNamedExports,
        'perfectionist/sort-named-exports',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-named-exports` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedExports: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-named-exports')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-named-exports` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedExports: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-named-exports'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-named-exports` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedExports: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-named-exports',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-named-exports` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortNamedExports: {
            overrides: {'perfectionist/sort-named-exports': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-named-exports')).toMatchObject({
        'perfectionist/sort-named-exports': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-named-exports` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedExports: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-named-exports',
            'perfectionist/sort-named-exports',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-named-exports` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortNamedExports: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-named-exports',
            'perfectionist/sort-named-exports',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
