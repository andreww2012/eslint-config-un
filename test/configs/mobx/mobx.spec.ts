const FIXTURES = {
  missingAnnotation: 'missing-annotation.js',
} as const;

beforeEach(() => {
  addInstalledPackages({mobx: '6.0.0'});
});

describe('basic tests', () => {
  it('creates `mobx` eslint config and loads `mobx` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('mobx');

    const config = configResult.getConfigByUnPostfix('mobx');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('mobx')).toBeDefined();
  });

  it('does not create `mobx` eslint config and does not load `mobx` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({mobx: false});

    expect(configResult.getConfigByUnPostfix('mobx')).toBeUndefined();
    expect(configResult.getLoadedPlugin('mobx')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `mobx` eslint config', async () => {
      await expectConfigState({}, 'mobx', false);
    });

    it('creates `mobx` eslint config if explicitly enabled', async () => {
      await expectConfigState('mobx', 'mobx', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('mobx is installed', () => {
      it('creates `mobx` eslint config by default', async () => {
        await expectConfigState({}, 'mobx', true, 'default');
      });

      it('creates `mobx` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('mobx', 'mobx', ['mobx', true], 'default');
      });

      it('does not create `mobx` eslint config if explicitly disabled', async () => {
        await expectConfigState({mobx: false}, 'mobx', false, 'default');
      });
    });

    describe('mobx is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `mobx` eslint config', async () => {
        await expectConfigState({}, 'mobx', false, 'default');
      });

      it('creates `mobx` eslint config if explicitly enabled', async () => {
        await expectConfigState('mobx', 'mobx', true, 'default');
      });

      it('does not create `mobx` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({mobx: false}, 'mobx', ['mobx', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `mobx` eslint config when `mobx` is installed', async () => {
      await expectConfigState({}, 'mobx', true, 'misc-enabled');
    });

    it('creates `mobx` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({mobx: true}, 'mobx', ['mobx', true], 'misc-enabled');
    });

    it('does not create `mobx` eslint config if explicitly disabled', async () => {
      await expectConfigState({mobx: false}, 'mobx', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('mobx');

    expect(configResult.getRuleSeverities('mobx')).toMatchObject({
      'mobx/unconditional-make-observable': 2,
      'mobx/exhaustive-make-observable': 0,
    });
  });

  it('`mobx/exhaustive-make-observable` rule fires when not all class properties are annotated in `makeObservable`', async () => {
    const results = await testEslintConfig(
      {mobx: {forceSeverity: 2}},
      FIXTURES.missingAnnotation,
      import.meta.dirname,
    );

    const warning = findLintMessageFromLintResults(
      results,
      FIXTURES.missingAnnotation,
      'mobx/exhaustive-make-observable',
    );

    expect(warning?.message).toMatchInlineSnapshot(
      '"Missing annotation for `count`. To exclude a field, use `false` as annotation."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `mobx` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({mobx: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('mobx')?.files).toStrictEqual(FILES);
    });

    it('disables `mobx` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({mobx: {files: []}});

      expect(configResult.getConfigByUnPostfix('mobx')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `mobx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({mobx: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('mobx')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `mobx` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mobx: {
        overrides: {'mobx/missing-make-observable': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('mobx')).toMatchObject({
      'mobx/missing-make-observable': 0,
      'no-console': 0,
    });
  });
});
