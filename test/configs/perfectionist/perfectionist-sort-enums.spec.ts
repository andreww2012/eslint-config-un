const FIXTURES = {
  enumWithUnsortedMembers: 'enum-with-unsorted-members.ts',
} as const;

describe('perfectionist: sub config `sortEnums`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortEnums: true},
    });

    it('creates `perfectionist/sort-enums` eslint config when `configSortEnums` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-enums')).toBeDefined();
    });

    it('does not create `perfectionist/sort-enums` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-enums')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-enums` eslint config when `configSortEnums` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortEnums: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-enums')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-enums` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-enums')?.files).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-enums` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-enums')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortEnums: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-enums')).toMatchObject({
        'perfectionist/sort-enums': 2,
      });
    });

    it('keeps `perfectionist/sort-enums` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-enums')).toBe(
        0,
      );
    });

    it('`perfectionist/sort-enums` rule fires on enum with unsorted members', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortEnums: true}},
        FIXTURES.enumWithUnsortedMembers,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.enumWithUnsortedMembers,
        'perfectionist/sort-enums',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-enums` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortEnums: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-enums')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `perfectionist/sort-enums` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortEnums: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-enums')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-enums` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortEnums: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-enums')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-enums` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortEnums: {
            overrides: {'perfectionist/sort-enums': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-enums')).toMatchObject({
        'perfectionist/sort-enums': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-enums` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortEnums: true}});

        expect(
          configResult.getRuleEntryOptions('perfectionist/sort-enums', 'perfectionist/sort-enums'),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-enums` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortEnums: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions('perfectionist/sort-enums', 'perfectionist/sort-enums'),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
