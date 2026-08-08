import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  emptyLifecycleMethod: 'empty-lifecycle-method.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({'@angular/core': '19.0.0'});
});

describe('basic tests', async () => {
  const MAIN_ESLINT_CONFIGS = ['angular/general', 'angular/template'];

  const configResult = await computeEslintConfig('angular');

  it('loads `angular` and `angular-template` plugins', () => {
    expect(configResult.getLoadedPlugin('angular')).toBeDefined();
    expect(configResult.getLoadedPlugin('angular-template')).toBeDefined();
  });

  it('creates `angular/{general,template}` eslint configs', () => {
    expect(configResult.getConfigsByUnPostfix(MAIN_ESLINT_CONFIGS)).toHaveLength(
      MAIN_ESLINT_CONFIGS.length,
    );
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `angular/{general,template}` eslint configs', async () => {
      await expectConfigState({}, MAIN_ESLINT_CONFIGS, false);
    });

    it('creates `angular/{general,template}` eslint configs if explicitly enabled', async () => {
      await expectConfigState('angular', MAIN_ESLINT_CONFIGS, true);
    });

    it('does not create `angular/{general,template}` eslint configs and prints a warning if explicitly disabled', async () => {
      await expectConfigState({angular: false}, MAIN_ESLINT_CONFIGS, ['angular', false]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`@angular/core` is installed', () => {
      it('creates `angular/{general,template}` eslint configs by default', async () => {
        await expectConfigState({}, MAIN_ESLINT_CONFIGS, true, 'default');
      });

      it('creates `angular/{general,template}` eslint configs and prints a warning if explicitly enabled', async () => {
        await expectConfigState('angular', MAIN_ESLINT_CONFIGS, ['angular', true], 'default');
      });

      it('does not create `angular` eslint configs if explicitly disabled', async () => {
        await expectConfigState({angular: false}, MAIN_ESLINT_CONFIGS, false, 'default');
      });
    });

    describe('`@angular/core` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `angular/{general,template}` eslint configs', async () => {
        await expectConfigState({}, MAIN_ESLINT_CONFIGS, false, 'default');
      });

      it('creates `angular/{general,template}` eslint configs if explicitly enabled', async () => {
        await expectConfigState('angular', MAIN_ESLINT_CONFIGS, true, 'default');
      });

      it('does not create `angular/{general,template}` eslint configs and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {angular: false},
          MAIN_ESLINT_CONFIGS,
          ['angular', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    describe('`@angular/core` is installed', () => {
      it('creates `angular/{general,template}` eslint configs', async () => {
        await expectConfigState({}, MAIN_ESLINT_CONFIGS, true, 'misc-enabled');
      });

      it('creates `angular/{general,template}` eslint configs and prints a warning if explicitly enabled', async () => {
        await expectConfigState('angular', MAIN_ESLINT_CONFIGS, ['angular', true], 'misc-enabled');
      });

      it('does not create `angular/{general,template}` eslint configs if explicitly disabled', async () => {
        await expectConfigState({angular: false}, MAIN_ESLINT_CONFIGS, false, 'misc-enabled');
      });
    });

    describe('`@angular/core` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `angular` eslint configs', async () => {
        await expectConfigState({}, MAIN_ESLINT_CONFIGS, false, 'misc-enabled');
      });

      it('does not create `angular` eslint configs and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {angular: false},
          MAIN_ESLINT_CONFIGS,
          ['angular', false],
          'misc-enabled',
        );
      });
    });
  });

  it('has default `files` in `angular/general` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('angular/general')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `angular/general` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('angular/general')?.ignores?.length).toBeGreaterThan(
      0,
    );
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('angular');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('angular/general')).toMatchObject({
      'angular/contextual-lifecycle': 2,
      'angular/no-developer-preview': 1,
      'angular/sort-ngmodule-metadata-arrays': 0,
    });
  });

  it('`angular/no-empty-lifecycle-method` rule fires on empty lifecycle method', async () => {
    const results = await testEslintConfig(
      {angular: true, ts: {configTypeAware: false}},
      FIXTURES.emptyLifecycleMethod,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.emptyLifecycleMethod,
      'angular/no-empty-lifecycle-method',
    );

    expect(error?.message).toMatchInlineSnapshot('"Lifecycle methods should not be empty"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `angular/general` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({angular: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('angular/general')?.files).toStrictEqual(FILES);
    });

    it('disables `angular/general` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({angular: {files: []}});

      expect(configResult.getConfigByUnPostfix('angular/general')).toBeUndefined();
    });

    it('does not disable `angular/template` sub-config when set to empty array', async () => {
      const configResult = await computeEslintConfig({angular: {files: []}});

      expect(configResult.getConfigByUnPostfix('angular/template')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `angular/general` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({angular: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('angular/general')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `angular/general` eslint config', async () => {
    const configResult = await computeEslintConfig({
      angular: {
        overrides: {'angular/contextual-lifecycle': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('angular/general', 'angular/contextual-lifecycle'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('angular/general', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `processInlineTemplates`', () => {
    it('sets inline template processor by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(configResult.getConfigByUnPostfix('angular/general')?.processor).toBeDefined();
    });

    it('sets inline template processor when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {processInlineTemplates: true}});

      expect(configResult.getConfigByUnPostfix('angular/general')?.processor).toBeDefined();
    });

    it('does not set inline template processor when set to `false`', async () => {
      const configResult = await computeEslintConfig({angular: {processInlineTemplates: false}});

      expect(configResult.getConfigByUnPostfix('angular/general')?.processor).toBeUndefined();
    });
  });

  describe('option: `componentClassSuffixes`', () => {
    it('enables `angular/component-class-suffix` rule with default suffix by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', 'angular/component-class-suffix'),
      ).toMatchInlineSnapshot('[2, {"suffixes": ["Component"]}]');
    });

    it('disables `angular/component-class-suffix` rule when set to empty array', async () => {
      const configResult = await computeEslintConfig({angular: {componentClassSuffixes: []}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/component-class-suffix'),
      ).toBe(0);
    });

    it('uses custom `componentClassSuffixes` on `angular/component-class-suffix` rule', async () => {
      const SUFFIXES = ['Component', 'Page'];

      const configResult = await computeEslintConfig({angular: {componentClassSuffixes: SUFFIXES}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/component-class-suffix'),
      ).toStrictEqual([{suffixes: SUFFIXES}]);
    });
  });

  describe('option: `componentSelector`', () => {
    it('enables `angular/component-selector` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/component-selector'),
      ).toBe(2);
    });

    it('enables `angular/component-selector` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {componentSelector: true}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/component-selector'),
      ).toBe(2);
    });

    it('disables `angular/component-selector` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({angular: {componentSelector: false}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/component-selector'),
      ).toBe(0);
    });

    it('merges object options passed to `componentSelector` with defaults on `angular/component-selector` rule', async () => {
      const OPTIONS = {prefix: ['app']};

      const configResult = await computeEslintConfig({angular: {componentSelector: OPTIONS}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/component-selector'),
      ).toStrictEqual([{type: ['element'], style: 'kebab-case', ...OPTIONS}]);
    });

    it('uses raw array options on `angular/component-selector` rule when `componentSelector` is array', async () => {
      const SELECTOR = [
        {type: 'element' as const, prefix: ['app'], style: 'kebab-case' as const},
      ] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({angular: {componentSelector: SELECTOR}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/component-selector'),
      ).toStrictEqual([SELECTOR]);
    });
  });

  describe('option: `componentStylesStyle`', () => {
    it('enables `angular/consistent-component-styles` rule with `string` by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', 'angular/consistent-component-styles'),
      ).toMatchInlineSnapshot('[2, "string"]');
    });

    it('uses custom option passed to `componentStylesStyle` on `angular/consistent-component-styles` rule', async () => {
      const OPTIONS = 'array';

      const configResult = await computeEslintConfig({angular: {componentStylesStyle: OPTIONS}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/consistent-component-styles'),
      ).toStrictEqual([OPTIONS]);
    });

    it('enables `angular/consistent-component-styles` rule with default options when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {componentStylesStyle: true}});

      expect(
        configResult.getRuleEntry('angular/general', 'angular/consistent-component-styles'),
      ).toMatchInlineSnapshot('[2, "string"]');
    });

    it('disables `angular/consistent-component-styles` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({angular: {componentStylesStyle: false}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/consistent-component-styles'),
      ).toBe(0);
    });
  });

  describe('option: `directiveClassSuffixes`', () => {
    it('enables `angular/directive-class-suffix` rule with default suffix by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', 'angular/directive-class-suffix'),
      ).toMatchInlineSnapshot('[2, {"suffixes": ["Directive"]}]');
    });

    it('disables `angular/directive-class-suffix` rule when set to empty array', async () => {
      const configResult = await computeEslintConfig({angular: {directiveClassSuffixes: []}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/directive-class-suffix'),
      ).toBe(0);
    });

    it('uses the suffixes list passed to `directiveClassSuffixes` on `angular/directive-class-suffix` rule', async () => {
      const SUFFIXES = ['Directive', 'Component'];

      const configResult = await computeEslintConfig({angular: {directiveClassSuffixes: SUFFIXES}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/directive-class-suffix'),
      ).toStrictEqual([{suffixes: SUFFIXES}]);
    });
  });

  describe('option: `directiveSelector`', () => {
    it('enables `angular/directive-selector` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/directive-selector'),
      ).toMatchInlineSnapshot('[{"style": "camelCase", "type": ["attribute"]}]');
    });

    it('uses default options for `angular/directive-selector` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {directiveSelector: true}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/directive-selector'),
      ).toMatchInlineSnapshot('[{"style": "camelCase", "type": ["attribute"]}]');
    });

    it('merges options passed to `directiveSelector` with default ones and sets them on `angular/directive-selector` rule', async () => {
      const OPTIONS = {type: ['element' as const], prefix: 'foo'};

      const configResult = await computeEslintConfig({angular: {directiveSelector: OPTIONS}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/directive-selector'),
      ).toStrictEqual([{style: 'camelCase', ...OPTIONS}]);
    });

    it('disables `angular/directive-selector` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({angular: {directiveSelector: false}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/directive-selector'),
      ).toBe(0);
    });

    it('uses raw array options on `angular/directive-selector` rule when `directiveSelector` is array', async () => {
      const SELECTOR = [
        {type: 'attribute' as const, prefix: ['app'], style: 'camelCase' as const},
      ] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({angular: {directiveSelector: SELECTOR}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/directive-selector'),
      ).toStrictEqual([SELECTOR]);
    });
  });

  describe('option: `forbiddenMetadataProperties`', () => {
    describe('host', () => {
      it('disables `angular/no-host-metadata-property` rule by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity('angular/general', 'angular/no-host-metadata-property'),
        ).toBe(0);
      });

      // TODO test when the loaded plugin includes the rule
      it('does not enable `angular/no-host-metadata-property` rule even when `forbiddenMetadataProperties.host` is `true`, but plugin does not include this rule (default)', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {host: true}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/general', 'angular/no-host-metadata-property'),
        ).toBe(0);
      });

      it('disables `angular/no-host-metadata-property` rule when `forbiddenMetadataProperties.host` is `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {host: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/general', 'angular/no-host-metadata-property'),
        ).toBe(0);
      });
    });

    describe('inputs', () => {
      it('enables `angular/no-inputs-metadata-property` rule by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-inputs-metadata-property',
          ),
        ).toBe(2);
      });

      it('enables `angular/no-inputs-metadata-property` rule when `forbiddenMetadataProperties.inputs` is `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {inputs: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-inputs-metadata-property',
          ),
        ).toBe(2);
      });

      it('disables `angular/no-inputs-metadata-property` rule when `forbiddenMetadataProperties.inputs` is `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {inputs: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-inputs-metadata-property',
          ),
        ).toBe(0);
      });
    });

    describe('outputs', () => {
      it('enables `angular/no-outputs-metadata-property` rule by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-outputs-metadata-property',
          ),
        ).toBe(2);
      });

      it('enables `angular/no-outputs-metadata-property` rule when `forbiddenMetadataProperties.outputs` is `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {outputs: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-outputs-metadata-property',
          ),
        ).toBe(2);
      });

      it('disables `angular/no-outputs-metadata-property` rule when `forbiddenMetadataProperties.outputs` is `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {outputs: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-outputs-metadata-property',
          ),
        ).toBe(0);
      });
    });

    describe('queries', () => {
      it('enables `angular/no-queries-metadata-property` rule by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-queries-metadata-property',
          ),
        ).toBe(2);
      });

      it('enables `angular/no-queries-metadata-property` rule when `forbiddenMetadataProperties.queries` is `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {queries: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-queries-metadata-property',
          ),
        ).toBe(2);
      });

      it('disables `angular/no-queries-metadata-property` rule when `forbiddenMetadataProperties.queries` is `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {forbiddenMetadataProperties: {queries: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/general',
            'angular/no-queries-metadata-property',
          ),
        ).toBe(0);
      });
    });
  });

  describe('option: `disallowedInputPrefixes`', () => {
    it('enables `angular/no-input-prefix` rule with `on` prefix by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', 'angular/no-input-prefix'),
      ).toMatchInlineSnapshot('[2, {"prefixes": ["on"]}]');
    });

    it('uses custom `disallowedInputPrefixes`', async () => {
      const PREFIXES = ['handle', 'on'];

      const configResult = await computeEslintConfig({
        angular: {disallowedInputPrefixes: PREFIXES},
      });

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/no-input-prefix'),
      ).toStrictEqual([{prefixes: PREFIXES}]);
    });
  });

  describe('option: `disallowAttributeDecorator`', () => {
    it('disables `angular/no-attribute-decorator` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/no-attribute-decorator'),
      ).toBe(0);
    });

    it('enables `angular/no-attribute-decorator` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {disallowAttributeDecorator: true}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/no-attribute-decorator'),
      ).toBe(2);
    });

    it('disables `angular/no-attribute-decorator` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {disallowAttributeDecorator: false},
      });

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/no-attribute-decorator'),
      ).toBe(0);
    });
  });

  describe('option: `disallowForwardRef`', () => {
    it('disables `angular/no-forward-ref` rule by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(configResult.getRuleEntrySeverity('angular/general', 'angular/no-forward-ref')).toBe(
        0,
      );
    });

    it('enables `angular/no-forward-ref` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {disallowForwardRef: true}});

      expect(configResult.getRuleEntrySeverity('angular/general', 'angular/no-forward-ref')).toBe(
        2,
      );
    });

    it('disables `angular/no-forward-ref` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({angular: {disallowForwardRef: false}});

      expect(configResult.getRuleEntrySeverity('angular/general', 'angular/no-forward-ref')).toBe(
        0,
      );
    });
  });

  describe('option: `pipePrefixes`', () => {
    it('enables `angular/pipe-prefix` rule with empty prefixes by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntry('angular/general', 'angular/pipe-prefix'),
      ).toMatchInlineSnapshot('2');
    });

    it('uses custom `pipePrefixes`', async () => {
      const PREFIXES = ['app'];

      const configResult = await computeEslintConfig({angular: {pipePrefixes: PREFIXES}});

      expect(
        configResult.getRuleEntryOptions('angular/general', 'angular/pipe-prefix'),
      ).toStrictEqual([{prefixes: PREFIXES}]);
    });
  });

  describe('option: `preferStandaloneComponents`', () => {
    it('enables `angular/prefer-standalone` rule by default (Angular 19, default `true`)', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/prefer-standalone'),
      ).toBe(2);
    });

    it('enables `angular/prefer-standalone` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({angular: {preferStandaloneComponents: true}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/prefer-standalone'),
      ).toBe(2);
    });

    it('disables `angular/prefer-standalone` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {preferStandaloneComponents: false},
      });

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/prefer-standalone'),
      ).toBe(0);
    });

    it('enables deprecated `angular/prefer-standalone-component` rule for Angular <17 when set to `true` (unless rule is not in the installed plugin)', async () => {
      const configResult = await computeEslintConfig({
        angular: {angularVersion: 16, preferStandaloneComponents: true},
      });

      // Rule was removed from plugin >=18, so severity falls back to 0 if rule is not found
      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/prefer-standalone-component'),
      ).toBe(0);
    });
  });

  describe('option: `angularVersion`', () => {
    it('auto-detects angular version from `@angular/core` by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/prefer-signal-model'),
      ).toBe(2);
    });

    it('uses specified `angularVersion` when set to `18`', async () => {
      const configResult = await computeEslintConfig({angular: {angularVersion: 18}});

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/prefer-signal-model'),
      ).toBe(0);
    });
  });

  describe('`angular-eslint` plugin version compatibility', () => {
    it('warns and still builds config when installed `angular` plugin major version does not match the detected Angular version', async () => {
      addInstalledPackages({'@angular-eslint/eslint-plugin': '18.0.0'});

      // @angular/core is '19.0.0' (from beforeEach) → angularVersion = 19, plugin major = 18 → mismatch
      const configResult = await computeEslintConfig('angular');

      expect(
        configResult.getRuleEntrySeverity('angular/general', 'angular/contextual-lifecycle'),
      ).toBe(2);
    });
  });
});
