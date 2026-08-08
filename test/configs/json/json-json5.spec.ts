const FIXTURES = {
  dupKeysJson5: 'dup-keys.json5',
} as const;

describe('json: sub config `json5`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('json');

    it('creates `json/json5` eslint config by default when `json` is enabled', () => {
      expect(configResult.getConfigByUnPostfix('json/json5')).toBeDefined();
    });

    it('does not create `json/json5` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        json: {configJson5: false},
      });

      expect(configResult.getConfigByUnPostfix('json/json5')).toBeUndefined();
    });

    it('has default `files` in `json/json5` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('json/json5')?.files).toMatchInlineSnapshot(
        '["**/*.json5"]',
      );
    });

    it('has default `ignores` in `json/json5` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('json/json5')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('json');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('json/json5')).toMatchObject({
        'json/no-duplicate-keys': 2,
        'json/sort-keys': 0,
      });
    });

    it('`json/no-duplicate-keys` rule fires on a .json5 file with duplicate keys', async () => {
      const results = await testEslintConfig('json', FIXTURES.dupKeysJson5, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.dupKeysJson5,
        'json/no-duplicate-keys',
      );

      expect(error?.message).toMatchInlineSnapshot('"Duplicate key "key" found."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `json/json5` eslint config', async () => {
        const FILES = ['packages/**/*.json5'];

        const configResult = await computeEslintConfig({
          json: {configJson5: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('json/json5')?.files).toStrictEqual(FILES);
      });

      it('disables `json/json5` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          json: {configJson5: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('json/json5')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `json/json5` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          json: {configJson5: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('json/json5')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `json/json5` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {
          configJson5: {overrides: {'json/no-duplicate-keys': 0}, overridesAny: {'no-console': 0}},
        },
      });

      expect(configResult.getRuleEntrySeverity('json/json5', 'json/no-duplicate-keys')).toBe(0);
      expect(configResult.getRuleEntrySeverity('json/json5', 'no-console')).toBe(0);
    });
  });
});
