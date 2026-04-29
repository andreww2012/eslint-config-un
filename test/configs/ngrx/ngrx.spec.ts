const FIXTURES = {
  actionWithoutNamespace: 'action-without-namespace.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'@ngrx/store': '21.1.0'});
});

describe('basic tests', () => {
  it('creates `ngrx` eslint config and loads `@ngrx` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('ngrx');

    const config = configResult.getConfigByUnPostfix('ngrx');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('@ngrx')).toBeDefined();
  });

  it('does not create `ngrx` eslint config and does not load `@ngrx` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({ngrx: false});

    expect(configResult.getConfigByUnPostfix('ngrx')).toBeUndefined();
    expect(configResult.getLoadedPlugin('@ngrx')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `ngrx` eslint config', async () => {
      await expectConfigState({}, 'ngrx', false);
    });

    it('creates `ngrx` eslint config if explicitly enabled', async () => {
      await expectConfigState('ngrx', 'ngrx', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('@ngrx/store is installed', () => {
      it('creates `ngrx` eslint config by default', async () => {
        await expectConfigState({}, 'ngrx', true, 'default');
      });

      it('creates `ngrx` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('ngrx', 'ngrx', ['ngrx', true], 'default');
      });

      it('does not create `ngrx` eslint config if explicitly disabled', async () => {
        await expectConfigState({ngrx: false}, 'ngrx', false, 'default');
      });
    });

    describe('@ngrx/store is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `ngrx` eslint config', async () => {
        await expectConfigState({}, 'ngrx', false, 'default');
      });

      it('creates `ngrx` eslint config if explicitly enabled', async () => {
        await expectConfigState('ngrx', 'ngrx', true, 'default');
      });

      it('does not create `ngrx` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({ngrx: false}, 'ngrx', ['ngrx', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `ngrx` eslint config when `@ngrx/store` is installed', async () => {
      await expectConfigState({}, 'ngrx', true, 'misc-enabled');
    });

    it('creates `ngrx` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({ngrx: true}, 'ngrx', ['ngrx', true], 'misc-enabled');
    });

    it('does not create `ngrx` eslint config if explicitly disabled', async () => {
      await expectConfigState({ngrx: false}, 'ngrx', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('ngrx');

    expect(configResult.getRuleSeverities('ngrx')).toMatchObject({
      '@ngrx/use-effects-lifecycle-interface': 2,
      '@ngrx/with-state-no-arrays-at-root-level': 2,
    });
  });

  it('`@ngrx/good-action-hygiene` rule fires on an action type string not following `[Feature] Event` convention', async () => {
    const results = await testEslintConfig(
      'ngrx',
      FIXTURES.actionWithoutNamespace,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.actionWithoutNamespace,
      '@ngrx/good-action-hygiene',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Action type `loadItems` does not follow the good action hygiene practice, use "[Source] loadItems" to define action types."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `ngrx` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({ngrx: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('ngrx')?.files).toStrictEqual(FILES);
    });

    it('disables `ngrx` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({ngrx: {files: []}});

      expect(configResult.getConfigByUnPostfix('ngrx')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `ngrx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({ngrx: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('ngrx')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `ngrx` eslint config', async () => {
    const configResult = await computeEslintConfig({
      ngrx: {
        overrides: {'@ngrx/avoid-combining-selectors': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('ngrx')).toMatchObject({
      '@ngrx/avoid-combining-selectors': 0,
      'no-console': 0,
    });
  });
});
