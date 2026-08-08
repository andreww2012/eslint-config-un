const FIXTURES = {
  interfaceWithUnsortedMembers: 'interface-with-unsorted-members.ts',
} as const;

describe('perfectionist: sub config `sortInterfaces`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortInterfaces: true},
    });

    it('creates `perfectionist/sort-interfaces` eslint config when `configSortInterfaces` is `true`', () => {
      expect(configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')).toBeDefined();
    });

    it('does not create `perfectionist/sort-interfaces` eslint config by default', async () => {
      const configResult = await computeEslintConfig('perfectionist');

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')).toBeUndefined();
    });

    it('does not create `perfectionist/sort-interfaces` eslint config when `configSortInterfaces` is `false`', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {configSortInterfaces: false},
      });

      expect(configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')).toBeUndefined();
    });

    it('does not restrict `files` in `perfectionist/sort-interfaces` eslint config by default', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')?.files,
      ).toBeUndefined();
    });

    it('has default `ignores` in `perfectionist/sort-interfaces` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')?.ignores?.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      ts: true,
      perfectionist: {configSortInterfaces: true},
    });

    it('enables `perfectionist/sort-interfaces` rule', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'perfectionist/sort-interfaces',
          'perfectionist/sort-interfaces',
        ),
      ).toBe(2);
    });

    it('keeps `perfectionist/sort-interfaces` rule disabled in the main `perfectionist` eslint config', () => {
      expect(
        configResult.getRuleEntrySeverity('perfectionist', 'perfectionist/sort-interfaces'),
      ).toBe(0);
    });

    it('`perfectionist/sort-interfaces` rule fires on interface with unsorted members', async () => {
      const results = await testEslintConfig(
        {ts: true, perfectionist: {configSortInterfaces: true}},
        FIXTURES.interfaceWithUnsortedMembers,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.interfaceWithUnsortedMembers,
        'perfectionist/sort-interfaces',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected "a" to come before "b"."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `perfectionist/sort-interfaces` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortInterfaces: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `perfectionist/sort-interfaces` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortInterfaces: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `perfectionist/sort-interfaces` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          perfectionist: {configSortInterfaces: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('perfectionist/sort-interfaces')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `perfectionist/sort-interfaces` eslint config', async () => {
      const configResult = await computeEslintConfig({
        perfectionist: {
          configSortInterfaces: {
            overrides: {'perfectionist/sort-interfaces': 1},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('perfectionist/sort-interfaces')).toMatchObject({
        'perfectionist/sort-interfaces': 1,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `options`', () => {
      it('does not pass rule options to `perfectionist/sort-interfaces` rule by default', async () => {
        const configResult = await computeEslintConfig({
          perfectionist: {configSortInterfaces: true},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-interfaces',
            'perfectionist/sort-interfaces',
          ),
        ).toStrictEqual([]);
      });

      it('passes user-provided rule options to `perfectionist/sort-interfaces` rule', async () => {
        const OPTIONS = {type: 'line-length'} as const;

        const configResult = await computeEslintConfig({
          perfectionist: {configSortInterfaces: {options: OPTIONS}},
        });

        expect(
          configResult.getRuleEntryOptions(
            'perfectionist/sort-interfaces',
            'perfectionist/sort-interfaces',
          ),
        ).toStrictEqual([OPTIONS]);
      });
    });
  });
});
