const FIXTURES = {
  dupKeysJson: 'dup-keys.json',
  jsonCodeBlockWithDupKeysMd: 'json-code-block-with-dup-keys.md',
} as const;

describe('basic tests', () => {
  it('creates `jsonc/all` eslint config and loads `jsonc` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('jsonc');

    const config = configResult.getConfigByUnPostfix('jsonc/all');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.json", "**/*.jsonc", "**/*.json5"]');

    expect(config?.ignores).toMatchInlineSnapshot(
      '["**/*.css", "**/*.scss", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.y?(a)ml"]',
    );

    expect(configResult.getLoadedPlugin('jsonc')).toBeDefined();
  });

  it('does not create `jsonc/all` eslint config and does not load `jsonc` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({jsonc: false});

    expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();
    expect(configResult.getLoadedPlugin('jsonc')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jsonc/all` eslint config', async () => {
      await expectConfigState({}, 'jsonc/all', false);
    });

    it('creates `jsonc/all` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsonc', 'jsonc/all', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `jsonc/all` eslint config', async () => {
      await expectConfigState({}, 'jsonc/all', false, 'default');
    });

    it('creates `jsonc/all` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsonc', 'jsonc/all', true, 'default');
    });

    it('does not create `jsonc/all` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({jsonc: false}, 'jsonc/all', ['jsonc', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jsonc/all` eslint config', async () => {
      await expectConfigState({}, 'jsonc/all', true, 'misc-enabled');
    });

    it('creates `jsonc/all` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({jsonc: true}, 'jsonc/all', ['jsonc', true], 'misc-enabled');
    });

    it('does not create `jsonc/all` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsonc: false}, 'jsonc/all', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsonc');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('jsonc/all')).toMatchObject({
      'jsonc/no-dupe-keys': 2,
      'jsonc/sort-keys': 0,
    });
  });

  it('`jsonc/no-dupe-keys` rule fires on a .json file with duplicate keys', async () => {
    const results = await testEslintConfig('jsonc', FIXTURES.dupKeysJson, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.dupKeysJson,
      'jsonc/no-dupe-keys',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Duplicate key 'key'."`);
  });

  it('`jsonc/no-dupe-keys` rule fires on a JSON code block with duplicate keys inside a .md file', async () => {
    const results = await testEslintConfig(
      {jsonc: true, markdown: true},
      FIXTURES.jsonCodeBlockWithDupKeysMd,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.jsonCodeBlockWithDupKeysMd,
      'jsonc/no-dupe-keys',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Duplicate key 'key'."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `jsonc/all` eslint config', async () => {
      const FILES = ['src/**/*.json'];

      const configResult = await computeEslintConfig({jsonc: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('jsonc/all')?.files).toStrictEqual(FILES);
    });

    it('disables `jsonc/all` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsonc: {files: []}});

      expect(configResult.getConfigByUnPostfix('jsonc/all')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jsonc/all` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsonc: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('jsonc/all')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jsonc/all` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jsonc: {overrides: {'jsonc/no-dupe-keys': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jsonc/all', 'jsonc/no-dupe-keys')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jsonc/all', 'no-console')).toBe(0);
  });
});
