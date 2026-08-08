const FIXTURES = {
  exportWithUnsortedAttributes: 'export-with-unsorted-attributes.js',
} as const;

describe('perfectionist: sub config `sortExportAttributes`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortExportAttributes: true},
    });

    it('creates `perfectionist/sort-export-attributes` eslint config when `configSortExportAttributes` is `true`', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes'),
      ).toBeDefined();
    });

    it('does not create `perfectionist/sort-export-attributes` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-export-attributes` eslint config when `configSortExportAttributes` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortExportAttributes: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes'),
      ).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-export-attributes` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-export-attributes` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortExportAttributes: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-export-attributes')).toMatchObject({
        'perfectionist/sort-export-attributes': 2,
      });
    });

    it('keeps `perfectionist/sort-export-attributes` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-export-attributes'),
      ).toBe(0);
    });

    it('`perfectionist/sort-export-attributes` rule fires on export with unsorted attributes', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortExportAttributes: true}},
        FIXTURES.exportWithUnsortedAttributes,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.exportWithUnsortedAttributes,
        'perfectionist/sort-export-attributes',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "kind" to come before "type"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-export-attributes` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortExportAttributes: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-export-attributes` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortExportAttributes: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-export-attributes'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-export-attributes` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortExportAttributes: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-export-attributes',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-export-attributes` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortExportAttributes: {
            overrides: {'perfectionist/sort-export-attributes': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-export-attributes')).toMatchObject({
        'perfectionist/sort-export-attributes': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-export-attributes` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortExportAttributes: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-export-attributes',
            'perfectionist/sort-export-attributes',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-export-attributes` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortExportAttributes: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-export-attributes',
            'perfectionist/sort-export-attributes',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
