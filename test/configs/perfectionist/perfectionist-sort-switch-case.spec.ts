const FIXTURES = {
  switchWithUnsortedCases: 'switch-with-unsorted-cases.js',
} as const;

describe('perfectionist: sub config `sortSwitchCase`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortSwitchCase: true}});

    it('creates `perfectionist/sort-switch-case` eslint config when `configSortSwitchCase` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')).toBeDefined();
    });

    it('does not create `perfectionist/sort-switch-case` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-switch-case` eslint config when `configSortSwitchCase` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortSwitchCase: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-switch-case` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-switch-case` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortSwitchCase: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-switch-case')).toMatchObject({
        'perfectionist/sort-switch-case': 2,
      });
    });

    it('keeps `perfectionist/sort-switch-case` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-switch-case'),
      ).toBe(0);
    });

    it('`perfectionist/sort-switch-case` rule fires on switch with unsorted cases', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortSwitchCase: true}},
        FIXTURES.switchWithUnsortedCases,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.switchWithUnsortedCases,
        'perfectionist/sort-switch-case',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-switch-case` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortSwitchCase: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-switch-case` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortSwitchCase: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-switch-case')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-switch-case` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortSwitchCase: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-switch-case',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-switch-case` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortSwitchCase: {
            overrides: {'perfectionist/sort-switch-case': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-switch-case')).toMatchObject({
        'perfectionist/sort-switch-case': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-switch-case` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortSwitchCase: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-switch-case',
            'perfectionist/sort-switch-case',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-switch-case` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortSwitchCase: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-switch-case',
            'perfectionist/sort-switch-case',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
