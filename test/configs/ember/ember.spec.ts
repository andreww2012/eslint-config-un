const FIXTURES = {
  thisGetCall: 'this-get-call/test.js',
  templateReferencesLetVariable: 'template-references-let-variable/test.gjs',
} as const;

beforeEach(() => {
  addInstalledPackages({'ember-source': '5.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('ember');

  it('loads `ember` plugin if used', () => {
    expect(configResult.getLoadedPlugin('ember')).toBeDefined();
  });

  it('creates `ember` and `ember/glimmer-templates` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('ember')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('ember/glimmer-templates')).toBeDefined();
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

  it('has default `files` in `ember` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('ember')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]s", "**/*.{gjs,gts}"]',
    );
  });

  it('has default `files` in `ember/glimmer-templates` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('ember/glimmer-templates')?.files,
    ).toMatchInlineSnapshot('["**/*.{gjs,gts}"]');
  });

  it('has default `ignores` in `ember` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('ember')?.ignores?.length).toBeGreaterThan(0);
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
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `ember` eslint config', async () => {
      const FILES = ['src/**/*.js'];

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
      const IGNORES = ['**/fixtures/**'];

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

    it('enables `ember/computed-property-getters` rule with options when set to provided', async () => {
      const configResult = await computeEslintConfig({
        ember: {enforceGettersInComputedProperties: 'always-with-setter'},
      });

      expect(
        configResult.getRuleEntry('ember', 'ember/computed-property-getters'),
      ).toMatchInlineSnapshot('[2, "always-with-setter"]');
    });
  });
});
