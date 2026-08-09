const FIXTURES = {
  unsortedObjectType: 'unsorted-object-type.ts',
} as const;

describe('perfectionist: sub config `sortObjectTypes`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-object-types` eslint config when `configSortObjectTypes` is `true`', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        perfectionist: {configSortObjectTypes: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-object-types');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-object-types` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-object-types')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-object-types` eslint config when `configSortObjectTypes` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortObjectTypes: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-object-types')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortObjectTypes: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-object-types')).toMatchObject({
        'perfectionist/sort-object-types': 2,
      });
    });

    it('keeps `perfectionist/sort-object-types` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-object-types'),
      ).toBe(0);
    });

    it('`perfectionist/sort-object-types` rule fires on unsorted object type', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortObjectTypes: true}},
        FIXTURES.unsortedObjectType,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedObjectType,
        'perfectionist/sort-object-types',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-object-types` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjectTypes: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-object-types')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-object-types` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjectTypes: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-object-types'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-object-types` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjectTypes: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-object-types',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-object-types` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortObjectTypes: {
            overrides: {'perfectionist/sort-object-types': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-object-types')).toMatchObject({
        'perfectionist/sort-object-types': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-object-types` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjectTypes: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-object-types',
            'perfectionist/sort-object-types',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-object-types` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjectTypes: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-object-types',
            'perfectionist/sort-object-types',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
