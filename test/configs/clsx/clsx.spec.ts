beforeEach(() => {
  addInstalledPackages({clsx: '2.1.1'});
});

const FIXTURES = {
  clsxWithArrayExpression: 'clsx-with-array-expression.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('clsx');

  it('loads `clsx` plugin', () => {
    expect(configResult.getLoadedPlugin('clsx')).toBeDefined();
  });

  it('creates `clsx` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('clsx')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `clsx` eslint config', async () => {
      await expectConfigState({}, 'clsx', false);
    });

    it('creates `clsx` eslint config if explicitly enabled', async () => {
      await expectConfigState('clsx', 'clsx', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('clsx is installed', () => {
      it('creates `clsx` eslint config by default', async () => {
        await expectConfigState({}, 'clsx', true, 'default');
      });

      it('creates `clsx` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('clsx', 'clsx', ['clsx', true], 'default');
      });

      it('does not create `clsx` eslint config if explicitly disabled', async () => {
        await expectConfigState({clsx: false}, 'clsx', false, 'default');
      });
    });

    describe('clsx is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `clsx` eslint config', async () => {
        await expectConfigState({}, 'clsx', false, 'default');
      });

      it('creates `clsx` eslint config if explicitly enabled', async () => {
        await expectConfigState('clsx', 'clsx', true, 'default');
      });

      it('does not create `clsx` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({clsx: false}, 'clsx', ['clsx', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `clsx` eslint config', async () => {
      await expectConfigState({}, 'clsx', true, 'misc-enabled');
    });

    it('creates `clsx` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({clsx: true}, 'clsx', ['clsx', true], 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `clsx` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('clsx')?.files).toBeUndefined();
  });

  it('has default `ignores` in `clsx` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('clsx')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('clsx');

  it('enables `clsx/forbid-array-expressions` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('clsx', 'clsx/forbid-array-expressions')).toBe(2);
  });

  it('disables `clsx/prefer-logical-over-objects` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('clsx', 'clsx/prefer-logical-over-objects')).toBe(0);
  });

  it('`clsx/forbid-array-expressions` rule fires on a clsx call with an array argument', async () => {
    const results = await testEslintConfig(
      'clsx',
      FIXTURES.clsxWithArrayExpression,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.clsxWithArrayExpression,
      'clsx/forbid-array-expressions',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Usage of array expressions inside clsx is forbidden"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `clsx` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];
      const configResult = await computeEslintConfig({
        clsx: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('clsx')?.files).toStrictEqual(FILES);
    });

    it('disables `clsx` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        clsx: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('clsx')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `clsx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        clsx: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('clsx')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `clsx` eslint config', async () => {
    const configResult = await computeEslintConfig({
      clsx: {
        overrides: {'clsx/forbid-array-expressions': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('clsx', 'clsx/forbid-array-expressions')).toBe(0);
    expect(configResult.getRuleEntrySeverity('clsx', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `clsx` eslint config', async () => {
      const configResult = await computeEslintConfig({
        clsx: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('clsx'), (ruleName) =>
          ruleName.startsWith('clsx/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `clsx` eslint config', async () => {
      const configResult = await computeEslintConfig({
        clsx: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('clsx'), (ruleName) =>
          ruleName.startsWith('clsx/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `clsxOptions` settings when `settings` is not provided', async () => {
      const configResult = await computeEslintConfig('clsx');
      const config = configResult.getConfigByUnPostfix('clsx');

      expect(config?.settings?.['clsxOptions']).toBeUndefined();
    });

    it('assigns `settings` to `clsxOptions` settings property', async () => {
      const SETTINGS = {clsx: ['cn', 'cx'], classnames: 'default'};

      const configResult = await computeEslintConfig({
        clsx: {settings: SETTINGS},
      });

      const config = configResult.getConfigByUnPostfix('clsx');

      expect(config?.settings?.['clsxOptions']).toStrictEqual(SETTINGS);
    });
  });
});
