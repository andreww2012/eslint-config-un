const FIXTURES = {
  envVarDestructuring: 'env-var-destructuring.js',
} as const;

beforeEach(() => {
  addInstalledPackages({expo: '54.0.0'});
});

describe('basic tests', () => {
  it('creates `expo` eslint config and loads `expo` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('expo');

    const config = configResult.getConfigByUnPostfix('expo');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('expo')).toBeDefined();
  });

  it('does not create `expo` eslint config and does not load `expo` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({expo: false});

    expect(configResult.getConfigByUnPostfix('expo')).toBeUndefined();
    expect(configResult.getLoadedPlugin('expo')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `expo` eslint config', async () => {
      await expectConfigState({}, 'expo', false);
    });

    it('creates `expo` eslint config if explicitly enabled', async () => {
      await expectConfigState('expo', 'expo', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`expo` is installed', () => {
      it('creates `expo` eslint config by default', async () => {
        await expectConfigState({}, 'expo', true, 'default');
      });

      it('creates `expo` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('expo', 'expo', ['expo', true], 'default');
      });

      it('does not create `expo` eslint config if explicitly disabled', async () => {
        await expectConfigState({expo: false}, 'expo', false, 'default');
      });
    });

    describe('`expo` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `expo` eslint config', async () => {
        await expectConfigState({}, 'expo', false, 'default');
      });

      it('creates `expo` eslint config if explicitly enabled', async () => {
        await expectConfigState('expo', 'expo', true, 'default');
      });

      it('does not create `expo` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({expo: false}, 'expo', ['expo', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `expo` eslint config when `expo` is installed', async () => {
      await expectConfigState({}, 'expo', true, 'misc-enabled');
    });

    it('creates `expo` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({expo: true}, 'expo', ['expo', true], 'misc-enabled');
    });

    it('does not create `expo` eslint config if explicitly disabled', async () => {
      await expectConfigState({expo: false}, 'expo', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('expo');

    expect(configResult.getRuleSeverities('expo')).toMatchObject({
      'expo/no-dynamic-env-var': 2,
      'expo/prefer-box-shadow': 0,
    });
  });

  it('`expo/no-env-var-destructuring` rule fires on a destructuring of `process.env`', async () => {
    const results = await testEslintConfig(
      'expo',
      FIXTURES.envVarDestructuring,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.envVarDestructuring,
      'expo/no-env-var-destructuring',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected destructuring. Cannot destructure MY_VAR from process.env"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `expo` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({expo: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('expo')?.files).toStrictEqual(FILES);
    });

    it('disables `expo` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({expo: {files: []}});

      expect(configResult.getConfigByUnPostfix('expo')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `expo` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({expo: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('expo')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `expo` eslint config', async () => {
    const configResult = await computeEslintConfig({
      expo: {
        overrides: {'expo/no-dynamic-env-var': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('expo')).toMatchObject({
      'expo/no-dynamic-env-var': 0,
      'no-console': 0,
    });
  });
});
