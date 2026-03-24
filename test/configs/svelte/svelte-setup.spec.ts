describe('svelte: sub config `setup`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('svelte');

    it('creates `svelte/setup` eslint config when svelte is enabled', () => {
      expect(configResult.getConfigByUnPostfix('svelte/setup')).toBeDefined();
    });

    it('has default `files` in `svelte/setup` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('svelte/setup')?.files).toMatchInlineSnapshot(
        '["**/*.svelte", "**/*.svelte.{js,ts}"]',
      );
    });

    it('has default `ignores` in `svelte/setup` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('svelte/setup')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `svelte/setup` eslint config, but not in `svelte`', async () => {
        const FILES = ['src/**/*.svelte'];

        const configResult = await computeEslintConfig({svelte: {configSetup: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('svelte/setup')?.files).toStrictEqual(FILES);
        expect(configResult.getConfigByUnPostfix('svelte')?.files).not.toIncludeAnyMembers(FILES);
      });

      it('disables `svelte/setup` eslint config when `files` is empty array, but not `svelte`', async () => {
        const configResult = await computeEslintConfig({svelte: {configSetup: {files: []}}});

        expect(configResult.getConfigByUnPostfix('svelte/setup')).toBeUndefined();
        expect(configResult.getConfigByUnPostfix('svelte')).toBeDefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `svelte/setup` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          svelte: {configSetup: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('svelte/setup')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('does not use `ignores` from `configSetup` in the main `svelte` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          svelte: {configSetup: {ignores: IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('svelte')?.ignores).not.toIncludeAnyMembers(
          IGNORES,
        );
      });
    });
  });
});
