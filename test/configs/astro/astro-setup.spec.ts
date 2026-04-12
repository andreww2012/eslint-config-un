import {GLOB_ASTRO, GLOB_MARKDOWN} from '../../../src/constants';

describe('astro: sub config `setup`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('astro');

    it('creates `astro/setup` eslint config when astro is enabled', () => {
      expect(configResult.getConfigByUnPostfix('astro/setup')).toBeDefined();
    });

    it('has default `files` in `astro/setup` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('astro/setup')?.files).toMatchInlineSnapshot(
        '["**/*.astro"]',
      );
    });

    it('has default `ignores` in `astro/setup` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('astro/setup')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).not.toIncludeAnyMembers([GLOB_MARKDOWN, GLOB_ASTRO]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `astro/setup` eslint config, but not in `astro`', async () => {
        const FILES = ['src/**/*.astro'];

        const configResult = await computeEslintConfig({astro: {configSetup: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('astro/setup')?.files).toStrictEqual(FILES);
        expect(configResult.getConfigByUnPostfix('astro')?.files).not.toIncludeAnyMembers(FILES);
      });

      it('disables `astro/setup` eslint config when set to empty array, but not `astro`', async () => {
        const configResult = await computeEslintConfig({astro: {configSetup: {files: []}}});

        expect(configResult.getConfigByUnPostfix('astro/setup')).toBeUndefined();
        expect(configResult.getConfigByUnPostfix('astro')).toBeDefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `astro/setup` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          astro: {configSetup: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('astro/setup')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('does not use `ignores` from `configSetup` in the main `astro` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          astro: {configSetup: {ignores: IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('astro')?.ignores).not.toIncludeAnyMembers(
          IGNORES,
        );
      });
    });
  });
});
