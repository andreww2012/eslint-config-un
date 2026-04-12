const FIXTURES = {
  arrowFunctions: 'arrow-functions/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({mocha: '10.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('mocha');

  it('loads `mocha` plugin if used', () => {
    expect(configResult.getLoadedPlugin('mocha')).toBeDefined();
  });

  it('creates `mocha` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('mocha')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `mocha` eslint config', async () => {
      await expectConfigState({}, 'mocha', false);
    });

    it('creates `mocha` eslint config if explicitly enabled', async () => {
      await expectConfigState('mocha', 'mocha', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `mocha` eslint config when `mocha` package is installed', async () => {
      await expectConfigState({}, 'mocha', true, 'default');
    });

    it('creates `mocha` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('mocha', 'mocha', ['mocha', true], 'default');
    });

    it('does not create `mocha` eslint config if explicitly disabled', async () => {
      await expectConfigState({mocha: false}, 'mocha', false, 'default');
    });

    describe('`mocha` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `mocha` eslint config', async () => {
        await expectConfigState({}, 'mocha', false, 'default');
      });

      it('creates `mocha` eslint config if explicitly enabled', async () => {
        await expectConfigState('mocha', 'mocha', true, 'default');
      });

      it('does not create `mocha` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({mocha: false}, 'mocha', ['mocha', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `mocha` eslint config when `mocha` package is installed', async () => {
      await expectConfigState({}, 'mocha', true, 'misc-enabled');
    });

    it('creates `mocha` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({mocha: true}, 'mocha', ['mocha', true], 'misc-enabled');
    });

    it('does not create `mocha` eslint config if explicitly disabled', async () => {
      await expectConfigState({mocha: false}, 'mocha', false, 'misc-enabled');
    });
  });

  it('has default `files` in `mocha` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('mocha')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `mocha` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('mocha')?.ignores?.length).toBeGreaterThan(0);
  });

  it('includes mocha globals in `mocha` eslint config', async () => {
    const globalsPackage = await import('globals');

    expect(configResult.getConfigByUnPostfix('mocha')?.languageOptions?.['globals']).toStrictEqual(
      globalsPackage.default.mocha,
    );
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('mocha');

  it('enables `mocha/handle-done-callback` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('mocha', 'mocha/handle-done-callback')).toBe(2);
  });

  it('disables `mocha/no-hooks` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('mocha', 'mocha/no-hooks')).toBe(0);
  });

  it('`mocha/no-mocha-arrows` rule fires on arrow functions in mocha tests', async () => {
    const results = await testEslintConfig('mocha', FIXTURES.arrowFunctions, {
      searchFixturesRelativeToPath: import.meta.dirname,
    });

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.arrowFunctions,
      'mocha/no-mocha-arrows',
    );

    expect(error?.message).toMatchInlineSnapshot('"Do not pass arrow functions to describe()"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `mocha` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({mocha: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('mocha')?.files).toStrictEqual(FILES);
    });

    it('disables `mocha` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({mocha: {files: []}});

      expect(configResult.getConfigByUnPostfix('mocha')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `mocha` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({mocha: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('mocha')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `mocha` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mocha: {overrides: {'mocha/handle-done-callback': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('mocha', 'mocha/handle-done-callback')).toBe(0);
    expect(configResult.getRuleEntrySeverity('mocha', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set mocha settings by default', async () => {
      const configResult = await computeEslintConfig('mocha');

      expect(
        configResult.getConfigByUnPostfix('mocha')?.settings?.['mocha/additionalCustomNames'],
      ).toBeUndefined();
    });

    it('sets mocha settings when provided', async () => {
      const SETTINGS = {
        additionalCustomNames: [
          {name: 'myDescribe', type: 'suite' as const, interface: 'BDD' as const},
        ],
      };

      const configResult = await computeEslintConfig({mocha: {settings: SETTINGS}});

      expect(
        configResult.getConfigByUnPostfix('mocha')?.settings?.['mocha/additionalCustomNames'],
      ).toStrictEqual(SETTINGS.additionalCustomNames);
    });
  });

  describe('option: `enforceInterface`', () => {
    it('disables `mocha/consistent-interface` rule by default', async () => {
      const configResult = await computeEslintConfig('mocha');

      expect(configResult.getRuleEntrySeverity('mocha', 'mocha/consistent-interface')).toBe(0);
    });

    it('enables `mocha/consistent-interface` rule with `BDD` interface when set to that value', async () => {
      const configResult = await computeEslintConfig({mocha: {enforceInterface: 'BDD'}});

      expect(
        configResult.getRuleEntry('mocha', 'mocha/consistent-interface'),
      ).toMatchInlineSnapshot('[2, {"interface": "BDD"}]');
    });

    it('enables `mocha/consistent-interface` rule with `TDD` interface when set to that value', async () => {
      const configResult = await computeEslintConfig({mocha: {enforceInterface: 'TDD'}});

      expect(
        configResult.getRuleEntry('mocha', 'mocha/consistent-interface'),
      ).toMatchInlineSnapshot('[2, {"interface": "TDD"}]');
    });
  });

  describe('option: `maxTopLevelSuites`', () => {
    it('enables `mocha/max-top-level-suites` rule with default limit of 1 by default', async () => {
      const configResult = await computeEslintConfig('mocha');

      expect(
        configResult.getRuleEntry('mocha', 'mocha/max-top-level-suites'),
      ).toMatchInlineSnapshot('[2, {"limit": 1}]');
    });

    it('enables `mocha/max-top-level-suites` rule with custom limit', async () => {
      const configResult = await computeEslintConfig({mocha: {maxTopLevelSuites: 5}});

      expect(
        configResult.getRuleEntry('mocha', 'mocha/max-top-level-suites'),
      ).toMatchInlineSnapshot('[2, {"limit": 5}]');
    });
  });
});
