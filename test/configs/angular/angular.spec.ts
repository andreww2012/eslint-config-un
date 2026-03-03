describe('basic tests', async () => {
  const configResult = await computeEslintConfig('angular');

  it('loads `@angular-eslint` plugin', () => {
    expect(configResult.getLoadedPlugin('@angular-eslint')).toBeDefined();
  });

  it('loads `@angular-eslint/template` plugin', () => {
    expect(configResult.getLoadedPlugin('@angular-eslint/template')).toBeDefined();
  });

  it('creates `angular/general` and `angular/template` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('angular/general')).toBeDefined();

    expect(configResult.getConfigByUnPostfix('angular/template')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `angular/general` eslint config', async () => {
      const modeConfigResult = await computeEslintConfig({});

      expect(modeConfigResult.getConfigByUnPostfix('angular/general')).toBeUndefined();
    });

    it('does not create `angular/template` eslint config', async () => {
      const modeConfigResult = await computeEslintConfig({});

      expect(modeConfigResult.getConfigByUnPostfix('angular/template')).toBeUndefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `angular/general` eslint config (no `@angular/core` installed)', async () => {
      const modeConfigResult = await computeEslintConfig({}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('angular/general')).toBeUndefined();
    });

    it('creates `angular/general` eslint config if explicitly enabled', async () => {
      const modeConfigResult = await computeEslintConfig({angular: true}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('angular/general')).toBeDefined();
    });

    it('does not create `angular` eslint configs but prints a warning if explicitly disabled (already disabled by default)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const modeConfigResult = await computeEslintConfig({angular: false}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('angular/general')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`angular\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `angular` eslint configs (not a misc config)', async () => {
      const modeConfigResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(modeConfigResult.getConfigByUnPostfix('angular/general')).toBeUndefined();

      expect(modeConfigResult.getConfigByUnPostfix('angular/template')).toBeUndefined();
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('angular');

  it('enables `@angular-eslint/contextual-lifecycle` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('angular/general', '@angular-eslint/contextual-lifecycle'),
      ),
    ).toBe(2);
  });

  it('disables `@angular-eslint/sort-ngmodule-metadata-arrays` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry(
          'angular/general',
          '@angular-eslint/sort-ngmodule-metadata-arrays',
        ),
      ),
    ).toBe(0);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `angular/general` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({
        angular: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('angular/general')?.files).toStrictEqual(FILES);
    });

    it('disables `angular/general` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        angular: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('angular/general')).toBeUndefined();
    });

    it('has default `files` in `angular/general` eslint config', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(configResult.getConfigByUnPostfix('angular/general')?.files).toMatchInlineSnapshot(
        `["**/*.?([cm])[jt]s?(x)"]`,
      );
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `angular/general` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        angular: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('angular/general')?.ignores;

      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      expect(ignores).to.include.members(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `angular/general` eslint config', async () => {
    const configResult = await computeEslintConfig({
      angular: {
        overrides: {'@angular-eslint/contextual-lifecycle': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('angular/general', '@angular-eslint/contextual-lifecycle'),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('angular/general', 'no-console'),
      ),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `angular/general` eslint config', async () => {
      const configResult = await computeEslintConfig({
        angular: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('angular/general'), (ruleName) =>
          ruleName.startsWith('@angular-eslint/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `angular/general` eslint config', async () => {
      const configResult = await computeEslintConfig({
        angular: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('angular/general'), (ruleName) =>
          ruleName.startsWith('@angular-eslint/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `processInlineTemplates`', () => {
    it('sets inline template processor when `processInlineTemplates` is `true` (default)', async () => {
      const configResult = await computeEslintConfig('angular');
      const config = configResult.getConfigByUnPostfix('angular/general');

      expect(config?.processor).toBeDefined();
    });

    it('does not set inline template processor when `processInlineTemplates` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {processInlineTemplates: false},
      });
      const config = configResult.getConfigByUnPostfix('angular/general');

      expect(config?.processor).toBeUndefined();
    });
  });

  describe('option: `componentClassSuffixes`', () => {
    it('enables `component-class-suffix` rule with default suffix when option is not provided', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/component-class-suffix'),
      ).toMatchInlineSnapshot(`[2, {"suffixes": ["Component"]}]`);
    });

    it('disables `component-class-suffix` rule when `componentClassSuffixes` is empty array', async () => {
      const configResult = await computeEslintConfig({
        angular: {componentClassSuffixes: []},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/component-class-suffix'),
        ),
      ).toBe(0);
    });

    it('uses custom `componentClassSuffixes`', async () => {
      const configResult = await computeEslintConfig({
        angular: {componentClassSuffixes: ['Component', 'Page']},
      });

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/component-class-suffix'),
      ).toMatchInlineSnapshot(`[2, {"suffixes": ["Component", "Page"]}]`);
    });
  });

  describe('option: `componentSelector`', () => {
    it('enables `component-selector` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/component-selector'),
        ),
      ).toBe(2);
    });

    it('disables `component-selector` rule when `componentSelector` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {componentSelector: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/component-selector'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `componentStylesStyle`', () => {
    it('enables `consistent-component-styles` rule with `string` style by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/consistent-component-styles'),
      ).toMatchInlineSnapshot(`[2, "string"]`);
    });

    it('disables `consistent-component-styles` rule when `componentStylesStyle` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {componentStylesStyle: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/general',
            '@angular-eslint/consistent-component-styles',
          ),
        ),
      ).toBe(0);
    });
  });

  describe('option: `directiveClassSuffixes`', () => {
    it('enables `directive-class-suffix` rule with default suffix when option is not provided', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/directive-class-suffix'),
      ).toMatchInlineSnapshot(`[2, {"suffixes": ["Directive"]}]`);
    });

    it('disables `directive-class-suffix` rule when `directiveClassSuffixes` is empty array', async () => {
      const configResult = await computeEslintConfig({
        angular: {directiveClassSuffixes: []},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/directive-class-suffix'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `directiveSelector`', () => {
    it('enables `directive-selector` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/directive-selector'),
        ),
      ).toBe(2);
    });

    it('disables `directive-selector` rule when `directiveSelector` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {directiveSelector: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/directive-selector'),
        ),
      ).toBe(0);
    });
  });

  describe('option: `forbiddenMetadataProperties`', () => {
    it('enables `no-inputs-metadata-property` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/general',
            '@angular-eslint/no-inputs-metadata-property',
          ),
        ),
      ).toBe(2);
    });

    it('disables `no-inputs-metadata-property` rule when `forbiddenMetadataProperties.inputs` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {forbiddenMetadataProperties: {inputs: false}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'angular/general',
            '@angular-eslint/no-inputs-metadata-property',
          ),
        ),
      ).toBe(0);
    });
  });

  describe('option: `disallowedInputPrefixes`', () => {
    it('enables `no-input-prefix` rule with `on` prefix by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/no-input-prefix'),
      ).toMatchInlineSnapshot(`[2, {"prefixes": ["on"]}]`);
    });

    it('uses custom `disallowedInputPrefixes`', async () => {
      const configResult = await computeEslintConfig({
        angular: {disallowedInputPrefixes: ['handle', 'on']},
      });

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/no-input-prefix'),
      ).toMatchInlineSnapshot(`[2, {"prefixes": ["handle", "on"]}]`);
    });
  });

  describe('option: `disallowAttributeDecorator`', () => {
    it('disables `no-attribute-decorator` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/no-attribute-decorator'),
        ),
      ).toBe(0);
    });

    it('enables `no-attribute-decorator` rule when `disallowAttributeDecorator` is `true`', async () => {
      const configResult = await computeEslintConfig({
        angular: {disallowAttributeDecorator: true},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/no-attribute-decorator'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `disallowForwardRef`', () => {
    it('disables `no-forward-ref` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/no-forward-ref'),
        ),
      ).toBe(0);
    });

    it('enables `no-forward-ref` rule when `disallowForwardRef` is `true`', async () => {
      const configResult = await computeEslintConfig({
        angular: {disallowForwardRef: true},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/no-forward-ref'),
        ),
      ).toBe(2);
    });
  });

  describe('option: `pipePrefixes`', () => {
    it('enables `pipe-prefix` rule with empty prefixes by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/pipe-prefix'),
      ).toMatchInlineSnapshot(`[2]`);
    });

    it('uses custom `pipePrefixes`', async () => {
      const configResult = await computeEslintConfig({
        angular: {pipePrefixes: ['app']},
      });

      expect(
        configResult.getRuleEntry('angular/general', '@angular-eslint/pipe-prefix'),
      ).toMatchInlineSnapshot(`[2, {"prefixes": ["app"]}]`);
    });
  });

  describe('option: `preferStandaloneComponents`', () => {
    it('enables `prefer-standalone` rule when `preferStandaloneComponents` is `true`', async () => {
      const configResult = await computeEslintConfig({
        angular: {preferStandaloneComponents: true, angularVersion: 19},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/prefer-standalone'),
        ),
      ).toBe(2);
    });

    it('disables `prefer-standalone` rule when `preferStandaloneComponents` is `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {preferStandaloneComponents: false, angularVersion: 19},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('angular/general', '@angular-eslint/prefer-standalone'),
        ),
      ).toBe(0);
    });
  });
});
