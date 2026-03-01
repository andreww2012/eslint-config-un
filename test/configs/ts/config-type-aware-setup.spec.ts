import {difference} from '../../src/utils';

describe('ts: sub config `configTypeAware.configSetup`', () => {
  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ts/type-aware/setup` eslint config, but not in `ts/type-aware/rules`', async () => {
        const FILES = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES}}},
        });

        expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toStrictEqual(
          FILES,
        );
        expect(
          configResult.getConfigByUnPostfix('ts/type-aware/rules')?.files,
        ).not.to.include.members(FILES);
      });

      it('does not affect `ts/non-type-aware/setup` eslint config', async () => {
        const FILES = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES}}},
        });

        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
        ).not.to.include.members(FILES);
      });

      it('takes precedence over `configSetup.files` for `ts/type-aware/setup`', async () => {
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

      it('merges `files` with `files` from `astro` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES_TS}}},
          astro: true,
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;

        expect(typeAwareSetupFiles).to.include.members(FILES_TS);
        expect(difference(typeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          `["**/*.astro"]`,
        );
      });

      it('merges `files` with `files` from `svelte` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES_TS}}},
          svelte: true,
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;

        expect(typeAwareSetupFiles).to.include.members(FILES_TS);
        expect(difference(typeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          `["**/*.svelte"]`,
        );
      });

      it('merges `files` with `files` from `vue` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {files: FILES_TS}}},
          vue: true,
        });

        const typeAwareSetupFiles = configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files;

        expect(typeAwareSetupFiles).to.include.members(FILES_TS);
        expect(difference(typeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          `["**/*.vue"]`,
        );
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ts/type-aware/setup` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {ignores: IGNORES}}},
        });

        const typeAwareSetupIgnores =
          configResult.getConfigByUnPostfix('ts/type-aware/setup')?.ignores;

        expect(typeAwareSetupIgnores).to.include.members(IGNORES);
        expect(typeAwareSetupIgnores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('does not affect `ts/type-aware/rules` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {ignores: IGNORES}}},
        });

        expect(
          configResult.getConfigByUnPostfix('ts/type-aware/rules')?.ignores,
        ).not.to.include.members(IGNORES);
      });

      it('does not affect `ts/non-type-aware/setup` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          ts: {configTypeAware: {configSetup: {ignores: IGNORES}}},
        });

        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.ignores,
        ).not.to.include.members(IGNORES);
      });

      it('takes precedence over `configSetup.ignores` for `ts/type-aware/setup`', async () => {
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

        expect(typeAwareSetupIgnores).to.include.members(IGNORES_TYPE_AWARE);
        expect(typeAwareSetupIgnores).not.to.include.members(IGNORES_NON_TYPE_AWARE);
        expect(typeAwareSetupIgnores?.length).toBeGreaterThan(IGNORES_TYPE_AWARE.length);
      });
    });
  });
});
