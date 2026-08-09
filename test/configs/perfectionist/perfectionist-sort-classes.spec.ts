const FIXTURES = {
  classWithUnsortedMembers: 'class-with-unsorted-members.js',
} as const;

describe('perfectionist: sub config `sortClasses`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-classes` eslint config when `configSortClasses` is `true`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortClasses: true}});

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-classes');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-classes` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-classes')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-classes` eslint config when `configSortClasses` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortClasses: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-classes')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortClasses: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-classes')).toMatchObject({
        'perfectionist/sort-classes': 2,
      });
    });

    it('keeps `perfectionist/sort-classes` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-classes')).toBe(
        0,
      );
    });

    it('`perfectionist/sort-classes` rule fires on class with unsorted members', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortClasses: true}},
        FIXTURES.classWithUnsortedMembers,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.classWithUnsortedMembers,
        'perfectionist/sort-classes',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-classes` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortClasses: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-classes')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-classes` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortClasses: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-classes')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-classes` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortClasses: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-classes')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-classes` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortClasses: {
            overrides: {'perfectionist/sort-classes': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-classes')).toMatchObject({
        'perfectionist/sort-classes': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-classes` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortClasses: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-classes',
            'perfectionist/sort-classes',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-classes` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortClasses: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-classes',
            'perfectionist/sort-classes',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
