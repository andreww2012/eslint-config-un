const FIXTURES = {
  fetchApi: 'fetch-api.js',
  consoleApi: 'console-api.js',
} as const;

describe('basic tests', () => {
  it('creates `compat` eslint config and loads `compat` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('compat');

    const config = configResult.getConfigByUnPostfix('compat');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('compat')).toBeDefined();
  });

  it('does not create `compat` eslint config and does not load `compat` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({compat: false});

    expect(configResult.getConfigByUnPostfix('compat')).toBeUndefined();
    expect(configResult.getLoadedPlugin('compat')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `compat` eslint config', async () => {
      await expectConfigState({}, 'compat', false);
    });

    it('creates `compat` eslint config if explicitly enabled', async () => {
      await expectConfigState('compat', 'compat', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `compat` eslint config', async () => {
      await expectConfigState({}, 'compat', false, 'default');
    });

    it('creates `compat` eslint config if explicitly enabled', async () => {
      await expectConfigState('compat', 'compat', true, 'default');
    });

    it('does not create `compat` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({compat: false}, 'compat', ['compat', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `compat` eslint config', async () => {
      await expectConfigState({}, 'compat', false, 'misc-enabled');
    });

    it('creates `compat` eslint config if explicitly enabled', async () => {
      await expectConfigState('compat', 'compat', true, 'misc-enabled');
    });

    it('does not create `compat` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({compat: false}, 'compat', ['compat', false], 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('compat');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('compat')).toMatchObject({
      'compat/compat': 2,
    });
  });

  it('`compat/compat` rule fires on fetch API with old browser target', async () => {
    const result = await testEslintConfig('compat', FIXTURES.fetchApi, {
      searchFixturesRelativeToPath: import.meta.dirname,
      un: {plugins: {compat: {settings: {targets: ['ie 11']}}}},
    });

    const error = findLintMessageFromLintResults(result, FIXTURES.fetchApi, 'compat/compat');

    expect(error?.message).toMatchInlineSnapshot('"fetch is not supported in IE 11"');
  });

  it('does not trigger compat rule on widely supported console API', async () => {
    const result = await testEslintConfig('compat', FIXTURES.consoleApi, {
      searchFixturesRelativeToPath: import.meta.dirname,
      un: {plugins: {compat: {settings: {targets: ['ie 11']}}}},
    });

    const error = findLintMessageFromLintResults(result, FIXTURES.consoleApi, 'compat/compat');

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `compat` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({compat: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('compat')?.files).toStrictEqual(FILES);
    });

    it('disables `compat` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({compat: {files: []}});

      expect(configResult.getConfigByUnPostfix('compat')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `compat` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({compat: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('compat')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `compat` eslint config', async () => {
    const configResult = await computeEslintConfig({
      compat: {overrides: {'compat/compat': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('compat', 'compat/compat')).toBe(0);
    expect(configResult.getRuleEntrySeverity('compat', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set any settings by default', async () => {
      const configResult = await computeEslintConfig('compat');

      expect(configResult.getConfigByUnPostfix('compat')?.settings).toBeUndefined();
    });

    it('sets compat settings when set to provided', async () => {
      const SETTINGS = {targets: ['ie 11'], polyfills: ['fetch']};

      const configResult = await computeEslintConfig('compat', {
        un: {plugins: {compat: {settings: SETTINGS}}},
      });

      expect(configResult.getConfigByUnPostfix('compat')?.settings).toStrictEqual(SETTINGS);
    });
  });
});
