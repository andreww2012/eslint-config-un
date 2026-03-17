beforeEach(() => {
  addInstalledPackages({cypress: '13.0.0'});
});

const FIXTURES = {
  noUnnecessaryWaiting: 'unnecessary-waiting/test.cy.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('cypress');

  it('loads `cypress` plugin if used', () => {
    expect(configResult.getLoadedPlugin('cypress')).toBeDefined();
  });

  it('creates `cypress` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cypress')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `cypress` eslint config', async () => {
      await expectConfigState({}, 'cypress', false);
    });

    it('creates `cypress` eslint config if explicitly enabled', async () => {
      await expectConfigState('cypress', 'cypress', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `cypress` eslint config when `cypress` package is installed', async () => {
      await expectConfigState({}, 'cypress', true, 'default');
    });

    it('creates `cypress` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('cypress', 'cypress', ['cypress', true], 'default');
    });

    it('does not create `cypress` eslint config if explicitly disabled', async () => {
      await expectConfigState({cypress: false}, 'cypress', false, 'default');
    });

    it('does not create `cypress` eslint config when `cypress` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState({}, 'cypress', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `cypress` eslint config when `cypress` package is installed', async () => {
      await expectConfigState({}, 'cypress', true, 'misc-enabled');
    });

    it('creates `cypress` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({cypress: true}, 'cypress', ['cypress', true], 'misc-enabled');
    });

    it('does not create `cypress` eslint config if explicitly disabled', async () => {
      await expectConfigState({cypress: false}, 'cypress', false, 'misc-enabled');
    });
  });

  it('has default `files` in `cypress` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cypress')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)", "**/*.cy.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `cypress` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cypress')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('cypress');

  it('enables `cypress/no-assigning-return-values` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('cypress', 'cypress/no-assigning-return-values')).toBe(
      2,
    );
  });

  it('disables `cypress/no-xpath` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('cypress', 'cypress/no-xpath')).toBe(0);
  });

  it('`cypress/no-unnecessary-waiting` rule fires on a test with `cy.wait(number)`', async () => {
    const results = await testEslintConfig(
      'cypress',
      FIXTURES.noUnnecessaryWaiting,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.noUnnecessaryWaiting,
      'cypress/no-unnecessary-waiting',
    );

    expect(error?.message).toMatchInlineSnapshot('"Do not wait for arbitrary time periods"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `cypress` eslint config', async () => {
      const FILES = ['e2e/**/*.cy.ts'];
      const configResult = await computeEslintConfig({cypress: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('cypress')?.files).toStrictEqual(FILES);
    });

    it('disables `cypress` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({cypress: {files: []}});

      expect(configResult.getConfigByUnPostfix('cypress')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `cypress` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({cypress: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('cypress')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `cypress` eslint config', async () => {
    const configResult = await computeEslintConfig({
      cypress: {
        overrides: {'cypress/no-assigning-return-values': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('cypress', 'cypress/no-assigning-return-values')).toBe(
      0,
    );
    expect(configResult.getRuleEntrySeverity('cypress', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `cypress` eslint config', async () => {
      const configResult = await computeEslintConfig({cypress: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('cypress'), (ruleName) =>
          ruleName.startsWith('cypress/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `cypress` eslint config', async () => {
      const configResult = await computeEslintConfig({cypress: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('cypress'), (ruleName) =>
          ruleName.startsWith('cypress/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});
