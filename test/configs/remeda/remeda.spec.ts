const FIXTURES = {
  unusedRMap: 'unused-r-map.js',
} as const;

beforeEach(() => {
  addInstalledPackages({remeda: '2.1.0'});
});

describe('basic tests', () => {
  it('creates `remeda` eslint config and loads `remeda` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('remeda');

    const config = configResult.getConfigByUnPostfix('remeda');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('remeda')).toBeDefined();
  });

  it('does not create `remeda` eslint config and does not load `remeda` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({remeda: false});

    expect(configResult.getConfigByUnPostfix('remeda')).toBeUndefined();
    expect(configResult.getLoadedPlugin('remeda')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `remeda` eslint config', async () => {
      await expectConfigState({}, 'remeda', false);
    });

    it('creates `remeda` eslint config if explicitly enabled', async () => {
      await expectConfigState('remeda', 'remeda', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('remeda is installed', () => {
      it('creates `remeda` eslint config by default', async () => {
        await expectConfigState({}, 'remeda', true, 'default');
      });

      it('creates `remeda` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('remeda', 'remeda', ['remeda', true], 'default');
      });

      it('does not create `remeda` eslint config if explicitly disabled', async () => {
        await expectConfigState({remeda: false}, 'remeda', false, 'default');
      });
    });

    describe('remeda is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `remeda` eslint config', async () => {
        await expectConfigState({}, 'remeda', false, 'default');
      });

      it('creates `remeda` eslint config if explicitly enabled', async () => {
        await expectConfigState('remeda', 'remeda', true, 'default');
      });

      it('does not create `remeda` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({remeda: false}, 'remeda', ['remeda', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `remeda` eslint config when `remeda` is installed', async () => {
      await expectConfigState({}, 'remeda', true, 'misc-enabled');
    });

    it('creates `remeda` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({remeda: true}, 'remeda', ['remeda', true], 'misc-enabled');
    });

    it('does not create `remeda` eslint config if explicitly disabled', async () => {
      await expectConfigState({remeda: false}, 'remeda', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('remeda');

    expect(configResult.getRuleSeverities('remeda')).toMatchObject({
      'remeda/prefer-map': 2,
      'remeda/prefer-nullish-coalescing': 0,
    });
  });

  it('`remeda/collection-method-value` rule fires when `R.map` result is not used', async () => {
    const results = await testEslintConfig('remeda', FIXTURES.unusedRMap, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unusedRMap,
      'remeda/collection-method-value',
    );

    expect(error?.message).toMatchInlineSnapshot('"Use value returned from R.map"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `remeda` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({remeda: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('remeda')?.files).toStrictEqual(FILES);
    });

    it('disables `remeda` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({remeda: {files: []}});

      expect(configResult.getConfigByUnPostfix('remeda')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `remeda` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({remeda: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('remeda')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `remeda` eslint config', async () => {
    const configResult = await computeEslintConfig({
      remeda: {
        overrides: {'remeda/prefer-map': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('remeda')).toMatchObject({
      'remeda/prefer-map': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set remeda settings by default', async () => {
      const configResult = await computeEslintConfig('remeda');
      const config = configResult.getConfigByUnPostfix('remeda');

      expect(config?.settings?.['remeda']).toBeUndefined();
    });

    it('sets remeda settings when `settings` is provided', async () => {
      const SETTINGS = {pragma: 'R'};

      const configResult = await computeEslintConfig('remeda', {
        un: {plugins: {remeda: {settings: SETTINGS}}},
      });
      const config = configResult.getConfigByUnPostfix('remeda');

      expect(config?.settings?.['remeda']).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `suggestJsCodeReplacements`', () => {
    it('disables JS code replacement rules by default', async () => {
      const configResult = await computeEslintConfig('remeda');

      expect(configResult.getRuleSeverities('remeda')).toMatchObject({
        'remeda/prefer-constant': 0,
        'remeda/prefer-do-nothing': 0,
        'remeda/prefer-has-atleast': 0,
        'remeda/prefer-is-empty': 0,
        'remeda/prefer-is-nullish': 0,
        'remeda/prefer-nullish-coalescing': 0,
        'remeda/prefer-remeda-typecheck': 0,
      });
    });

    it('disables JS code replacement rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({remeda: {suggestJsCodeReplacements: false}});

      expect(configResult.getRuleSeverities('remeda')).toMatchObject({
        'remeda/prefer-constant': 0,
        'remeda/prefer-do-nothing': 0,
        'remeda/prefer-has-atleast': 0,
        'remeda/prefer-is-empty': 0,
        'remeda/prefer-is-nullish': 0,
        'remeda/prefer-nullish-coalescing': 0,
        'remeda/prefer-remeda-typecheck': 0,
      });
    });

    it('enables JS code replacement rules when set to `true`', async () => {
      const configResult = await computeEslintConfig({remeda: {suggestJsCodeReplacements: true}});

      expect(configResult.getRuleSeverities('remeda')).toMatchObject({
        'remeda/prefer-constant': 2,
        'remeda/prefer-do-nothing': 2,
        'remeda/prefer-has-atleast': 2,
        'remeda/prefer-is-empty': 2,
        'remeda/prefer-is-nullish': 2,
        'remeda/prefer-nullish-coalescing': 2,
        'remeda/prefer-remeda-typecheck': 2,
      });
    });
  });
});
