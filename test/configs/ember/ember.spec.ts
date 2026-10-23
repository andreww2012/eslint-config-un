const FIXTURES = {
  thisGetCall: 'this-get-call/test.js',
  templateReferencesLetVariable: 'template-references-let-variable/test.gjs',
  templateUsesEqKeyword: 'template-uses-eq-keyword/test.gjs',
  trackedBuiltInsImport: 'tracked-built-ins-import/test.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'ember-source': '5.0.0'});
});

describe('basic tests', () => {
  it('creates `ember` and `ember/glimmer-templates` eslint configs and loads `ember` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('ember');

    const config = configResult.getConfigByUnPostfix('ember');

    expect(config).toBeDefined();
    expect(configResult.getConfigByUnPostfix('ember/glimmer-templates')).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s", "**/*.{gjs,gts}"]');
    expect(
      configResult.getConfigByUnPostfix('ember/glimmer-templates')?.files,
    ).toMatchInlineSnapshot('["**/*.{gjs,gts}"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('ember')).toBeDefined();
  });

  it('does not create `ember` and `ember/glimmer-templates` eslint configs and does not load `ember` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({ember: false});

    expect(configResult.getConfigByUnPostfix('ember')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('ember/glimmer-templates')).toBeUndefined();
    expect(configResult.getLoadedPlugin('ember')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `ember` eslint config', async () => {
      await expectConfigState({}, 'ember', false);
    });

    it('creates `ember` eslint config if explicitly enabled', async () => {
      await expectConfigState('ember', 'ember', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `ember` eslint config when `ember-source` package is installed', async () => {
      await expectConfigState({}, 'ember', true, 'default');
    });

    it('creates `ember` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('ember', 'ember', ['ember', true], 'default');
    });

    it('does not create `ember` eslint config if explicitly disabled', async () => {
      await expectConfigState({ember: false}, 'ember', false, 'default');
    });

    describe('`ember-source` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `ember` eslint config', async () => {
        await expectConfigState({}, 'ember', false, 'default');
      });

      it('creates `ember` eslint config if explicitly enabled', async () => {
        await expectConfigState('ember', 'ember', true, 'default');
      });

      it('does not create `ember` eslint config and prints a warning if explicitly disabled (already disabled by default)', async () => {
        await expectConfigState({ember: false}, 'ember', ['ember', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `ember` eslint config when `ember-source` package is installed', async () => {
      await expectConfigState({}, 'ember', true, 'misc-enabled');
    });

    it('creates `ember` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({ember: true}, 'ember', ['ember', true], 'misc-enabled');
    });

    it('does not create `ember` eslint config if explicitly disabled', async () => {
      await expectConfigState({ember: false}, 'ember', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('ember');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('ember')).toMatchObject({
      'ember/no-get': 2,
      'ember/template-no-whitespace-within-word': 1,
      'ember/template-no-invalid-link-text': 0,
    });
  });

  it('`ember/no-get` rule fires on `this.get()` usage', async () => {
    const results = await testEslintConfig('ember', FIXTURES.thisGetCall, {
      searchFixturesRelativeToPath: import.meta.dirname,
    });

    const error = findLintMessageFromLintResults(results, FIXTURES.thisGetCall, 'ember/no-get');

    expect(error?.message).toMatchInlineSnapshot(
      `"Use ES5 getters (\`this.property\`) instead of Ember's \`get\` function"`,
    );
  });

  it('`ember/template-no-let-reference` rule fires on a `let` variable referenced inside `{{}}` in a `.gjs` file', async () => {
    const results = await testEslintConfig('ember', FIXTURES.templateReferencesLetVariable, {
      searchFixturesRelativeToPath: import.meta.dirname,
    });

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.templateReferencesLetVariable,
      'ember/template-no-let-reference',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"update-able variables are not supported in templates, reference a const variable"',
    );
  });

  it('enables `ember/template-no-deprecated` rule only in files with type information', async () => {
    const configResultWithTypeInfoSplit = await computeEslintConfig('ember', {
      internalOptions: {},
    });

    expect(configResultWithTypeInfoSplit.getRuleSeverities('ember')).not.toHaveProperty(
      'ember/template-no-deprecated',
    );
    expect(
      configResultWithTypeInfoSplit.getRuleSeverities('ember/@type-information'),
    ).toMatchObject({'ember/template-no-deprecated': 2});
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `ember` eslint config', async () => {
      const FILES = ['src/**/*.js'] as const;

      const configResult = await computeEslintConfig({ember: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('ember')?.files).toStrictEqual(FILES);
    });

    it('disables `ember` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({ember: {files: []}});

      expect(configResult.getConfigByUnPostfix('ember')).toBeUndefined();
    });

    it('does not disable `ember/tests` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({ember: {files: []}});

      expect(configResult.getConfigByUnPostfix('ember/tests')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `ember` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'] as const;

      const configResult = await computeEslintConfig({ember: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('ember')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `ember` and `ember/glimmer-templates` eslint configs', async () => {
    const configResult = await computeEslintConfig({
      ember: {overrides: {'ember/no-get': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('ember', 'ember/no-get')).toBe(0);
    expect(configResult.getRuleEntrySeverity('ember', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    const SETTINGS = {version: '7.3.0'} as const;

    it('does not set ember settings by default', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getConfigByUnPostfix('ember')?.settings?.['ember']).toBeUndefined();
    });

    it('sets ember settings when `settings` is provided', async () => {
      const configResult = await computeEslintConfig('ember', {
        un: {plugins: {ember: {settings: SETTINGS}}},
      });

      expect(configResult.getConfigByUnPostfix('ember')?.settings?.['ember']).toStrictEqual(
        SETTINGS,
      );
    });

    it('does not pass `emberSourceVersion` parser option to `parsing/ember` eslint config by default', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(
        configResult.getConfigByUnPostfix('parsing/ember')?.languageOptions,
      ).not.toHaveProperty(['parserOptions', 'emberSourceVersion']);
    });

    it('passes `version` as `emberSourceVersion` parser option to `parsing/ember` eslint config', async () => {
      const configResult = await computeEslintConfig('ember', {
        un: {plugins: {ember: {settings: SETTINGS}}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/ember')?.languageOptions).toMatchObject({
        parserOptions: {emberSourceVersion: SETTINGS.version},
      });
    });

    it('lets the ember parser treat Ember 7.1 template keywords as defined only when `version` is set to 7.1 or newer', async () => {
      const EMBER_CONFIG = {ember: {overridesAny: {'no-undef': 2}}} as const;

      const [resultsWithoutVersion, resultsWithVersion] = await Promise.all([
        testEslintConfig(EMBER_CONFIG, FIXTURES.templateUsesEqKeyword, {
          searchFixturesRelativeToPath: import.meta.dirname,
        }),
        testEslintConfig(EMBER_CONFIG, FIXTURES.templateUsesEqKeyword, {
          searchFixturesRelativeToPath: import.meta.dirname,
          un: {plugins: {ember: {settings: SETTINGS}}},
        }),
      ]);

      expect(
        findLintMessageFromLintResults(
          resultsWithoutVersion,
          FIXTURES.templateUsesEqKeyword,
          'no-undef',
        )?.message,
      ).toMatchInlineSnapshot(`"'eq' is not defined."`);
      expect(
        findLintMessageFromLintResults(
          resultsWithVersion,
          FIXTURES.templateUsesEqKeyword,
          'no-undef',
        ),
      ).toBeUndefined();
    });

    it('`ember/no-tracked-built-ins` rule fires on a `tracked-built-ins` import only when `version` is set to 6.8 or newer', async () => {
      const [resultsWithoutVersion, resultsWithVersion] = await Promise.all([
        testEslintConfig('ember', FIXTURES.trackedBuiltInsImport, {
          searchFixturesRelativeToPath: import.meta.dirname,
        }),
        testEslintConfig('ember', FIXTURES.trackedBuiltInsImport, {
          searchFixturesRelativeToPath: import.meta.dirname,
          un: {plugins: {ember: {settings: SETTINGS}}},
        }),
      ]);

      expect(
        findLintMessageFromLintResults(
          resultsWithoutVersion,
          FIXTURES.trackedBuiltInsImport,
          'ember/no-tracked-built-ins',
        ),
      ).toBeUndefined();
      expect(
        findLintMessageFromLintResults(
          resultsWithVersion,
          FIXTURES.trackedBuiltInsImport,
          'ember/no-tracked-built-ins',
        )?.message,
      ).toMatchInlineSnapshot(
        '"Use imports from `@ember/reactive/collections` instead of `tracked-built-ins`."',
      );
    });
  });

  describe('option: `enforceGlimmerComponents`', () => {
    it('enables `ember/no-classic-components` rule by default', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getRuleEntrySeverity('ember', 'ember/no-classic-components')).toBe(2);
    });

    it('disables `ember/no-classic-components` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({ember: {enforceGlimmerComponents: false}});

      expect(configResult.getRuleEntrySeverity('ember', 'ember/no-classic-components')).toBe(0);
    });
  });

  describe('option: `enforceGettersInComputedProperties`', () => {
    it('disables `ember/computed-property-getters` rule by default', async () => {
      const configResult = await computeEslintConfig('ember');

      expect(configResult.getRuleEntrySeverity('ember', 'ember/computed-property-getters')).toBe(0);
    });

    it('enables `ember/computed-property-getters` rule with options when provided', async () => {
      const configResult = await computeEslintConfig({
        ember: {enforceGettersInComputedProperties: 'always-with-setter'},
      });

      expect(
        configResult.getRuleEntry('ember', 'ember/computed-property-getters'),
      ).toMatchInlineSnapshot('[2, "always-with-setter"]');
    });
  });
});
