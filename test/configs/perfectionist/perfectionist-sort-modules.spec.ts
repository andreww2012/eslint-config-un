const FIXTURES = {
  unsortedModuleMembers: 'unsorted-module-members.ts',
} as const;

describe('perfectionist: sub config `sortModules`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-modules` eslint config when `configSortModules` is `true`', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        perfectionist: {configSortModules: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-modules');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-modules` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-modules')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-modules` eslint config when `configSortModules` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortModules: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-modules')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortModules: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-modules')).toMatchObject({
        'perfectionist/sort-modules': 2,
      });
    });

    it('keeps `perfectionist/sort-modules` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-modules')).toBe(
        0,
      );
    });

    it('`perfectionist/sort-modules` rule fires on unsorted module members', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortModules: true}},
        FIXTURES.unsortedModuleMembers,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedModuleMembers,
        'perfectionist/sort-modules',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "A" to come before "B"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-modules` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortModules: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-modules')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-modules` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortModules: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-modules')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-modules` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortModules: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-modules')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-modules` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortModules: {
            overrides: {'perfectionist/sort-modules': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-modules')).toMatchObject({
        'perfectionist/sort-modules': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-modules` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortModules: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-modules',
            'perfectionist/sort-modules',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-modules` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortModules: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-modules',
            'perfectionist/sort-modules',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
