describe('check-file: sub config `configEnableCheckFileProcessor`', () => {
  describe('basic tests', () => {
    it('does not create `check-file/processor` eslint config by default', async () => {
      const configResult = await computeEslintConfig('checkFile');

      expect(configResult.getConfigByUnPostfix('check-file/processor')).toBeUndefined();
    });

    it('creates `check-file/processor` eslint config when `configEnableCheckFileProcessor` is provided', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {configEnableCheckFileProcessor: {}},
      });

      expect(configResult.getConfigByUnPostfix('check-file/processor')).toBeDefined();
    });

    it('has no explicit `files` restriction in `check-file/processor` eslint config by default', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {configEnableCheckFileProcessor: {}},
      });

      expect(configResult.getConfigByUnPostfix('check-file/processor')?.files).toBeUndefined();
    });

    it('has default `ignores` in `check-file/processor` eslint config', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {configEnableCheckFileProcessor: {}},
      });

      const ignores = configResult.getConfigByUnPostfix('check-file/processor')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
    });

    it('creates `check-file/processor` eslint config independently of `check-file` being disabled via `files: []`', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {files: [], configEnableCheckFileProcessor: {}},
      });

      expect(configResult.getConfigByUnPostfix('check-file')).toBeUndefined();

      expect(configResult.getConfigByUnPostfix('check-file/processor')).toBeDefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `check-file/processor` eslint config', async () => {
        const FILES = ['src/**/*.{js,ts}'];
        const configResult = await computeEslintConfig({
          checkFile: {configEnableCheckFileProcessor: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('check-file/processor')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `check-file/processor` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          checkFile: {configEnableCheckFileProcessor: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('check-file/processor')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `check-file/processor` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          checkFile: {configEnableCheckFileProcessor: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('check-file/processor')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });
  });
});
