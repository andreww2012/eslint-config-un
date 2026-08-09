const FIXTURES = {
  topLevelFunction: 'top-level-function.ts',
} as const;

describe('basic tests', () => {
  it('creates `antfu` eslint config and does not load `antfu` plugin (all rules are `OFF`) if set to `true`', async () => {
    const configResult = await computeEslintConfig('antfu');

    const config = configResult.getConfigByUnPostfix('antfu');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('antfu')).toBeUndefined();
  });

  it('does not create `antfu` eslint config if set to `false`', async () => {
    const configResult = await computeEslintConfig({antfu: false});

    expect(configResult.getConfigByUnPostfix('antfu')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `antfu` eslint config', async () => {
      await expectConfigState({}, 'antfu', false);
    });

    it('creates `antfu` eslint config if explicitly enabled', async () => {
      await expectConfigState('antfu', 'antfu', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `antfu` eslint config', async () => {
      await expectConfigState({}, 'antfu', false, 'default');
    });

    it('creates `antfu` eslint config if explicitly enabled', async () => {
      await expectConfigState('antfu', 'antfu', true, 'default');
    });

    it('does not create `antfu` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({antfu: false}, 'antfu', ['antfu', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `antfu` eslint config', async () => {
      await expectConfigState({}, 'antfu', false, 'misc-enabled');
    });

    it('creates `antfu` eslint config if explicitly enabled', async () => {
      await expectConfigState({antfu: true}, 'antfu', true, 'misc-enabled');
    });

    it('does not create `antfu` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({antfu: false}, 'antfu', ['antfu', false], 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('antfu');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('antfu')).toMatchObject({
      'antfu/consistent-chaining': 0,
      'antfu/top-level-function': 0,
    });
  });

  it('`antfu/top-level-function` rule fires on a file with a top-level arrow function', async () => {
    const results = await testEslintConfig(
      {antfu: {overrides: {'antfu/top-level-function': 2}}},
      FIXTURES.topLevelFunction,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.topLevelFunction,
      'antfu/top-level-function',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Top-level functions should be declared with function keyword"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `antfu` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({antfu: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('antfu')?.files).toStrictEqual(FILES);
    });

    it('disables `antfu` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({antfu: {files: []}});

      expect(configResult.getConfigByUnPostfix('antfu')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `antfu` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({antfu: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('antfu')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `antfu` eslint config', async () => {
    const configResult = await computeEslintConfig({
      antfu: {
        overrides: {'antfu/consistent-chaining': 2},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('antfu', 'antfu/consistent-chaining')).toBe(2);
    expect(configResult.getRuleEntrySeverity('antfu', 'no-console')).toBe(0);
  });
});
