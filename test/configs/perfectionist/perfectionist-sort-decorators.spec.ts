const FIXTURES = {
  classWithUnsortedDecorators: 'class-with-unsorted-decorators.ts',
} as const;

describe('perfectionist: sub config `sortDecorators`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-decorators` eslint config when `configSortDecorators` is `true`', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        perfectionist: {configSortDecorators: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-decorators');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-decorators` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-decorators')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-decorators` eslint config when `configSortDecorators` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortDecorators: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-decorators')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortDecorators: true},
    });

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-decorators')).toMatchObject({
        'perfectionist/sort-decorators': 2,
      });
    });

    it('keeps `perfectionist/sort-decorators` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-decorators'),
      ).toBe(0);
    });

    it('`perfectionist/sort-decorators` rule fires on class with unsorted decorators', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortDecorators: true}},
        FIXTURES.classWithUnsortedDecorators,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.classWithUnsortedDecorators,
        'perfectionist/sort-decorators',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-decorators` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortDecorators: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-decorators')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-decorators` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortDecorators: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-decorators')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-decorators` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortDecorators: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-decorators')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-decorators` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortDecorators: {
            overrides: {'perfectionist/sort-decorators': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-decorators')).toMatchObject({
        'perfectionist/sort-decorators': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-decorators` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortDecorators: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-decorators',
            'perfectionist/sort-decorators',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-decorators` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortDecorators: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-decorators',
            'perfectionist/sort-decorators',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
