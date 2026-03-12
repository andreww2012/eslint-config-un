const FIXTURES = {
  unsafeQuery: 'no-unsafe-query/test.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('sql');

  it('loads `sql` plugin if used', () => {
    expect(configResult.getLoadedPlugin('sql')).toBeDefined();
  });

  it('creates `sql` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('sql')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `sql` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();
    });

    it('creates `sql` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('sql');

      expect(configResult.getConfigByUnPostfix('sql')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `sql` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();
    });

    it('creates `sql` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('sql', {reset: true});

      expect(configResult.getConfigByUnPostfix('sql')).toBeDefined();
    });

    it('does not create `sql` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({sql: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`sql\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `sql` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();
    });

    it('creates `sql` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig(
        {sql: true},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('sql')).toBeDefined();
    });
  });

  it('has no explicit `files` restriction in `sql` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('sql')?.files).toBeUndefined();
  });

  it('has default `ignores` in `sql` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('sql')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('sql');

  it('enables `sql/format` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('sql', 'sql/format')).toBe(2);
  });

  it('enables `sql/no-unsafe-query` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('sql', 'sql/no-unsafe-query')).toBe(2);
  });

  it('`sql/no-unsafe-query` rule fires on a template literal with an expression', async () => {
    const results = await testEslintConfig('sql', FIXTURES.unsafeQuery, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unsafeQuery,
      'sql/no-unsafe-query',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Use "sql" tag"`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `sql` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({sql: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('sql')?.files).toStrictEqual(FILES);
    });

    it('disables `sql` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({sql: {files: []}});

      expect(configResult.getConfigByUnPostfix('sql')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `sql` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({sql: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('sql')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `sql` eslint config', async () => {
      const configResult = await computeEslintConfig({sql: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('sql'), (ruleName) =>
          ruleName.startsWith('sql/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `sql` eslint config', async () => {
      const configResult = await computeEslintConfig({sql: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('sql'), (ruleName) =>
          ruleName.startsWith('sql/'),
        ),
      ).toStrictEqual([1]);
    });
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
