const FIXTURES = {
  jsxElementWithUnsortedProps: 'jsx-element-with-unsorted-props.jsx',
} as const;

describe('perfectionist: sub config `sortJsxProps`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortJsxProps: true}});

    it('creates `perfectionist/sort-jsx-props` eslint config when `configSortJsxProps` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')).toBeDefined();
    });

    it('does not create `perfectionist/sort-jsx-props` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-jsx-props` eslint config when `configSortJsxProps` is `false`', async () => {
      const configResult = await computeEslintConfig({perfectionist: {configSortJsxProps: false}});

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-jsx-props` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-jsx-props` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({perfectionist: {configSortJsxProps: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('perfectionist/sort-jsx-props')).toMatchObject({
        'perfectionist/sort-jsx-props': 2,
      });
    });

    it('keeps `perfectionist/sort-jsx-props` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-jsx-props'),
      ).toBe(0);
    });

    it('`perfectionist/sort-jsx-props` rule fires on jsx element with unsorted props', async () => {
      addInstalledPackages({react: '19.0.0'});

      const results = await testEslintConfig(
        {react: true, perfectionist: {configSortJsxProps: true}},
        FIXTURES.jsxElementWithUnsortedProps,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.jsxElementWithUnsortedProps,
        'perfectionist/sort-jsx-props',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-jsx-props` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortJsxProps: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-jsx-props` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortJsxProps: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-jsx-props` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortJsxProps: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-jsx-props')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-jsx-props` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortJsxProps: {
            overrides: {'perfectionist/sort-jsx-props': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-jsx-props')).toMatchObject({
        'perfectionist/sort-jsx-props': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-jsx-props` rule by default', async () => {
        const configResult = await computeEslintConfig({perfectionist: {configSortJsxProps: true}});

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-jsx-props',
            'perfectionist/sort-jsx-props',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-jsx-props` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortJsxProps: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-jsx-props',
            'perfectionist/sort-jsx-props',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
