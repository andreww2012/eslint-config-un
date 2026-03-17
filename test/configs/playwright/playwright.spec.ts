beforeEach(() => {
  addInstalledPackages({playwright: '1.45.0'});
});

const FIXTURES = {
  noFocusedTest: 'no-focused-test/test.spec.ts',
  expectExpect: 'expect-expect/test.spec.ts',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('playwright');

  it('loads `playwright` plugin if used', () => {
    expect(configResult.getLoadedPlugin('playwright')).toBeDefined();
  });

  it('creates `playwright` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('playwright')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `playwright` eslint config', async () => {
      await expectConfigState({}, 'playwright', false);
    });

    it('creates `playwright` eslint config if explicitly enabled', async () => {
      await expectConfigState('playwright', 'playwright', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `playwright` eslint config when `playwright` package is installed', async () => {
      await expectConfigState({}, 'playwright', true, 'default');
    });

    it('creates `playwright` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('playwright', 'playwright', ['playwright', true], 'default');
    });

    it('does not create `playwright` eslint config if explicitly disabled', async () => {
      await expectConfigState({playwright: false}, 'playwright', false, 'default');
    });

    it('does not create `playwright` eslint config when `playwright` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState({}, 'playwright', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `playwright` eslint config when `playwright` package is installed', async () => {
      await expectConfigState({}, 'playwright', true, 'misc-enabled');
    });

    it('creates `playwright` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState(
        {playwright: true},
        'playwright',
        ['playwright', true],
        'misc-enabled',
      );
    });

    it('does not create `playwright` eslint config if explicitly disabled', async () => {
      await expectConfigState({playwright: false}, 'playwright', false, 'misc-enabled');
    });
  });

  it('has default `files` in `playwright` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('playwright')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `playwright` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('playwright')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('playwright');

  it('enables `playwright/no-focused-test` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('playwright', 'playwright/no-focused-test')).toBe(2);
  });

  it('disables `playwright/max-expects` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('playwright', 'playwright/max-expects')).toBe(0);
  });

  it('`playwright/no-focused-test` rule fires on a test file that uses `test.only`', async () => {
    const results = await testEslintConfig(
      'playwright',
      FIXTURES.noFocusedTest,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.noFocusedTest,
      'playwright/no-focused-test',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unexpected focused test."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `playwright` eslint config', async () => {
      const FILES = ['tests/**/*.playwright.ts'];
      const configResult = await computeEslintConfig({playwright: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('playwright')?.files).toStrictEqual(FILES);
    });

    it('disables `playwright` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({playwright: {files: []}});

      expect(configResult.getConfigByUnPostfix('playwright')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `playwright` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({playwright: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('playwright')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `playwright` eslint config', async () => {
    const configResult = await computeEslintConfig({
      playwright: {
        overrides: {'playwright/no-focused-test': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('playwright', 'playwright/no-focused-test')).toBe(0);
    expect(configResult.getRuleEntrySeverity('playwright', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `playwright` eslint config', async () => {
      const configResult = await computeEslintConfig({playwright: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('playwright'), (ruleName) =>
          ruleName.startsWith('playwright/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `playwright` eslint config', async () => {
      const configResult = await computeEslintConfig({playwright: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('playwright'), (ruleName) =>
          ruleName.startsWith('playwright/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `playwright` settings when `settings` is not provided', async () => {
      const configResult = await computeEslintConfig('playwright');
      const config = configResult.getConfigByUnPostfix('playwright');

      expect(config?.settings?.['playwright']).toBeUndefined();
    });

    it('sets `playwright` settings when `settings` is provided', async () => {
      const SETTINGS = {globalAliases: {test: ['myTest']}};

      const configResult = await computeEslintConfig({playwright: {settings: SETTINGS}});

      expect(
        configResult.getConfigByUnPostfix('playwright')?.settings?.['playwright'],
      ).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `customAssertFunctionNames`', () => {
    it('does not add custom assert function names to `expect-expect` rule options when not provided', async () => {
      const configResult = await computeEslintConfig('playwright');

      expect(
        configResult.getRuleEntry('playwright', 'playwright/expect-expect'),
      ).toMatchInlineSnapshot('[2]');
    });

    it('adds custom assert function names to `expect-expect` rule options when provided', async () => {
      const configResult = await computeEslintConfig({
        playwright: {customAssertFunctionNames: ['myAssert']},
      });

      expect(
        configResult.getRuleEntry('playwright', 'playwright/expect-expect'),
      ).toMatchInlineSnapshot('[2, {"assertFunctionNames": ["myAssert"]}]');
    });

    it('`expect-expect` rule fires when test only calls a custom assert function not listed in `customAssertFunctionNames`', async () => {
      const results = await testEslintConfig(
        'playwright',
        FIXTURES.expectExpect,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.expectExpect,
        'playwright/expect-expect',
      );

      expect(error?.message).toMatchInlineSnapshot('"Test has no assertions"');
    });

    it('`expect-expect` rule does not fire when test only calls a custom assert function listed in `customAssertFunctionNames`', async () => {
      const results = await testEslintConfig(
        {playwright: {customAssertFunctionNames: ['myCustomAssert']}},
        FIXTURES.expectExpect,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.expectExpect,
        'playwright/expect-expect',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('option: `customAsyncExpectMatches`', () => {
    it('does not add custom async matchers to `missing-playwright-await` rule options when not provided', async () => {
      const configResult = await computeEslintConfig('playwright');

      expect(
        configResult.getRuleEntry('playwright', 'playwright/missing-playwright-await'),
      ).toMatchInlineSnapshot('[2]');
    });

    it('adds custom async matchers to `missing-playwright-await` rule options when provided', async () => {
      const configResult = await computeEslintConfig({
        playwright: {customAsyncExpectMatches: ['toBeAccessible']},
      });

      expect(
        configResult.getRuleEntry('playwright', 'playwright/missing-playwright-await'),
      ).toMatchInlineSnapshot('[2, {"customMatchers": ["toBeAccessible"]}]');
    });
  });
});
