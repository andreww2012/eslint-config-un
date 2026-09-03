const FIXTURES = {
  unawaitedFindByQuery: 'unawaited-findby-query/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'@testing-library/dom': '10.4.1'});
});

describe('basic tests', () => {
  it('creates `testing-library/dom` eslint config and loads `testing-library` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('testingLibrary');

    const config = configResult.getConfigByUnPostfix('testing-library/dom');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot(
      '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)"]',
    );
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('testing-library')).toBeDefined();
  });

  it('does not create `testing-library/dom` when any framework sub-config is enabled', async () => {
    const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

    expect(configResult.getConfigByUnPostfix('testing-library/dom')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `testing-library/dom` eslint config', async () => {
      await expectConfigState({}, 'testing-library/dom', false);
    });

    it('creates `testing-library/dom` eslint config if explicitly enabled', async () => {
      await expectConfigState('testingLibrary', 'testing-library/dom', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `testing-library/dom` eslint config when `@testing-library/dom` is installed', async () => {
      await expectConfigState({}, 'testing-library/dom', true, 'default');
    });

    it('creates `testing-library/dom` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState(
        'testingLibrary',
        'testing-library/dom',
        ['testingLibrary', true],
        'default',
      );
    });

    it('does not create `testing-library/dom` eslint config if explicitly disabled', async () => {
      await expectConfigState({testingLibrary: false}, 'testing-library/dom', false, 'default');
    });

    describe('relevant packages are not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `testing-library/dom` eslint config', async () => {
        await expectConfigState({}, 'testing-library/dom', false, 'default');
      });

      it('creates `testing-library/dom` eslint config if explicitly enabled', async () => {
        await expectConfigState('testingLibrary', 'testing-library/dom', true, 'default');
      });

      it('does not create `testing-library/dom` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {testingLibrary: false},
          'testing-library/dom',
          ['testingLibrary', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `testing-library/dom` eslint config when `@testing-library/dom` is installed', async () => {
      await expectConfigState({}, 'testing-library/dom', true, 'misc-enabled');
    });

    it('creates `testing-library/dom` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState(
        'testingLibrary',
        'testing-library/dom',
        ['testingLibrary', true],
        'misc-enabled',
      );
    });

    it('does not create `testing-library/dom` eslint config if explicitly disabled', async () => {
      await expectConfigState(
        {testingLibrary: false},
        'testing-library/dom',
        false,
        'misc-enabled',
      );
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('testingLibrary');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('testing-library/dom')).toMatchObject({
      'testing-library/await-async-queries': 2,
      'testing-library/no-test-id-queries': 1,
      'testing-library/no-container': 0,
    });
  });

  it('`testing-library/await-async-queries` rule fires on a test missing `await` on a `findBy` query', async () => {
    const results = await testEslintConfig(
      'testingLibrary',
      FIXTURES.unawaitedFindByQuery,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unawaitedFindByQuery,
      'testing-library/await-async-queries',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"promise returned from `findByRole` query must be handled"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `testing-library/dom` eslint config', async () => {
      const FILES = ['src/**/*.spec.js'];

      const configResult = await computeEslintConfig({testingLibrary: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('testing-library/dom')?.files).toStrictEqual(FILES);
    });

    it('disables `testing-library/dom` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {files: []}});

      expect(configResult.getConfigByUnPostfix('testing-library/dom')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `testing-library/dom` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({testingLibrary: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('testing-library/dom')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });

    it('does not disable `testing-library/dom` eslint config when `ignores` is empty array', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {ignores: []}});

      expect(configResult.getConfigByUnPostfix('testing-library/dom')).toBeDefined();
    });
  });

  it('respects `overrides` and `overridesAny` in `testing-library/dom` eslint config', async () => {
    const configResult = await computeEslintConfig({
      testingLibrary: {
        overrides: {'testing-library/await-async-queries': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'testing-library/dom',
        'testing-library/await-async-queries',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('testing-library/dom', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set testing-library settings by default', async () => {
      const configResult = await computeEslintConfig('testingLibrary');
      const config = configResult.getConfigByUnPostfix('testing-library/dom');

      expect(config?.settings?.['testing-library/utils-module']).toBeUndefined();
    });

    it('sets testing-library settings when `settings` is provided', async () => {
      const SETTINGS = {utilsModule: 'my-test-utils'};

      const configResult = await computeEslintConfig('testingLibrary', {
        un: {plugins: {'testing-library': {settings: SETTINGS}}},
      });
      const config = configResult.getConfigByUnPostfix('testing-library/dom');

      expect(config?.settings?.['testing-library/utils-module']).toStrictEqual(
        SETTINGS.utilsModule,
      );
    });
  });

  describe('option: `allowContainerFirstChild`', () => {
    it('sets `allowContainerFirstChild: true` in `testing-library/no-node-access` rule options by default', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(
        configResult.getRuleEntry('testing-library/dom', 'testing-library/no-node-access'),
      ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": true}]');
    });

    it('sets `allowContainerFirstChild: false` in `testing-library/no-node-access` rule options when set to `false', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {allowContainerFirstChild: false},
      });

      expect(
        configResult.getRuleEntry('testing-library/dom', 'testing-library/no-node-access'),
      ).toMatchInlineSnapshot('[2, {"allowContainerFirstChild": false}]');
    });
  });

  describe('option: `preferAssertStyle`', () => {
    it('does not enforce assert style by default', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-explicit-assert',
        ),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-implicit-assert',
        ),
      ).toBe(0);
    });

    it('enables `testing-library/prefer-explicit-assert` rule when set to `explicit`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {preferAssertStyle: 'explicit'},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-explicit-assert',
        ),
      ).toBe(2);
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-implicit-assert',
        ),
      ).toBe(0);
    });

    it('enables `testing-library/prefer-implicit-assert` rule when set to `implicit`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {preferAssertStyle: 'implicit'},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-implicit-assert',
        ),
      ).toBe(2);
      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-explicit-assert',
        ),
      ).toBe(0);
    });
  });

  describe('option: `preferQueryMatchers`', () => {
    it('disables `testing-library/prefer-query-matchers` rule by default', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-query-matchers',
        ),
      ).toBe(0);
    });

    it('enables `testing-library/prefer-query-matchers` rule with provided entries', async () => {
      const MATCHERS = [{matcher: 'toBeVisible', query: 'get'} as const];

      const configResult = await computeEslintConfig({
        testingLibrary: {preferQueryMatchers: MATCHERS},
      });

      expect(
        configResult.getRuleEntryOptions(
          'testing-library/dom',
          'testing-library/prefer-query-matchers',
        ),
      ).toStrictEqual([{validEntries: MATCHERS}]);
    });
  });

  describe('option: `preferUserEventOverFireEvent`', () => {
    it('enables `testing-library/prefer-user-event` rule by default', async () => {
      const configResult = await computeEslintConfig('testingLibrary');

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-user-event',
        ),
      ).toBe(2);
    });

    it('disables `testing-library/prefer-user-event` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {preferUserEventOverFireEvent: false},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'testing-library/dom',
          'testing-library/prefer-user-event',
        ),
      ).toBe(0);
    });

    it('enables `testing-library/prefer-user-event` rule with options when set to object', async () => {
      const ALLOWED_METHODS = ['paste'];

      const configResult = await computeEslintConfig({
        testingLibrary: {preferUserEventOverFireEvent: {allowedMethods: ALLOWED_METHODS}},
      });

      expect(
        configResult.getRuleEntryOptions(
          'testing-library/dom',
          'testing-library/prefer-user-event',
        ),
      ).toStrictEqual([{allowedMethods: ALLOWED_METHODS}]);
    });
  });

  describe('option: `disableRootConfigIfFrameworkConfigIsEnabled`', () => {
    it('suppresses `testing-library/dom` eslint config when a framework sub-config is enabled and option is not set', async () => {
      const configResult = await computeEslintConfig({testingLibrary: {configReact: true}});

      expect(configResult.getConfigByUnPostfix('testing-library/dom')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('testing-library/react')).toBeDefined();
    });

    it('keeps `testing-library/dom` eslint config when set to `false` even if a framework sub-config is enabled', async () => {
      const configResult = await computeEslintConfig({
        testingLibrary: {configReact: true, disableRootConfigIfFrameworkConfigIsEnabled: false},
      });

      expect(configResult.getConfigByUnPostfix('testing-library/dom')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('testing-library/react')).toBeDefined();
    });
  });
});
