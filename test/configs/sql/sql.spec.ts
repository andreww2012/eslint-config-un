const FIXTURES = {
  sqlTemplateWithInterpolation: 'sql-template-with-interpolation/test.js',
} as const;

describe('basic tests', () => {
  it('creates `sql` eslint config and loads `sql` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('sql');

    const config = configResult.getConfigByUnPostfix('sql');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('sql')).toBeDefined();
  });

  it('does not create `sql` eslint config and does not load `sql` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({sql: false});

    expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();
    expect(configResult.getLoadedPlugin('sql')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `sql` eslint config', async () => {
      await expectConfigState({}, 'sql', false);
    });

    it('creates `sql` eslint config if explicitly enabled', async () => {
      await expectConfigState('sql', 'sql', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `sql` eslint config', async () => {
      await expectConfigState({}, 'sql', false, 'default');
    });

    it('creates `sql` eslint config if explicitly enabled', async () => {
      await expectConfigState('sql', 'sql', true, 'default');
    });

    it('does not create `sql` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({sql: false}, 'sql', ['sql', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `sql` eslint config', async () => {
      await expectConfigState({}, 'sql', false, 'misc-enabled');
    });

    it('creates `sql` eslint config if explicitly enabled', async () => {
      await expectConfigState({sql: true}, 'sql', true, 'misc-enabled');
    });

    it('does not create `sql` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({sql: false}, 'sql', ['sql', false], 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('sql');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('sql')).toMatchObject({
      'sql/format': 2,
      'sql/no-unsafe-query': 2,
    });
  });

  it('`sql/no-unsafe-query` rule fires on a template literal with an expression', async () => {
    const results = await testEslintConfig(
      'sql',
      FIXTURES.sqlTemplateWithInterpolation,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.sqlTemplateWithInterpolation,
      'sql/no-unsafe-query',
    );

    expect(error?.message).toMatchInlineSnapshot('"Use "sql" tag"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `sql` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({sql: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('sql')?.files).toStrictEqual(FILES);
    });

    it('disables `sql` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({sql: {files: []}});

      expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `sql` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({sql: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('sql')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `sql` eslint config', async () => {
    const configResult = await computeEslintConfig({
      sql: {overrides: {'sql/format': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('sql', 'sql/format')).toBe(0);
    expect(configResult.getRuleEntrySeverity('sql', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set plugin settings when sql is enabled without options', async () => {
      const configResult = await computeEslintConfig('sql');

      expect(configResult.getConfigByUnPostfix('sql')?.settings?.['sql']).toBeUndefined();
    });

    it('assigns `placeholderRule` to `sql` settings property', async () => {
      const SETTINGS = {placeholderRule: String.raw`\?`};

      const configResult = await computeEslintConfig({
        sql: {settings: SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('sql')?.settings?.['sql']).toStrictEqual(SETTINGS);
    });
  });
});
