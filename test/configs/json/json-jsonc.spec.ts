const FIXTURES = {
  dupKeysJsonc: 'dup-keys.jsonc',
} as const;

describe('json: sub config `jsonc`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('json');

    it('creates `json/jsonc` eslint config by default when `json` is enabled', () => {
      expect(configResult.getConfigByUnPostfix('json/jsonc')).toBeDefined();
    });

    it('does not create `json/jsonc` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({
        json: {configJsonc: false},
      });

      expect(configResult.getConfigByUnPostfix('json/jsonc')).toBeUndefined();
    });

    it('has default `files` in `json/jsonc` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('json/jsonc')?.files).toMatchInlineSnapshot(
        '["**/*.jsonc"]',
      );
    });

    it('has default `ignores` in `json/jsonc` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('json/jsonc')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('json');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('json/jsonc')).toMatchObject({
        'json/no-duplicate-keys': 2,
        'json/sort-keys': 0,
      });
    });

    it('`json/no-duplicate-keys` rule fires on a .jsonc file with duplicate keys', async () => {
      const results = await testEslintConfig('json', FIXTURES.dupKeysJsonc, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.dupKeysJsonc,
        'json/no-duplicate-keys',
      );

      expect(error?.message).toMatchInlineSnapshot('"Duplicate key "key" found."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `json/jsonc` eslint config', async () => {
        const FILES = ['packages/**/*.jsonc'];

        const configResult = await computeEslintConfig({
          json: {configJsonc: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('json/jsonc')?.files).toStrictEqual(FILES);
      });

      it('disables `json/jsonc` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          json: {configJsonc: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('json/jsonc')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `json/jsonc` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          json: {configJsonc: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('json/jsonc')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `json/jsonc` eslint config', async () => {
      const configResult = await computeEslintConfig({
        json: {
          configJsonc: {overrides: {'json/no-duplicate-keys': 0}, overridesAny: {'no-console': 0}},
        },
      });

      expect(configResult.getRuleEntrySeverity('json/jsonc', 'json/no-duplicate-keys')).toBe(0);
      expect(configResult.getRuleEntrySeverity('json/jsonc', 'no-console')).toBe(0);
    });
  });
});
