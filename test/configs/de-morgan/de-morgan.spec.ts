const FIXTURES = {
  notOfLogicalAndExpression: 'not-of-logical-and-expression.js',
} as const;

describe('basic tests', () => {
  it('creates `de-morgan` eslint config and loads `de-morgan` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('deMorgan');

    const config = configResult.getConfigByUnPostfix('de-morgan');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('de-morgan')).toBeDefined();
  });

  it('does not create `de-morgan` eslint config and does not load `de-morgan` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({deMorgan: false});

    expect(configResult.getConfigByUnPostfix('de-morgan')).toBeUndefined();
    expect(configResult.getLoadedPlugin('de-morgan')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `de-morgan` eslint config', async () => {
      await expectConfigState({}, 'de-morgan', false);
    });

    it('creates `de-morgan` eslint config if explicitly enabled', async () => {
      await expectConfigState('deMorgan', 'de-morgan', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `de-morgan` eslint config', async () => {
      await expectConfigState({}, 'de-morgan', false, 'default');
    });

    it('creates `de-morgan` eslint config if explicitly enabled', async () => {
      await expectConfigState('deMorgan', 'de-morgan', true, 'default');
    });

    it('does not create `de-morgan` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({deMorgan: false}, 'de-morgan', ['deMorgan', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `de-morgan` eslint config', async () => {
      await expectConfigState({}, 'de-morgan', false, 'misc-enabled');
    });

    it('creates `de-morgan` eslint config if explicitly enabled', async () => {
      await expectConfigState({deMorgan: true}, 'de-morgan', true, 'misc-enabled');
    });

    it('does not create `de-morgan` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({deMorgan: false}, 'de-morgan', ['deMorgan', false], 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('deMorgan');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('de-morgan')).toMatchObject({
      'de-morgan/no-negated-conjunction': 2,
      'de-morgan/no-negated-disjunction': 2,
    });
  });

  it('`de-morgan/no-negated-conjunction` rule fires on a file with a negated conjunction', async () => {
    const results = await testEslintConfig(
      'deMorgan',
      FIXTURES.notOfLogicalAndExpression,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.notOfLogicalAndExpression,
      'de-morgan/no-negated-conjunction',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Replace negated conjunction `!(a && b)` with `!a || !b`"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `de-morgan` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({deMorgan: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('de-morgan')?.files).toStrictEqual(FILES);
    });

    it('disables `de-morgan` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({deMorgan: {files: []}});

      expect(configResult.getConfigByUnPostfix('de-morgan')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `de-morgan` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({deMorgan: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('de-morgan')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `de-morgan` eslint config', async () => {
    const configResult = await computeEslintConfig({
      deMorgan: {
        overrides: {'de-morgan/no-negated-conjunction': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('de-morgan', 'de-morgan/no-negated-conjunction')).toBe(
      0,
    );
    expect(configResult.getRuleEntrySeverity('de-morgan', 'no-console')).toBe(0);
  });
});
