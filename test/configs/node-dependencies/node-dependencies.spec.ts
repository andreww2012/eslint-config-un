const FIXTURES = {
  invalidSemver: 'invalid-semver/package.json',
  nonAbsoluteVersion: 'non-absolute-version/package.json',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('nodeDependencies');

  it('loads `node-dependencies` plugin if used', () => {
    expect(configResult.getLoadedPlugin('node-dependencies')).toBeDefined();
  });

  it('creates `node-dependencies` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('node-dependencies')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `node-dependencies` eslint config', async () => {
      await expectConfigState({}, 'node-dependencies', false);
    });

    it('creates `node-dependencies` eslint config if explicitly enabled', async () => {
      await expectConfigState('nodeDependencies', 'node-dependencies', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `node-dependencies` eslint config', async () => {
      await expectConfigState({}, 'node-dependencies', false, 'default');
    });

    it('creates `node-dependencies` eslint config if explicitly enabled', async () => {
      await expectConfigState('nodeDependencies', 'node-dependencies', true, 'default');
    });

    it('does not create `node-dependencies` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {nodeDependencies: false},
        'node-dependencies',
        ['nodeDependencies', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `node-dependencies` eslint config', async () => {
      await expectConfigState({}, 'node-dependencies', true, 'misc-enabled');
    });

    it('creates `node-dependencies` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        {nodeDependencies: true},
        'node-dependencies',
        ['nodeDependencies', true],
        'misc-enabled',
      );
    });
  });

  it('has default `files` in `node-dependencies` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('node-dependencies')?.files).toMatchInlineSnapshot(
      '["**/package.json"]',
    );
  });

  it('has default `ignores` in `node-dependencies` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('node-dependencies')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('nodeDependencies');

  it('enables `node-dependencies/compat-engines` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('node-dependencies', 'node-dependencies/compat-engines'),
    ).toBe(1);
  });

  it('disables `node-dependencies/absolute-version` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('node-dependencies', 'node-dependencies/absolute-version'),
    ).toBe(0);
  });

  it('`node-dependencies/valid-semver` rule fires on a package.json with invalid semver', async () => {
    const results = await testEslintConfig(
      'nodeDependencies',
      FIXTURES.invalidSemver,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.invalidSemver,
      'node-dependencies/valid-semver',
    );

    expect(error?.message).toMatchInlineSnapshot('""1.2.3.4" is invalid."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `node-dependencies` eslint config', async () => {
      const FILES = ['package.json'];
      const configResult = await computeEslintConfig({
        nodeDependencies: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('node-dependencies')?.files).toStrictEqual(FILES);
    });

    it('disables `node-dependencies` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        nodeDependencies: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('node-dependencies')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `node-dependencies` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        nodeDependencies: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('node-dependencies')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `node-dependencies` eslint config', async () => {
    const configResult = await computeEslintConfig({
      nodeDependencies: {
        overrides: {'node-dependencies/compat-engines': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('node-dependencies', 'node-dependencies/compat-engines'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('node-dependencies', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `node-dependencies` eslint config', async () => {
      const configResult = await computeEslintConfig({
        nodeDependencies: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('node-dependencies'), (ruleName) =>
          ruleName.startsWith('node-dependencies/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `node-dependencies` eslint config', async () => {
      const configResult = await computeEslintConfig({
        nodeDependencies: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('node-dependencies'), (ruleName) =>
          ruleName.startsWith('node-dependencies/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `enforceAbsoluteVersion`', () => {
    it('disables `node-dependencies/absolute-version` rule when `enforceAbsoluteVersion` is `false` (default)', async () => {
      const configResult = await computeEslintConfig({
        nodeDependencies: {enforceAbsoluteVersion: false},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'node-dependencies',
          'node-dependencies/absolute-version',
        ),
      ).toBe(0);
    });

    it('enables `node-dependencies/absolute-version` rule with default options when `enforceAbsoluteVersion` is `true`', async () => {
      const configResult = await computeEslintConfig({
        nodeDependencies: {enforceAbsoluteVersion: true},
      });

      expect(
        configResult.getRuleEntry('node-dependencies', 'node-dependencies/absolute-version'),
      ).toMatchInlineSnapshot(
        '[2, {"optionalDependencies": "ignore", "peerDependencies": "ignore"}]',
      );
    });

    it("enables `node-dependencies/absolute-version` rule with `never` option when `enforceAbsoluteVersion` is `'never'`", async () => {
      const configResult = await computeEslintConfig({
        nodeDependencies: {enforceAbsoluteVersion: 'never'},
      });

      expect(
        configResult.getRuleEntry('node-dependencies', 'node-dependencies/absolute-version'),
      ).toMatchInlineSnapshot('[2, "never"]');
    });

    it('enables `node-dependencies/absolute-version` rule with custom options when `enforceAbsoluteVersion` is an object', async () => {
      const OPTIONS = {dependencies: 'always' as const};

      const configResult = await computeEslintConfig({
        nodeDependencies: {enforceAbsoluteVersion: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('node-dependencies', 'node-dependencies/absolute-version'),
      ).toStrictEqual([OPTIONS]);
    });

    it('`node-dependencies/absolute-version` rule fires when `enforceAbsoluteVersion` is `true` and a dependency uses a range version', async () => {
      const results = await testEslintConfig(
        {nodeDependencies: {enforceAbsoluteVersion: true}},
        FIXTURES.nonAbsoluteVersion,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.nonAbsoluteVersion,
        'node-dependencies/absolute-version',
      );

      expect(error?.message).toMatchInlineSnapshot('"Use the absolute version instead."');
    });
  });
});
