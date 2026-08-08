const FIXTURES = {
  unsortedExports: 'unsorted-exports.js',
} as const;

describe('perfectionist: sub config `sortExports`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortExports: true}});

    it('creates `perfectionist/sort-exports` eslint config when `configSortExports` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-exports')).toBeDefined();
    });

    it('does not create `perfectionist/sort-exports` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-exports')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-exports` eslint config when `configSortExports` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortExports: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-exports')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-exports` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-exports')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-exports` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-exports')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortExports: true}});

    it('enables `perfectionist/sort-exports` rule', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist/sort-exports',
          'perfectionist/sort-exports',
        ),
      ).toBe(2);
    });

    it('keeps `perfectionist/sort-exports` rule disabled in the main `perfectionist` eslint config', () => {
      expect(configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-exports')).toBe(
        0,
      );
    });

    it('`perfectionist/sort-exports` rule fires on unsorted exports', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortExports: true}},
        FIXTURES.unsortedExports,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedExports,
        'perfectionist/sort-exports',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "./a" to come before "./b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-exports` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortExports: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-exports')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-exports` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortExports: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-exports')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-exports` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortExports: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-exports')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-exports` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortExports: {
            overrides: {'perfectionist/sort-exports': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-exports')).toMatchObject({
        'perfectionist/sort-exports': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-exports` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortExports: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-exports',
            'perfectionist/sort-exports',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-exports` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortExports: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-exports',
            'perfectionist/sort-exports',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
