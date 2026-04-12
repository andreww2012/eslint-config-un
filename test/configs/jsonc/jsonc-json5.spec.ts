describe('jsonc: sub config `json5`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('json');

    it('does not create `jsonc/json5` eslint config when disabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('jsonc/json5')).toBeUndefined();
    });

    it('creates `jsonc/json5` eslint config when enabled', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson5: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/json5')).toBeDefined();
    });

    it('has default `files` in `jsonc/json5` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson5: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/json5')?.files).toMatchInlineSnapshot(
        '["**/*.json5"]',
      );
    });

    it('has default `ignores` in `jsonc/json5` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson5: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/json5')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      json: {configJson5: true},
    });

    it('has no rules by default', () => {
      expect(configResult.getConfigByUnPostfix('jsonc/json5')?.rules).toStrictEqual({});
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jsonc/json5` eslint config', async () => {
        const FILES = ['packages/**/*.json5'];

        const configResult = await computeEslintConfig({
          json: {configJson5: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('jsonc/json5')?.files).toStrictEqual(FILES);
      });

      it('disables `jsonc/json5` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          json: {configJson5: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('jsonc/json5')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jsonc/json5` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          json: {configJson5: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('jsonc/json5')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jsonc/json5` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {
          configJson5: {overrides: {'jsonc/no-dupe-keys': 0}, overridesAny: {'no-console': 0}},
        },
      });

      expect(configResult.getRuleEntrySeverity('jsonc/json5', 'jsonc/no-dupe-keys')).toBe(0);
      expect(configResult.getRuleEntrySeverity('jsonc/json5', 'no-console')).toBe(0);
    });
  });
});
