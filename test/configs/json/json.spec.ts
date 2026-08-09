const FIXTURES = {
  dupKeysJson: 'dup-keys.json',
} as const;

describe('basic tests', () => {
  it('creates `json/json` eslint config and loads `json` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('json');

    const config = configResult.getConfigByUnPostfix('json/json');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.json"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('json')).toBeDefined();
  });

  it('does not create `json/json` eslint config and does not load `json` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({json: false});

    expect(configResult.getConfigByUnPostfix('json/json')).toBeUndefined();
    expect(configResult.getLoadedPlugin('json')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `json/json` eslint config', async () => {
      await expectConfigState({}, 'json/json', false);
    });

    it('creates `json/json` eslint config if explicitly enabled', async () => {
      await expectConfigState('json', 'json/json', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `json/json` eslint config (disabled by default)', async () => {
      await expectConfigState({}, 'json/json', false, 'default');
    });

    it('creates `json/json` eslint config if explicitly enabled', async () => {
      await expectConfigState('json', 'json/json', true, 'default');
    });

    it('does not create `json/json` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({json: false}, 'json/json', ['json', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `json/json` eslint config (not in the misc group)', async () => {
      await expectConfigState({}, 'json/json', false, 'misc-enabled');
    });

    it('creates `json/json` eslint config if explicitly enabled', async () => {
      await expectConfigState({json: true}, 'json/json', true, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('json');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('json/json')).toMatchObject({
      'json/no-duplicate-keys': 2,
      'json/sort-keys': 0,
    });
  });

  it('`json/no-duplicate-keys` rule fires on a .json file with duplicate keys', async () => {
    const results = await testEslintConfig('json', FIXTURES.dupKeysJson, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.dupKeysJson,
      'json/no-duplicate-keys',
    );

    expect(error?.message).toMatchInlineSnapshot('"Duplicate key "key" found."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in the `json/json` eslint config', async () => {
      const FILES = ['src/**/*.json'];

      const configResult = await computeEslintConfig({json: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('json/json')?.files).toStrictEqual(FILES);
    });

    it('disables the `json/json` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({json: {files: []}});

      expect(configResult.getConfigByUnPostfix('json/json')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in the `json/json` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({json: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('json/json')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in the `json/json` eslint config', async () => {
    const configResult = await computeEslintConfig({
      json: {overrides: {'json/no-duplicate-keys': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('json/json', 'json/no-duplicate-keys')).toBe(0);
    expect(configResult.getRuleEntrySeverity('json/json', 'no-console')).toBe(0);
  });
});
