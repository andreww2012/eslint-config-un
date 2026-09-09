const FIXTURES = {
  sqlTaggedQuery: 'sql-tagged-query.ts',
} as const;

const UNREACHABLE_CONNECTION = {
  databaseUrl: 'postgres://postgres:postgres@127.0.0.1:1/postgres',
  targets: [{tag: 'sql'}],
};

const CONFIGURED = {safeql: {options: {connections: UNREACHABLE_CONNECTION}}};

beforeEach(() => {
  addInstalledPackages({'@ts-safeql/sql-tag': '0.2.2'});
});

describe('basic tests', () => {
  it('creates `safeql` eslint config and loads `safeql` plugin if the rule options are provided', async () => {
    const configResult = await computeEslintConfig(CONFIGURED);

    const config = configResult.getConfigByUnPostfix('safeql');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('safeql')).toBeDefined();
  });

  it('does not create `safeql` eslint config and does not load `safeql` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({safeql: false});

    expect(configResult.getConfigByUnPostfix('safeql')).toBeUndefined();
    expect(configResult.getLoadedPlugin('safeql')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `safeql` eslint config', async () => {
      await expectConfigState({}, 'safeql', false);
    });

    it('creates `safeql` eslint config if explicitly enabled', async () => {
      await expectConfigState(CONFIGURED, 'safeql', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`@ts-safeql/sql-tag` is installed', () => {
      it('creates `safeql` eslint config by default', async () => {
        await expectConfigState(CONFIGURED, 'safeql', true, 'default');
      });

      it('creates `safeql` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('safeql', 'safeql', ['safeql', true], 'default');
      });

      it('does not create `safeql` eslint config if explicitly disabled', async () => {
        await expectConfigState({safeql: false}, 'safeql', false, 'default');
      });
    });

    describe('`@ts-safeql/sql-tag` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `safeql` eslint config', async () => {
        await expectConfigState({}, 'safeql', false, 'default');
      });

      it('creates `safeql` eslint config if explicitly enabled', async () => {
        await expectConfigState(CONFIGURED, 'safeql', true, 'default');
      });

      it('does not create `safeql` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({safeql: false}, 'safeql', ['safeql', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `safeql` eslint config when `@ts-safeql/sql-tag` is installed', async () => {
      await expectConfigState(CONFIGURED, 'safeql', true, 'misc-enabled');
    });

    it('creates `safeql` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({safeql: true}, 'safeql', ['safeql', true], 'misc-enabled');
    });

    it('does not create `safeql` eslint config if explicitly disabled', async () => {
      await expectConfigState({safeql: false}, 'safeql', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig(CONFIGURED);

    expect(configResult.getRuleSeverities('safeql')).toMatchObject({
      'safeql/check-sql': 2,
    });
  });

  it('`safeql/check-sql` rule fires on a query written with a targeted tag', async () => {
    const results = await testEslintConfig(
      {ts: true, ...CONFIGURED},
      FIXTURES.sqlTaggedQuery,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.sqlTaggedQuery,
      'safeql/check-sql',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Internal error: connect ECONNREFUSED 127.0.0.1:1"',
    );
  });

  it('`safeql/check-sql` rule reports every query as invalid without type information', async () => {
    const results = await testEslintConfig(
      {ts: {configTypeAware: false, parserOptions: {projectService: false}}, ...CONFIGURED},
      FIXTURES.sqlTaggedQuery,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.sqlTaggedQuery,
      'safeql/check-sql',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Invalid Query: Parser services are not available"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `safeql` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({
        safeql: {...CONFIGURED.safeql, files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('safeql')?.files).toStrictEqual(FILES);
    });

    it('disables `safeql` eslint config and does not warn about the missing `options` when set to empty array', async () => {
      const processOutput = spyOnProcessOutput();

      const configResult = await computeEslintConfig({safeql: {files: []}});

      expect(configResult.getConfigByUnPostfix('safeql')).toBeUndefined();
      expect(processOutput.getStderrOutput()).toBe('');
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `safeql` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        safeql: {...CONFIGURED.safeql, ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('safeql')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `safeql` eslint config', async () => {
    const configResult = await computeEslintConfig({
      safeql: {
        ...CONFIGURED.safeql,
        overrides: {'safeql/check-sql': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('safeql')).toMatchObject({
      'safeql/check-sql': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('keeps `safeql/check-sql` disabled, warns and does not load the plugin when option is not set', async () => {
      const processOutput = spyOnProcessOutput();

      const configResult = await computeEslintConfig('safeql');

      expect(configResult.getRuleEntryParsed('safeql', 'safeql/check-sql')).toStrictEqual({
        severity: 0,
        options: [],
      });

      expect(configResult.getLoadedPlugin('safeql')).toBeUndefined();
      expect(processOutput.getStderrOutput()).toContain(
        "You haven't specified `options` which are required for `@ts-safeql/eslint-plugin` to work",
      );
    });

    it('enables `safeql/check-sql`, passes the connections to it and does not warn when option is set', async () => {
      const processOutput = spyOnProcessOutput();

      const configResult = await computeEslintConfig(CONFIGURED);

      expect(configResult.getRuleEntryParsed('safeql', 'safeql/check-sql')).toStrictEqual({
        severity: 2,
        options: [{connections: UNREACHABLE_CONNECTION}],
      });

      expect(processOutput.getStderrOutput()).toBe('');
    });

    it('enables `safeql/check-sql` and passes `useConfigFile` to it when option is set', async () => {
      const configResult = await computeEslintConfig({safeql: {options: {useConfigFile: true}}});

      expect(configResult.getRuleEntryParsed('safeql', 'safeql/check-sql')).toStrictEqual({
        severity: 2,
        options: [{useConfigFile: true}],
      });
    });
  });
});
