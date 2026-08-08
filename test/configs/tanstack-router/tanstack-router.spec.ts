const FIXTURES = {
  routeWithWrongPropertyOrder: 'route-wrong-order.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({'@tanstack/react-router': '1.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('tanstackRouter');

  it('loads `tanstack-router` plugin if used', () => {
    expect(configResult.getLoadedPlugin('tanstack-router')).toBeDefined();
  });

  it('creates `tanstack-router` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tanstack-router')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tanstack-router` eslint config', async () => {
      await expectConfigState({}, 'tanstack-router', false);
    });

    it('creates `tanstack-router` eslint config if explicitly enabled', async () => {
      await expectConfigState('tanstackRouter', 'tanstack-router', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `tanstack-router` eslint config', async () => {
      await expectConfigState({}, 'tanstack-router', true, 'default');
    });

    it('does not create `tanstack-router` eslint config if explicitly disabled', async () => {
      await expectConfigState({tanstackRouter: false}, 'tanstack-router', false, 'default');
    });

    it('creates `tanstack-router` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'tanstackRouter',
        'tanstack-router',
        ['tanstackRouter', true],
        'default',
      );
    });

    describe('only `@tanstack/solid-router` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({'@tanstack/solid-router': '1.0.0'});
      });

      it('creates `tanstack-router` eslint config', async () => {
        await expectConfigState({}, 'tanstack-router', true, 'default');
      });
    });

    describe('neither `@tanstack/react-router` nor `@tanstack/solid-router` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `tanstack-router` eslint config', async () => {
        await expectConfigState({}, 'tanstack-router', false, 'default');
      });

      it('creates `tanstack-router` eslint config if explicitly enabled', async () => {
        await expectConfigState('tanstackRouter', 'tanstack-router', true, 'default');
      });

      it('does not create `tanstack-router` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {tanstackRouter: false},
          'tanstack-router',
          ['tanstackRouter', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `tanstack-router` eslint config', async () => {
      await expectConfigState({}, 'tanstack-router', true, 'misc-enabled');
    });

    it('creates `tanstack-router` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'tanstackRouter',
        'tanstack-router',
        ['tanstackRouter', true],
        'misc-enabled',
      );
    });

    it('does not create `tanstack-router` eslint config if explicitly disabled', async () => {
      await expectConfigState({tanstackRouter: false}, 'tanstack-router', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `tanstack-router` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('tanstack-router')?.files).toBeUndefined();
  });

  it('has default `ignores` in `tanstack-router` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tanstack-router')?.ignores?.length).toBeGreaterThan(
      0,
    );
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('tanstackRouter');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('tanstack-router')).toMatchObject({
      'tanstack-router/create-route-property-order': 2,
      'tanstack-router/route-param-names': 2,
    });
  });

  it('`tanstack-router/create-route-property-order` rule fires on a file with wrong property order', async () => {
    const results = await testEslintConfig(
      {tanstackRouter: true, ts: true},
      FIXTURES.routeWithWrongPropertyOrder,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.routeWithWrongPropertyOrder,
      'tanstack-router/create-route-property-order',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Invalid order of properties for `createRoute`."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tanstack-router` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({tanstackRouter: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tanstack-router')?.files).toStrictEqual(FILES);
    });

    it('disables `tanstack-router` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tanstackRouter: {files: []}});

      expect(configResult.getConfigByUnPostfix('tanstack-router')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tanstack-router` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tanstackRouter: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tanstack-router')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tanstack-router` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tanstackRouter: {
        overrides: {'tanstack-router/create-route-property-order': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'tanstack-router',
        'tanstack-router/create-route-property-order',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('tanstack-router', 'no-console')).toBe(0);
  });
});
