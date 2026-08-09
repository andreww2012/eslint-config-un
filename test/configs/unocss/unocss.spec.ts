const FIXTURES = {
  unorderedClasses: 'unordered-classes.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({unocss: '0.60.0'});
});

describe('basic tests', () => {
  it('creates `unocss` eslint config and loads `unocss` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('unocss');

    const config = configResult.getConfigByUnPostfix('unocss');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('unocss')).toBeDefined();
  });

  it('does not create `unocss` eslint config and does not load `unocss` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({unocss: false});

    expect(configResult.getConfigByUnPostfix('unocss')).toBeUndefined();
    expect(configResult.getLoadedPlugin('unocss')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `unocss` eslint config', async () => {
      await expectConfigState({}, 'unocss', false);
    });

    it('creates `unocss` eslint config if explicitly enabled', async () => {
      await expectConfigState('unocss', 'unocss', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `unocss` eslint config when `unocss` package is installed', async () => {
      await expectConfigState({}, 'unocss', true, 'default');
    });

    it('creates `unocss` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('unocss', 'unocss', ['unocss', true], 'default');
    });

    it('does not create `unocss` eslint config if explicitly disabled', async () => {
      await expectConfigState({unocss: false}, 'unocss', false, 'default');
    });

    describe('`unocss` package is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `unocss` eslint config', async () => {
        await expectConfigState({}, 'unocss', false, 'default');
      });

      it('creates `unocss` eslint config if explicitly enabled', async () => {
        await expectConfigState('unocss', 'unocss', true, 'default');
      });

      it('does not create `unocss` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({unocss: false}, 'unocss', ['unocss', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `unocss` eslint config when `unocss` package is installed', async () => {
      await expectConfigState({}, 'unocss', true, 'misc-enabled');
    });

    it('creates `unocss` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({unocss: true}, 'unocss', ['unocss', true], 'misc-enabled');
    });

    it('does not create `unocss` eslint config if explicitly disabled', async () => {
      await expectConfigState({unocss: false}, 'unocss', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('unocss');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('unocss')).toMatchObject({
      'unocss/blocklist': 2,
      'unocss/enforce-class-compile': 0,
    });
  });

  it('`unocss/order` rule fires on a file with unordered UnoCSS classes', async () => {
    const results = await testEslintConfig(
      {unocss: {files: ['**']}},
      FIXTURES.unorderedClasses,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unorderedClasses,
      'unocss/order',
    );

    expect(error?.message).toMatchInlineSnapshot('"UnoCSS utilities are not ordered"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `unocss` eslint config', async () => {
      const FILES = ['src/**/*.jsx'];

      const configResult = await computeEslintConfig({unocss: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('unocss')?.files).toStrictEqual(FILES);
    });

    it('disables `unocss` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({unocss: {files: []}});

      expect(configResult.getConfigByUnPostfix('unocss')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `unocss` eslint config and merges with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({unocss: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('unocss')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `unocss` eslint config', async () => {
    const configResult = await computeEslintConfig({
      unocss: {
        overrides: {'unocss/blocklist': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('unocss', 'unocss/blocklist')).toBe(0);
    expect(configResult.getRuleEntrySeverity('unocss', 'no-console')).toBe(0);
  });
});
