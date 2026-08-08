const FIXTURES = {
  importWithUnsortedAttributes: 'import-with-unsorted-attributes.js',
} as const;

describe('perfectionist: sub config `sortImportAttributes`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortImportAttributes: true},
    });

    it('creates `perfectionist/sort-import-attributes` eslint config when `configSortImportAttributes` is `true`', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes'),
      ).toBeDefined();
    });

    it('does not create `perfectionist/sort-import-attributes` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-import-attributes` eslint config when `configSortImportAttributes` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortImportAttributes: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes'),
      ).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-import-attributes` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-import-attributes` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortImportAttributes: true},
    });

    it('enables `perfectionist/sort-import-attributes` rule', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist/sort-import-attributes',
          'perfectionist/sort-import-attributes',
        ),
      ).toBe(2);
    });

    it('keeps `perfectionist/sort-import-attributes` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-import-attributes'),
      ).toBe(0);
    });

    it('`perfectionist/sort-import-attributes` rule fires on import with unsorted attributes', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortImportAttributes: true}},
        FIXTURES.importWithUnsortedAttributes,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.importWithUnsortedAttributes,
        'perfectionist/sort-import-attributes',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "kind" to come before "type"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-import-attributes` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortImportAttributes: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-import-attributes` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortImportAttributes: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-import-attributes'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-import-attributes` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortImportAttributes: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-import-attributes',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-import-attributes` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortImportAttributes: {
            overrides: {'perfectionist/sort-import-attributes': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-import-attributes')).toMatchObject({
        'perfectionist/sort-import-attributes': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-import-attributes` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortImportAttributes: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-import-attributes',
            'perfectionist/sort-import-attributes',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-import-attributes` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortImportAttributes: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-import-attributes',
            'perfectionist/sort-import-attributes',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
