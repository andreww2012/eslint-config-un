const FIXTURES = {
  clsxWithArrayExpression: 'clsx-with-array-expression.js',
} as const;

beforeEach(() => {
  addInstalledPackages({clsx: '2.1.1'});
});

describe('basic tests', () => {
  it('creates `clsx` eslint config and loads `clsx` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('clsx');

    const config = configResult.getConfigByUnPostfix('clsx');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('clsx')).toBeDefined();
  });

  it('does not create `clsx` eslint config and does not load `clsx` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({clsx: false});

    expect(configResult.getConfigByUnPostfix('clsx')).toBeUndefined();
    expect(configResult.getLoadedPlugin('clsx')).toBeUndefined();
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
      await expectConfigState('clsx', 'clsx', ['clsx', true], 'misc-enabled');
    });

    it('does not create `clsx` eslint config if explicitly disabled', async () => {
      await expectConfigState({clsx: false}, 'clsx', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('clsx');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('clsx')).toMatchObject({
      'clsx/forbid-array-expressions': 2,
      'clsx/prefer-objects-over-logical': 1,
      'clsx/prefer-logical-over-objects': 0,
    });
  });

  it('`clsx/forbid-array-expressions` rule fires on a clsx call with array argument', async () => {
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

      const configResult = await computeEslintConfig({clsx: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('clsx')?.files).toStrictEqual(FILES);
    });

    it('disables `clsx` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({clsx: {files: []}});

      expect(configResult.getConfigByUnPostfix('clsx')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `clsx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({clsx: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('clsx')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `clsxOptions` settings by default', async () => {
      const configResult = await computeEslintConfig('clsx');
      const config = configResult.getConfigByUnPostfix('clsx');

      expect(config?.settings?.['clsxOptions']).toBeUndefined();
    });

    it('assigns `settings` to `clsxOptions` settings property', async () => {
      const SETTINGS = {clsx: ['cn', 'cx'], classnames: 'default'};

      const configResult = await computeEslintConfig('clsx', {
        un: {plugins: {clsx: {settings: SETTINGS}}},
      });

      const config = configResult.getConfigByUnPostfix('clsx');

      expect(config?.settings?.['clsxOptions']).toStrictEqual(SETTINGS);
    });
  });
});
