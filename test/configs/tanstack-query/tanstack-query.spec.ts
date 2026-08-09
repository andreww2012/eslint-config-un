const FIXTURES = {
  mutationWrongOrder: 'mutation-wrong-order.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'@tanstack/query-core': '5.0.0'});
});

describe('basic tests', () => {
  it('creates `tanstack-query` eslint config and loads `tanstack-query` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('tanstackQuery');

    const config = configResult.getConfigByUnPostfix('tanstack-query');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('tanstack-query')).toBeDefined();
  });

  it('does not create `tanstack-query` eslint config and does not load `tanstack-query` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({tanstackQuery: false});

    expect(configResult.getConfigByUnPostfix('tanstack-query')).toBeUndefined();
    expect(configResult.getLoadedPlugin('tanstack-query')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tanstack-query` eslint config', async () => {
      await expectConfigState({}, 'tanstack-query', false);
    });

    it('creates `tanstack-query` eslint config if explicitly enabled', async () => {
      await expectConfigState('tanstackQuery', 'tanstack-query', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `tanstack-query` eslint config when `@tanstack/query-core` is installed', async () => {
      await expectConfigState({}, 'tanstack-query', true, 'default');
    });

    it('creates `tanstack-query` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState(
        'tanstackQuery',
        'tanstack-query',
        ['tanstackQuery', true],
        'default',
      );
    });

    it('does not create `tanstack-query` eslint config if explicitly disabled', async () => {
      await expectConfigState({tanstackQuery: false}, 'tanstack-query', false, 'default');
    });

    describe('`@tanstack/query-core` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `tanstack-query` eslint config', async () => {
        await expectConfigState({}, 'tanstack-query', false, 'default');
      });

      it('creates `tanstack-query` eslint config if explicitly enabled', async () => {
        await expectConfigState('tanstackQuery', 'tanstack-query', true, 'default');
      });

      it('does not create `tanstack-query` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {tanstackQuery: false},
          'tanstack-query',
          ['tanstackQuery', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `tanstack-query` eslint config when `@tanstack/query-core` is installed', async () => {
      await expectConfigState({}, 'tanstack-query', true, 'misc-enabled');
    });

    it('creates `tanstack-query` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState(
        {tanstackQuery: true},
        'tanstack-query',
        ['tanstackQuery', true],
        'misc-enabled',
      );
    });

    it('does not create `tanstack-query` eslint config if explicitly disabled', async () => {
      await expectConfigState({tanstackQuery: false}, 'tanstack-query', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('tanstackQuery');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('tanstack-query')).toMatchObject({
      'tanstack-query/exhaustive-deps': 2,
      'tanstack-query/prefer-query-options': 0,
    });
  });

  it('`tanstack-query/mutation-property-order` rule fires when mutation properties are in wrong order', async () => {
    const results = await testEslintConfig(
      'tanstackQuery',
      FIXTURES.mutationWrongOrder,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.mutationWrongOrder,
      'tanstack-query/mutation-property-order',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Invalid order of properties for `useMutation`."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tanstack-query` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({tanstackQuery: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tanstack-query')?.files).toStrictEqual(FILES);
    });

    it('disables `tanstack-query` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tanstackQuery: {files: []}});

      expect(configResult.getConfigByUnPostfix('tanstack-query')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tanstack-query` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tanstackQuery: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tanstack-query')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tanstack-query` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tanstackQuery: {
        overrides: {'tanstack-query/exhaustive-deps': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('tanstack-query', 'tanstack-query/exhaustive-deps'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('tanstack-query', 'no-console')).toBe(0);
  });
});
