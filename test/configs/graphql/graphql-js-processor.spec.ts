describe('graphql: sub config `jsProcessor`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('graphql');

    it('creates `graphql/processor` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('graphql/processor')).toBeDefined();
    });

    it('does not create `graphql/processor` eslint config when `configJsProcessor` is `false`', async () => {
      const noProcessorConfigResult = await computeEslintConfig({
        graphql: {configJsProcessor: false},
      });

      expect(noProcessorConfigResult.getConfigByUnPostfix('graphql/processor')).toBeUndefined();
    });

    it('has default `files` in `graphql/processor` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('graphql/processor')?.files).toMatchInlineSnapshot(
        '["**/*.?([cm])[jt]s?(x)", "**/*.flow", "**/*.svelte", "**/*.astro", "**/*.{gjs,gts}"]',
      );
    });

    it('has default `ignores` in `graphql/processor` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('graphql/processor')?.ignores?.length,
      ).toBeGreaterThan(0);
    });

    it('creates `graphql/processor` eslint config independently of main `graphql` config being disabled via `files: []`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {files: [], configJsProcessor: true},
      });

      expect(configResult.getConfigByUnPostfix('graphql')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('graphql/processor')).toBeDefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `graphql/processor` eslint config', async () => {
        const FILES = ['src/**/*.{js,ts}'];

        const configResult = await computeEslintConfig({
          graphql: {configJsProcessor: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('graphql/processor')?.files).toStrictEqual(FILES);
      });

      it('disables `graphql/processor` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          graphql: {configJsProcessor: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('graphql/processor')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `graphql/processor` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          graphql: {configJsProcessor: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('graphql/processor')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });
  });
});
