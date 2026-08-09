beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `reactX.typeAwareRules`', () => {
  describe('basic tests', () => {
    it('creates `react/x/rules-type-aware` eslint config when the `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig({react: true, ts: true});

      const config = configResult.getConfigByUnPostfix('react/x/rules-type-aware');

      expect(config).toBeDefined();
      expect(config?.files).toStrictEqual(
        configResult.getConfigByUnPostfix('ts/type-aware/rules')?.files,
      );
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `react/x/rules-type-aware` eslint config when the `ts` config is disabled', async () => {
      const configResult = await computeEslintConfig({react: true, ts: false});

      expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')).toBeUndefined();
    });

    it('does not create `react/x/rules-type-aware` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        react: {configReactX: {configTypeAwareRules: false}},
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')).toBeUndefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({react: true, ts: true});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('react/x/rules-type-aware')).toMatchObject({
        'eslint-react/no-implicit-children': 2,
        'eslint-react/no-unused-props': 1,
      });
    });

    it('does not add the type-aware rules to the `react/x` eslint config', () => {
      expect(configResult.getRuleEntry('react/x', 'eslint-react/no-implicit-key')).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/x/rules-type-aware` eslint config', async () => {
        const FILES = ['src/**/*.tsx'];

        const configResult = await computeEslintConfig({
          react: {configReactX: {configTypeAwareRules: {files: FILES}}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `react/x/rules-type-aware` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          react: {configReactX: {configTypeAwareRules: {files: []}}},
          ts: true,
        });

        expect(configResult.getConfigByUnPostfix('react/x/rules-type-aware')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `react/x/rules-type-aware` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          react: {configReactX: {configTypeAwareRules: {ignores: IGNORES}}},
          ts: true,
        });

        const ignores = configResult.getConfigByUnPostfix('react/x/rules-type-aware')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/x/rules-type-aware` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configReactX: {
            configTypeAwareRules: {
              overrides: {'eslint-react/no-implicit-key': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
        ts: true,
      });

      expect(configResult.getRuleSeverities('react/x/rules-type-aware')).toMatchObject({
        'eslint-react/no-implicit-key': 0,
        'no-console': 0,
      });
    });
  });
});
