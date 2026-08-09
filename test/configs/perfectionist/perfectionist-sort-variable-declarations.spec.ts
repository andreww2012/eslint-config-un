const FIXTURES = {
  unsortedVariableDeclarations: 'unsorted-variable-declarations.js',
} as const;

describe('perfectionist: sub config `sortVariableDeclarations`', () => {
  describe('basic tests', () => {
    it('creates `perfectionist/sort-variable-declarations` eslint config when `configSortVariableDeclarations` is `true`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortVariableDeclarations: true},
      });

      const config = configResult.getConfigByUnPostfix('perfectionist/sort-variable-declarations');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `perfectionist/sort-variable-declarations` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-variable-declarations'),
      ).toBeUndefined();
    });

    it('does not create `perfectionist/sort-variable-declarations` eslint config when `configSortVariableDeclarations` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortVariableDeclarations: false},
      });

      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-variable-declarations'),
      ).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      perfectionist: {configSortVariableDeclarations: true},
    });

    it('correctly sets severities by default', () => {
      expect(
        configResult.getRuleSeverities('perfectionist/sort-variable-declarations'),
      ).toMatchObject({
        'perfectionist/sort-variable-declarations': 2,
      });
    });

    it('keeps `perfectionist/sort-variable-declarations` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist',
          'perfectionist/sort-variable-declarations',
        ),
      ).toBe(0);
    });

    it('`perfectionist/sort-variable-declarations` rule fires on unsorted variable declarations', async () => {
      const results = await testEslintConfig(
        {perfectionist: {configSortVariableDeclarations: true}},
        FIXTURES.unsortedVariableDeclarations,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unsortedVariableDeclarations,
        'perfectionist/sort-variable-declarations',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-variable-declarations` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortVariableDeclarations: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-variable-declarations')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-variable-declarations` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortVariableDeclarations: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-variable-declarations'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-variable-declarations` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortVariableDeclarations: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'perfectionist/sort-variable-declarations',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-variable-declarations` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortVariableDeclarations: {
            overrides: {'perfectionist/sort-variable-declarations': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleSeverities('perfectionist/sort-variable-declarations'),
      ).toMatchObject({
        'perfectionist/sort-variable-declarations': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-variable-declarations` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortVariableDeclarations: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-variable-declarations',
            'perfectionist/sort-variable-declarations',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-variable-declarations` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortVariableDeclarations: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-variable-declarations',
            'perfectionist/sort-variable-declarations',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
