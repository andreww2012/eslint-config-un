const FIXTURES = {
  useClientAsyncComponent: 'use-client-async-component.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({'@tanstack/react-start': '1.0.0'});
});

describe('basic tests', () => {
  it('creates `tanstack-start` eslint config and loads `@tanstack/start` plugin when set to `true`', async () => {
    const configResult = await computeEslintConfig('tanstackStart');

    const config = configResult.getConfigByUnPostfix('tanstack-start');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');

    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('@tanstack/start')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tanstack-start` eslint config', async () => {
      await expectConfigState({}, 'tanstack-start', false);
    });

    it('creates `tanstack-start` eslint config if explicitly enabled', async () => {
      await expectConfigState('tanstackStart', 'tanstack-start', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `tanstack-start` eslint config when `@tanstack/react-start` is installed', async () => {
      await expectConfigState({}, 'tanstack-start', true, 'default');
    });

    it('does not create `tanstack-start` eslint config if explicitly disabled', async () => {
      await expectConfigState({tanstackStart: false}, 'tanstack-start', false, 'default');
    });

    it('creates `tanstack-start` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'tanstackStart',
        'tanstack-start',
        ['tanstackStart', true],
        'default',
      );
    });

    describe('only `@tanstack/solid-start` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({'@tanstack/solid-start': '1.0.0'});
      });

      it('creates `tanstack-start` eslint config', async () => {
        await expectConfigState({}, 'tanstack-start', true, 'default');
      });
    });

    describe('neither `@tanstack/react-start` nor `@tanstack/solid-start` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `tanstack-start` eslint config', async () => {
        await expectConfigState({}, 'tanstack-start', false, 'default');
      });

      it('creates `tanstack-start` eslint config if explicitly enabled', async () => {
        await expectConfigState('tanstackStart', 'tanstack-start', true, 'default');
      });

      it('does not create `tanstack-start` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {tanstackStart: false},
          'tanstack-start',
          ['tanstackStart', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `tanstack-start` eslint config', async () => {
      await expectConfigState({}, 'tanstack-start', true, 'misc-enabled');
    });

    it('creates `tanstack-start` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'tanstackStart',
        'tanstack-start',
        ['tanstackStart', true],
        'misc-enabled',
      );
    });

    it('does not create `tanstack-start` eslint config if explicitly disabled', async () => {
      await expectConfigState({tanstackStart: false}, 'tanstack-start', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('tanstackStart');

    expect(configResult.getRuleSeverities('tanstack-start')).toMatchObject({
      '@tanstack/start/no-async-client-component': 2,
      '@tanstack/start/no-client-code-in-server-component': 2,
    });
  });

  it('`@tanstack/start/no-async-client-component` rule fires on an async component in a client file', async () => {
    const results = await testEslintConfig(
      {tanstackStart: true, ts: true},
      FIXTURES.useClientAsyncComponent,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.useClientAsyncComponent,
      '@tanstack/start/no-async-client-component',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Async component "AsyncClientComponent" cannot be used in client context. Async components are only valid inside server components. Either remove "async" or ensure this component is only rendered within server components. File has "use client" directive."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tanstack-start` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({tanstackStart: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tanstack-start')?.files).toStrictEqual(FILES);
    });

    it('disables `tanstack-start` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tanstackStart: {files: []}});

      expect(configResult.getConfigByUnPostfix('tanstack-start')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tanstack-start` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tanstackStart: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tanstack-start')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tanstack-start` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tanstackStart: {
        overrides: {'@tanstack/start/no-async-client-component': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'tanstack-start',
        '@tanstack/start/no-async-client-component',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('tanstack-start', 'no-console')).toBe(0);
  });
});
