const FIXTURES = {
  forBlockWithoutTemplateOutputTsrx: 'for-block-without-template-output.tsrx',
  forBlockWithoutTemplateOutputRipple: 'for-block-without-template-output.ripple',
} as const;

beforeEach(() => {
  addInstalledPackages({ripple: '0.1.0'});
});

describe('basic tests', () => {
  it('creates `ripple` eslint config and loads `ripple` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('ripple');

    const config = configResult.getConfigByUnPostfix('ripple');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot(
      '["**/*.tsrx", "**/*.ripple", "**/*.?([cm])[jt]s"]',
    );
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('ripple')).toBeDefined();
  });

  it('does not create `ripple` eslint config and does not load `ripple` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({ripple: false});

    expect(configResult.getConfigByUnPostfix('ripple')).toBeUndefined();
    expect(configResult.getLoadedPlugin('ripple')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `ripple` eslint config', async () => {
      await expectConfigState({}, 'ripple', false);
    });

    it('creates `ripple` eslint config if explicitly enabled', async () => {
      await expectConfigState('ripple', 'ripple', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `ripple` eslint config when `ripple` package is installed', async () => {
      await expectConfigState({}, 'ripple', true, 'default');
    });

    it('does not create `ripple` eslint config if explicitly disabled', async () => {
      await expectConfigState({ripple: false}, 'ripple', false, 'default');
    });

    it('creates `ripple` eslint config and prints a warning if explicitly enabled (already the default)', async () => {
      await expectConfigState('ripple', 'ripple', ['ripple', true], 'default');
    });

    describe('`ripple` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `ripple` eslint config', async () => {
        await expectConfigState({}, 'ripple', false, 'default');
      });

      it('creates `ripple` eslint config if explicitly enabled', async () => {
        await expectConfigState('ripple', 'ripple', true, 'default');
      });

      it('does not create `ripple` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({ripple: false}, 'ripple', ['ripple', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `ripple` eslint config (ripple package is installed)', async () => {
      await expectConfigState({}, 'ripple', true, 'misc-enabled');
    });

    it('creates `ripple` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('ripple', 'ripple', ['ripple', true], 'misc-enabled');
    });

    it('does not create `ripple` eslint config if explicitly disabled', async () => {
      await expectConfigState({ripple: false}, 'ripple', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('ripple');

    expect(configResult.getRuleSeverities('ripple')).toMatchObject({
      'ripple/control-flow-jsx': 2,
      'ripple/valid-for-of-key': 2,
    });
  });

  it('`ripple/control-flow-jsx` rule fires on a `@for` block without template output in a `.tsrx` file', async () => {
    const results = await testEslintConfig(
      'ripple',
      FIXTURES.forBlockWithoutTemplateOutputTsrx,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.forBlockWithoutTemplateOutputTsrx,
      'ripple/control-flow-jsx',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"@for blocks in returned TSRX should contain template output. Render an element, fragment, or nested template directive."',
    );
  });

  it('`ripple/control-flow-jsx` rule fires on a `@for` block without template output in a `.ripple` file', async () => {
    const results = await testEslintConfig(
      'ripple',
      FIXTURES.forBlockWithoutTemplateOutputRipple,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.forBlockWithoutTemplateOutputRipple,
      'ripple/control-flow-jsx',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"@for blocks in returned TSRX should contain template output. Render an element, fragment, or nested template directive."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `ripple` eslint config', async () => {
      const FILES = ['src/**/*.tsrx'];

      const configResult = await computeEslintConfig({ripple: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('ripple')?.files).toStrictEqual(FILES);
    });

    it('disables `ripple` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({ripple: {files: []}});

      expect(configResult.getConfigByUnPostfix('ripple')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `ripple` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({ripple: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('ripple')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `ripple` eslint config', async () => {
    const configResult = await computeEslintConfig({
      ripple: {
        overrides: {'ripple/control-flow-jsx': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('ripple')).toMatchObject({
      'ripple/control-flow-jsx': 0,
      'no-console': 0,
    });
  });
});
