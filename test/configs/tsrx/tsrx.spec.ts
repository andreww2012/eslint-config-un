const FIXTURES = {
  forBlockWithoutTemplateOutputTsrx: 'for-block-without-template-output.tsrx',
  forBlockWithoutTemplateOutputRipple: 'for-block-without-template-output.ripple',
  unusedVariable: 'unused-variable.tsrx',
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

    expect(
      configResult.getConfigByUnPostfix('tsrx/core-rules-replacements')?.files,
    ).toMatchInlineSnapshot('["**/*.tsrx", "**/*.ripple"]');

    expect(configResult.getLoadedPlugin('tsrx')).toBeDefined();
  });

  it('does not create `tsrx{,/core-rules-replacements}` eslint configs and does not load `tsrx` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({tsrx: false});

    expect(configResult.getConfigByUnPostfix('tsrx')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('tsrx/core-rules-replacements')).toBeUndefined();
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
      'tsrx/jsx-curly-brace-presence': 0,
    });
    expect(configResult.getRuleSeverities('tsrx/core-rules-replacements')).toMatchObject({
      'no-unused-vars': 0,
      'tsrx/no-await-in-loop': 1,
      'tsrx/no-unused-vars': 2,
    });
  });

  describe('core rules replacements', () => {
    it('replaces the core rules in TSRX files only', async () => {
      const configResult = await computeEslintConfig({js: true, tsrx: true});

      await expect(configResult.getRuleSeveritiesForFile('component.tsrx')).resolves.toMatchObject({
        'no-unused-vars': 0,
        'tsrx/no-unused-vars': 2,
      });

      const jsFileSeverities = await configResult.getRuleSeveritiesForFile('component.js');

      expect(jsFileSeverities).toMatchObject({'no-unused-vars': 2});
      expect(jsFileSeverities).not.toHaveProperty('tsrx/no-unused-vars');
    });

    it('inherits the severities and options of the core rules from `js` config', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {'no-unused-vars': [1, {vars: 'local'}]}},
        tsrx: true,
      });

      expect(
        configResult.getRuleEntryParsed('tsrx/core-rules-replacements', 'tsrx/no-unused-vars'),
      ).toStrictEqual({severity: 1, options: [{vars: 'local'}]});
    });

    it('lets `overrides` of `tsrx` config win over the inherited severities', async () => {
      const configResult = await computeEslintConfig({
        js: true,
        tsrx: {overrides: {'tsrx/no-unused-vars': 0}},
      });

      await expect(configResult.getRuleSeveritiesForFile('component.tsrx')).resolves.toMatchObject({
        'no-unused-vars': 0,
        'tsrx/no-unused-vars': 0,
      });
    });

    it('`tsrx/no-unused-vars` rule fires on an unused variable in a `.tsrx` file', async () => {
      const results = await testEslintConfig(
        {js: true, tsrx: true},
        FIXTURES.unusedVariable,
        import.meta.dirname,
      );

      expect(
        results.flatMap(({messages}) => messages.map(({ruleId, message}) => [ruleId, message])),
      ).toMatchInlineSnapshot(
        `[["tsrx/no-unused-vars", "'unused' is assigned a value but never used."]]`,
      );
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
      const FILES = ['src/**/*.tsrx'] as const;

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
      const IGNORES = ['**/fixtures/**'] as const;

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
