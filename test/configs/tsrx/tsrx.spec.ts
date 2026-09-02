const FIXTURES = {
  forBlockWithoutTemplateOutputTsrx: 'for-block-without-template-output.tsrx',
  forBlockWithoutTemplateOutputRipple: 'for-block-without-template-output.ripple',
} as const;

beforeEach(() => {
  addInstalledPackages({'@tsrx/core': '0.1.64'});
});

describe('basic tests', () => {
  it('creates `tsrx` eslint config and loads `tsrx` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('tsrx');

    const config = configResult.getConfigByUnPostfix('tsrx');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot(
      '["**/*.tsrx", "**/*.ripple", "**/*.?([cm])[jt]s"]',
    );
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('tsrx')).toBeDefined();
  });

  it('does not create `tsrx` eslint config and does not load `tsrx` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({tsrx: false});

    expect(configResult.getConfigByUnPostfix('tsrx')).toBeUndefined();
    expect(configResult.getLoadedPlugin('tsrx')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tsrx` eslint config', async () => {
      await expectConfigState({}, 'tsrx', false);
    });

    it('creates `tsrx` eslint config if explicitly enabled', async () => {
      await expectConfigState('tsrx', 'tsrx', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `tsrx` eslint config when `@tsrx/core` package is installed', async () => {
      await expectConfigState({}, 'tsrx', true, 'default');
    });

    it('does not create `tsrx` eslint config if explicitly disabled', async () => {
      await expectConfigState({tsrx: false}, 'tsrx', false, 'default');
    });

    it('creates `tsrx` eslint config and prints a warning if explicitly enabled (already the default)', async () => {
      await expectConfigState('tsrx', 'tsrx', ['tsrx', true], 'default');
    });

    describe('only `ripple` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({ripple: '0.1.0'});
      });

      it('creates `tsrx` eslint config', async () => {
        await expectConfigState({}, 'tsrx', true, 'default');
      });
    });

    describe('neither `@tsrx/core` nor `ripple` is installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `tsrx` eslint config', async () => {
        await expectConfigState({}, 'tsrx', false, 'default');
      });

      it('creates `tsrx` eslint config if explicitly enabled', async () => {
        await expectConfigState('tsrx', 'tsrx', true, 'default');
      });

      it('does not create `tsrx` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({tsrx: false}, 'tsrx', ['tsrx', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `tsrx` eslint config (`@tsrx/core` package is installed)', async () => {
      await expectConfigState({}, 'tsrx', true, 'misc-enabled');
    });

    it('creates `tsrx` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('tsrx', 'tsrx', ['tsrx', true], 'misc-enabled');
    });

    it('does not create `tsrx` eslint config if explicitly disabled', async () => {
      await expectConfigState({tsrx: false}, 'tsrx', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('tsrx');

    expect(configResult.getRuleSeverities('tsrx')).toMatchObject({
      'tsrx/control-flow-jsx': 2,
      'tsrx/valid-for-of-key': 2,
    });
  });

  it('`tsrx/control-flow-jsx` rule fires on a `@for` block without template output in a `.tsrx` file', async () => {
    const results = await testEslintConfig(
      'tsrx',
      FIXTURES.forBlockWithoutTemplateOutputTsrx,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.forBlockWithoutTemplateOutputTsrx,
      'tsrx/control-flow-jsx',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"@for blocks in returned TSRX should contain template output. Render an element, fragment, or nested template directive."',
    );
  });

  it('`tsrx/control-flow-jsx` rule fires on a `@for` block without template output in a `.ripple` file', async () => {
    const results = await testEslintConfig(
      'tsrx',
      FIXTURES.forBlockWithoutTemplateOutputRipple,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.forBlockWithoutTemplateOutputRipple,
      'tsrx/control-flow-jsx',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"@for blocks in returned TSRX should contain template output. Render an element, fragment, or nested template directive."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tsrx` eslint config', async () => {
      const FILES = ['src/**/*.tsrx'];

      const configResult = await computeEslintConfig({tsrx: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tsrx')?.files).toStrictEqual(FILES);
    });

    it('disables `tsrx` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tsrx: {files: []}});

      expect(configResult.getConfigByUnPostfix('tsrx')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tsrx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tsrx: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tsrx')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tsrx` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tsrx: {
        overrides: {'tsrx/control-flow-jsx': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('tsrx')).toMatchObject({
      'tsrx/control-flow-jsx': 0,
      'no-console': 0,
    });
  });
});
