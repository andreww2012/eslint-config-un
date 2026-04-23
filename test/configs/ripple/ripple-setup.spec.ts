describe('ripple: sub config `setup`', () => {
  beforeEach(() => {
    addInstalledPackages({ripple: '0.1.0'});
  });

  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('ripple');

    it('creates `ripple/setup` eslint config when ripple is enabled', () => {
      expect(configResult.getConfigByUnPostfix('ripple/setup')).toBeDefined();
    });

    it('has default `files` in `ripple/setup` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('ripple/setup')?.files).toMatchInlineSnapshot(
        '["**/*.tsrx", "**/*.ripple"]',
      );
    });

    it('has default `ignores` in `ripple/setup` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('ripple/setup')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `ripple/setup` eslint config, but not in `ripple`', async () => {
        const FILES = ['src/**/*.tsrx'];

        const configResult = await computeEslintConfig({ripple: {configSetup: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('ripple/setup')?.files).toStrictEqual(FILES);
        expect(configResult.getConfigByUnPostfix('ripple')?.files).not.toIncludeAnyMembers(FILES);
      });

      it('disables `ripple/setup` eslint config when set to empty array, but not `ripple`', async () => {
        const configResult = await computeEslintConfig({ripple: {configSetup: {files: []}}});

        expect(configResult.getConfigByUnPostfix('ripple/setup')).toBeUndefined();
        expect(configResult.getConfigByUnPostfix('ripple')).toBeDefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `ripple/setup` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ripple: {configSetup: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('ripple/setup')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });

      it('does not use `ignores` from `configSetup` in the main `ripple` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          ripple: {configSetup: {ignores: IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix('ripple')?.ignores).not.toIncludeAnyMembers(
          IGNORES,
        );
      });
    });
  });
});
