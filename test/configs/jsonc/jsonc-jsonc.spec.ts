describe('jsonc: sub config `jsonc`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('jsonc');

    it('does not create `jsonc/jsonc` eslint config when disabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('jsonc/jsonc')).toBeUndefined();
    });

    it('creates `jsonc/jsonc` eslint config when enabled', async () => {
      const configResult = await computeEslintConfig({
        jsonc: {configJsonc: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/jsonc')).toBeDefined();
    });

    it('has default `files` in `jsonc/jsonc` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonc: {configJsonc: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/jsonc')?.files).toMatchInlineSnapshot(
        '["**/*.jsonc"]',
      );
    });

    it('has default `ignores` in `jsonc/jsonc` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonc: {configJsonc: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/jsonc')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      jsonc: {configJsonc: true},
    });

    it('has no rules by default', () => {
      expect(configResult.getConfigByUnPostfix('jsonc/jsonc')?.rules).toStrictEqual({});
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jsonc/jsonc` eslint config', async () => {
        const FILES = ['packages/**/*.jsonc'];

        const configResult = await computeEslintConfig({
          jsonc: {configJsonc: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('jsonc/jsonc')?.files).toStrictEqual(FILES);
      });

      it('disables `jsonc/jsonc` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          jsonc: {configJsonc: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('jsonc/jsonc')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jsonc/jsonc` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          jsonc: {configJsonc: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('jsonc/jsonc')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jsonc/jsonc` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsonc: {
          configJsonc: {overrides: {'jsonc/no-dupe-keys': 0}, overridesAny: {'no-console': 0}},
        },
      });

      expect(configResult.getRuleEntrySeverity('jsonc/jsonc', 'jsonc/no-dupe-keys')).toBe(0);
      expect(configResult.getRuleEntrySeverity('jsonc/jsonc', 'no-console')).toBe(0);
    });
  });
});
