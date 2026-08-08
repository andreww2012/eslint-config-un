const FIXTURES = {
  mapWithUnsortedEntries: 'map-with-unsorted-entries.js',
} as const;

describe('perfectionist: sub config `sortMaps`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortMaps: true}});

    it('creates `perfectionist/sort-maps` eslint config when `configSortMaps` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-maps')).toBeDefined();
    });

    it('does not create `perfectionist/sort-maps` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-maps')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-maps` eslint config when `configSortMaps` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortMaps: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-maps')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-maps` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-maps')?.files).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-maps` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-maps')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortMaps: true}});

    it('enables `perfectionist/sort-maps` rule', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist/sort-maps', 'perfectionist/sort-maps'),
      ).toBe(2);
    });

    it('keeps `perfectionist/sort-maps` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-maps')).toBe(0);
    });

    it('`perfectionist/sort-maps` rule fires on map with unsorted entries', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortMaps: true}},
        FIXTURES.mapWithUnsortedEntries,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mapWithUnsortedEntries,
        'perfectionist/sort-maps',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected "'a'" to come before "'b'"."`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-maps` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortMaps: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-maps')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `perfectionist/sort-maps` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortMaps: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-maps')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-maps` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortMaps: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-maps')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-maps` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortMaps: {
            overrides: {'perfectionist/sort-maps': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-maps')).toMatchObject({
        'perfectionist/sort-maps': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-maps` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortMaps: true}});

        expect(
          configResult.getRuleEntryOptions('perfectionist/sort-maps', 'perfectionist/sort-maps'),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-maps` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortMaps: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions('perfectionist/sort-maps', 'perfectionist/sort-maps'),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
