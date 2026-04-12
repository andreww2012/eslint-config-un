const FIXTURES = {
  typeAssertion: 'type-assertion.ts',
} as const;

describe('ts: sub config `noTypeAssertion`', () => {
  describe('basic tests', () => {
    it('does not create `no-type-assertion` eslint config and does not load `no-type-assertion` plugin by default', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getConfigByUnPostfix('no-type-assertion')).toBeUndefined();
      expect(configResult.getLoadedPlugin('no-type-assertion')).toBeUndefined();
    });

    it('creates `no-type-assertion` eslint config, loads `no-type-assertion` plugin when set to `true`', async () => {
      const configResult = await computeEslintConfig({ts: {configNoTypeAssertion: true}});

      expect(configResult.getLoadedPlugin('no-type-assertion')).toBeDefined();

      const config = configResult.getConfigByUnPostfix('no-type-assertion');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
    });

    it('does not create `no-type-assertion` eslint config and does not load `no-type-assertion` plugin when set to `false`', async () => {
      const configResult = await computeEslintConfig({ts: {configNoTypeAssertion: false}});

      expect(configResult.getConfigByUnPostfix('no-type-assertion')).toBeUndefined();
      expect(configResult.getLoadedPlugin('no-type-assertion')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({ts: {configNoTypeAssertion: true}});

      expect(configResult.getRuleSeverities('no-type-assertion')).toMatchObject({
        'no-type-assertion/no-type-assertion': 2,
      });
    });

    it('`no-type-assertion/no-type-assertion` rule fires on a file using type assertion', async () => {
      const results = await testEslintConfig(
        {ts: {configNoTypeAssertion: true}},
        FIXTURES.typeAssertion,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.typeAssertion,
        'no-type-assertion/no-type-assertion',
      );

      expect(error?.message).toMatchInlineSnapshot('"Do not use as operator for type assertion"');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `no-type-assertion` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {configNoTypeAssertion: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('no-type-assertion')?.files).toStrictEqual(FILES);
      });

      it('disables `no-type-assertion` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({ts: {configNoTypeAssertion: {files: []}}});

        expect(configResult.getConfigByUnPostfix('no-type-assertion')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `no-type-assertion` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ts: {configNoTypeAssertion: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('no-type-assertion')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `no-type-assertion` eslint config', async () => {
      const configResult = await computeEslintConfig({
        ts: {
          configNoTypeAssertion: {
            overrides: {'no-type-assertion/no-type-assertion': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('no-type-assertion')).toMatchObject({
        'no-type-assertion/no-type-assertion': 0,
        'no-console': 0,
      });
    });
  });
});
