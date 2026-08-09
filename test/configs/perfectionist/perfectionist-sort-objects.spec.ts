const FIXTURES = {
  unsortedObject: 'unsorted-object.js',
} as const;

describe('perfectionist: sub config `sortObjects`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-objects` eslint config when `configSortObjects` is `true`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortObjects: true}});

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-objects');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-objects` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-objects')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-objects` eslint config when `configSortObjects` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortObjects: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-objects')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortObjects: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-objects')).toMatchObject({
        'perfectionist/sort-objects': 2,
      });
    });

    it('keeps `perfectionist/sort-objects` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-objects')).toBe(
        0,
      );
    });

    it('`perfectionist/sort-objects` rule fires on unsorted object', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortObjects: true}},
        FIXTURES.unsortedObject,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedObject,
        'perfectionist/sort-objects',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-objects` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjects: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-objects')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-objects` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjects: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-objects')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-objects` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjects: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-objects')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-objects` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortObjects: {
            overrides: {'perfectionist/sort-objects': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-objects')).toMatchObject({
        'perfectionist/sort-objects': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-objects` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortObjects: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-objects',
            'perfectionist/sort-objects',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-objects` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortObjects: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-objects',
            'perfectionist/sort-objects',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
