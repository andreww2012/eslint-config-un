const FIXTURES = {
  componentWithMultipleStores: 'component-with-multiple-stores.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0', pinia: '2.2.0'});
});

describe('vue: sub config `pinia`', () => {
  describe('basic tests', () => {
    it('creates `pinia` eslint config and loads `pinia` plugin when `pinia` is installed', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getLoadedPlugin('pinia')).toBeDefined();

      const config = configResult.getConfigByUnPostfix('pinia');

      expect(config).toBeDefined();
      expect(config?.files).toBeUndefined();
    });

    it('does not create `pinia` eslint config and does not load `pinia` plugin when `pinia` is not installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig('vue');

      expect(configResult.getLoadedPlugin('pinia')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('pinia')).toBeUndefined();
    });

    it('creates `pinia` eslint config when set to `true`, regardless of `pinia` installation', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig({vue: {configPinia: true}});

      expect(configResult.getConfigByUnPostfix('pinia')).toBeDefined();
    });

    it('does not create `pinia` eslint config when set to `false`, regardless of `pinia` installation', async () => {
      const configResult = await computeEslintConfig({vue: {configPinia: false}});

      expect(configResult.getConfigByUnPostfix('pinia')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({vue: {configPinia: true}});

      expect(configResult.getRuleSeverities('pinia')).toMatchObject({
        'pinia/never-export-initialized-store': 2,
        'pinia/prefer-use-store-naming-convention': 2,
      });
    });

    it('`pinia/prefer-single-store-per-file` rule fires when multiple stores are defined in one file', async () => {
      const results = await testEslintConfig(
        {vue: {configPinia: true}},
        FIXTURES.componentWithMultipleStores,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.componentWithMultipleStores,
        'pinia/prefer-single-store-per-file',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Only one store definition per file is allowed."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `pinia` eslint config', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({vue: {configPinia: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('pinia')?.files).toStrictEqual(FILES);
      });

      it('disables `pinia` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({vue: {configPinia: {files: []}}});

        expect(configResult.getConfigByUnPostfix('pinia')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `pinia` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({vue: {configPinia: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('pinia')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `pinia` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configPinia: {
            overrides: {'pinia/never-export-initialized-store': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('pinia')).toMatchObject({
        'pinia/never-export-initialized-store': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `storesNameSuffix`', () => {
      it('uses `Store` suffix by default', async () => {
        const configResult = await computeEslintConfig({vue: {configPinia: true}});

        expect(
          configResult.getRuleEntryOptions('pinia', 'pinia/prefer-use-store-naming-convention'),
        ).toMatchObject([{storeSuffix: 'Store'}]);
      });

      it('uses custom suffix when `storesNameSuffix` is set', async () => {
        const SUFFIX = 'Pinia';

        const configResult = await computeEslintConfig({
          vue: {configPinia: {storesNameSuffix: SUFFIX}},
        });

        expect(
          configResult.getRuleEntryOptions('pinia', 'pinia/prefer-use-store-naming-convention'),
        ).toMatchObject([{storeSuffix: SUFFIX}]);
      });
    });
  });
});
