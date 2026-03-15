describe('jsonc: sub config `configJson`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('json');

    it('does not create `jsonc/json` eslint config when disabled (default)', () => {
      expect(configResult.getConfigByUnPostfix('jsonc/json')).toBeUndefined();
    });

    it('creates `jsonc/json` eslint config when enabled', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/json')).toBeDefined();
    });

    it('has default `files` in `jsonc/json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/json')?.files).toMatchInlineSnapshot(
        '["**/*.json"]',
      );
    });

    it('has default `ignores` in `jsonc/json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson: true},
      });

      expect(configResult.getConfigByUnPostfix('jsonc/json')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({
      json: {configJson: true},
    });

    it('has no rules by default', () => {
      expect(configResult.getConfigByUnPostfix('jsonc/json')?.rules).toStrictEqual({});
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `jsonc/json` eslint config', async () => {
        const FILES = ['packages/**/*.json'];
        const configResult = await computeEslintConfig({
          json: {configJson: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('jsonc/json')?.files).toStrictEqual(FILES);
      });

      it('disables `jsonc/json` eslint config when `files` is empty array', async () => {
        const configResult = await computeEslintConfig({
          json: {configJson: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('jsonc/json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `jsonc/json` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];
        const configResult = await computeEslintConfig({
          json: {configJson: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('jsonc/json')?.ignores;

        expect(ignores).to.include.members(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `jsonc/json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson: {overrides: {'jsonc/no-dupe-keys': 0}, overridesAny: {'no-console': 0}}},
      });

      expect(configResult.getRuleEntrySeverity('jsonc/json', 'jsonc/no-dupe-keys')).toBe(0);
      expect(configResult.getRuleEntrySeverity('jsonc/json', 'no-console')).toBe(0);
    });
  });
});
