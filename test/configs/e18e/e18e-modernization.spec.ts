const FIXTURES = {
  hasOwnPropertyCall: 'has-own-property-call.ts',
} as const;

describe('e18e: sub config `modernization`', () => {
  describe('basic tests', () => {
    it('creates `e18e/modernization` eslint config by default', async () => {
      const configResult = await computeEslintConfig('e18e');

      const config = configResult.getConfigByUnPostfix('e18e/modernization');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
    });

    it('does not create `e18e/modernization` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({e18e: {configModernization: false}});

      expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('e18e');

      expect(configResult.getRuleSeverities('e18e/modernization')).toMatchObject({
        'e18e/prefer-array-at': 2,
        'e18e/prefer-get-or-insert': 0,
      });
    });

    it('`e18e/prefer-object-has-own` rule fires on a `Object.prototype.hasOwnProperty` call', async () => {
      const results = await testEslintConfig(
        {e18e: true, ts: true},
        FIXTURES.hasOwnPropertyCall,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hasOwnPropertyCall,
        'e18e/prefer-object-has-own',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Use Object.hasOwn() instead of hasOwnProperty"',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `e18e/modernization` eslint config', async () => {
        const FILES = ['src/**/*.js'];

        const configResult = await computeEslintConfig({
          e18e: {configModernization: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('e18e/modernization')?.files).toStrictEqual(FILES);
      });

      it('disables `e18e/modernization` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({e18e: {configModernization: {files: []}}});

        expect(configResult.getConfigByUnPostfix('e18e/modernization')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `e18e/modernization` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          e18e: {configModernization: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('e18e/modernization')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `e18e/modernization` eslint config', async () => {
      const configResult = await computeEslintConfig({
        e18e: {
          configModernization: {
            overrides: {'e18e/prefer-array-at': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('e18e/modernization')).toMatchObject({
        'e18e/prefer-array-at': 0,
        'no-console': 0,
      });
    });
  });
});
