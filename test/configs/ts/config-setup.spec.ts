import {difference} from '../../../src/utils';

describe('ts: sub config `configSetup`', () => {
  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ts/non-type-aware/setup` eslint config, but not in `ts/non-type-aware/rules`', async () => {
        const FILES = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).toStrictEqual(
          FILES,
        );
        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/rules')?.files,
        ).not.to.include.members(FILES);
      });

      it('uses `files` in `ts/type-aware/setup` eslint config if not specified there', async () => {
        const FILES = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toStrictEqual(
          FILES,
        );
      });

      it('does not use `files` in `ts/type-aware/setup` eslint config if specified there', async () => {
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
      });

      it('merges `files` with `files` from `astro` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {files: FILES_TS}},
          astro: true,
        });

        const nonTypeAwareSetupFiles =
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files;

        expect(nonTypeAwareSetupFiles).to.include.members(FILES_TS);
        expect(difference(nonTypeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          `["**/*.astro"]`,
        );
      });

      it('merges `files` with `files` from `svelte` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {files: FILES_TS}},
          svelte: true,
        });

        const nonTypeAwareSetupFiles =
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files;

        expect(nonTypeAwareSetupFiles).to.include.members(FILES_TS);
        expect(difference(nonTypeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          `["**/*.svelte"]`,
        );
      });

      it('merges `files` with `files` from `vue` config if the latter is enabled', async () => {
        const FILES_TS = ['src/**/*.ts'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {files: FILES_TS}},
          vue: true,
        });

        const nonTypeAwareSetupFiles =
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files;

        expect(nonTypeAwareSetupFiles).to.include.members(FILES_TS);
        expect(difference(nonTypeAwareSetupFiles || [], FILES_TS)).toMatchInlineSnapshot(
          `["**/*.vue"]`,
        );
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ts/non-type-aware/setup` when `configSetup.ignores` is provided, but does not affect `ts/non-type-aware/rules`', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {ignores: IGNORES}},
        });

        const nonTypeAwareSetupIgnores =
          configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.ignores;

        expect(nonTypeAwareSetupIgnores).to.include.members(IGNORES);
        expect(nonTypeAwareSetupIgnores?.length).toBeGreaterThan(IGNORES.length);

        expect(
          configResult.getConfigByUnPostfix('ts/non-type-aware/rules')?.ignores,
        ).not.to.include.members(IGNORES);
      });

      it('uses `ignores` in `ts/type-aware/setup` eslint config if not specified there', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          ts: {configSetup: {ignores: IGNORES}},
        });

        const typeAwareSetup = configResult.getConfigByUnPostfix('ts/type-aware/setup');

        expect(typeAwareSetup?.ignores).to.include.members(IGNORES);
        expect(typeAwareSetup?.ignores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('does not use `ignores` in `ts/type-aware/setup` eslint config if specified there', async () => {
        const IGNORES_NON_TYPE_AWARE = ['**/fixtures/**'];
        const IGNORES_TYPE_AWARE = ['test/fixtures/**'];
        const configResult = await computeEslintConfig({
          ts: {
            configSetup: {ignores: IGNORES_NON_TYPE_AWARE},
            configTypeAware: {configSetup: {ignores: IGNORES_TYPE_AWARE}},
          },
        });

        const typeAwareSetup = configResult.getConfigByUnPostfix('ts/type-aware/setup');

        expect(typeAwareSetup?.ignores).to.include.members(IGNORES_TYPE_AWARE);
        expect(typeAwareSetup?.ignores?.length).toBeGreaterThan(IGNORES_TYPE_AWARE.length);
      });
    });
  });
});
