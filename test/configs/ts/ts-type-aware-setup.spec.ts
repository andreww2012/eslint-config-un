import {difference} from '../../../src/utils';

describe('ts: sub config `typeAware.setup`', () => {
  describe('basic tests', () => {
    it('creates `ts/type-aware/setup` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ts');

      const config = configResult.getConfigByUnPostfix('ts/type-aware/setup');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
      expect(config?.languageOptions?.['parserOptions']).toMatchObject({
        projectService: {},
        sourceType: 'module',
      });
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ts/type-aware/setup` eslint config, but not in `ts/type-aware/rules` or `ts/non-type-aware/setup`', async () => {
        const FILES = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES}}},
        });

        expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toStrictEqual(
          FILES,
        );
        expect(
          configResult.getConfigByUnPostfix('ts/type-aware/rules')?.files,
        ).not.toIncludeAnyMembers(FILES);
        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
        ).not.toIncludeAnyMembers(FILES);
      });

      it('takes precedence over `configSetup.files` for `ts/type-aware/setup` eslint config', async () => {
        const FILES_NON_TYPE_AWARE = ['src/**/*.ts'];
        const FILES_TYPE_AWARE = ['lib/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {
            configSetup: {files: FILES_NON_TYPE_AWARE},
            configTypeAware: {configSetup: {files: FILES_TYPE_AWARE}},
          },
        });

        expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toStrictEqual(
          FILES_TYPE_AWARE,
        );
        expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).toStrictEqual(
          FILES_NON_TYPE_AWARE,
        );
      });

      it('does not create `ts/type-aware/setup` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: []}}},
        });

        expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')).toBeUndefined();
      });

      it('merges with `files` from `astro` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES_TS}}},
          astro: true,
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;

        expect(typeAwareSetupFiles).toIncludeAllMembers(FILES_TS);
        expect(difference(typeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          '["**/*.astro"]',
        );
      });

      it('merges with `files` from `svelte` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES_TS}}},
          svelte: true,
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;

        expect(typeAwareSetupFiles).toIncludeAllMembers(FILES_TS);
        expect(difference(typeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          '["**/*.svelte"]',
        );
      });

      it('merges with `files` from `vue` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];

        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES_TS}}},
          vue: true,
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;

        expect(typeAwareSetupFiles).toIncludeAllMembers(FILES_TS);
        expect(difference(typeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          '["**/*.vue"]',
        );
      });

      it("does not add `vue` files to `ts/type-aware/setup` eslint config when vue's `typescriptRules` is `only-non-type-aware`", async () => {
        const configResult = await computeEslintConfig({
          ts: true,
          vue: {
            configEnforceTypescriptInScriptSection: {
              typescriptRules: 'only-non-type-aware',
              files: ['**/*.vue'],
            },
          },
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;
        const nonTypeAwareSetupFiles =
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files;

        expect(typeAwareSetupFiles).not.toIncludeAnyMembers(['**/*.vue']);
        expect(nonTypeAwareSetupFiles).toIncludeAllMembers(['**/*.vue']);
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ts/type-aware/setup` eslint config (but not in `ts/type-aware/rules` or `ts/non-type-aware/setup`) and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {ignores: IGNORES}}},
        });

        const typeAwareSetupIgnores =
          configResult.getConfigByUnPostfix('ts/type-aware/setup')?.ignores;

        expect(typeAwareSetupIgnores).toIncludeAllMembers(IGNORES);
        expect(typeAwareSetupIgnores?.length).toBeGreaterThan(IGNORES.length);

        expect(
          configResult.getConfigByUnPostfix('ts/type-aware/rules')?.ignores,
        ).not.toIncludeAnyMembers(IGNORES);
        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.ignores,
        ).not.toIncludeAnyMembers(IGNORES);
      });

      it('takes precedence over `configSetup.ignores` for `ts/type-aware/setup` eslint config', async () => {
        const IGNORES_NON_TYPE_AWARE = ['**/fixtures/**'];
        const IGNORES_TYPE_AWARE = ['test/fixtures/**'];

        const configResult = await computeEslintConfig({
          ts: {
            configSetup: {ignores: IGNORES_NON_TYPE_AWARE},
            configTypeAware: {configSetup: {ignores: IGNORES_TYPE_AWARE}},
          },
        });

        const typeAwareSetupIgnores =
          configResult.getConfigByUnPostfix('ts/type-aware/setup')?.ignores;

        expect(typeAwareSetupIgnores).toIncludeAllMembers(IGNORES_TYPE_AWARE);
        expect(typeAwareSetupIgnores).not.toIncludeAnyMembers(IGNORES_NON_TYPE_AWARE);
        expect(typeAwareSetupIgnores?.length).toBeGreaterThan(IGNORES_TYPE_AWARE.length);
      });
    });
  });
});
