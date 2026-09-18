import {GLOB_VUE} from '../../../src/constants';

const FIXTURES = {
  stringLiteralInTemplateMustache: 'string-literal-in-template-mustache.vue',
  templateWithUnneededDisableComment: 'template-with-unneeded-disable-comment.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0'});
});

describe('basic tests', () => {
  it('creates `vue` eslint config and loads `vue` plugin by default', async () => {
    const configResult = await computeEslintConfig('vue');

    const config = configResult.getConfigByUnPostfix('vue');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.vue"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('vue')).toBeDefined();
  });

  it('does not create `vue` eslint config and does not load `vue` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({vue: false});

    expect(configResult.getConfigByUnPostfix('vue')).toBeUndefined();
    expect(configResult.getLoadedPlugin('vue')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `vue` eslint config', async () => {
      await expectConfigState({}, 'vue', false);
    });

    it('creates `vue` eslint config if explicitly enabled', async () => {
      await expectConfigState('vue', 'vue', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `vue` eslint config by default (vue is installed)', async () => {
      await expectConfigState({}, 'vue', true, 'default');
    });

    it('creates `vue` eslint config and prints a warning if explicitly enabled (vue is installed)', async () => {
      await expectConfigState('vue', 'vue', ['vue', true], 'default');
    });

    it('does not create `vue` eslint config if explicitly disabled', async () => {
      await expectConfigState({vue: false}, 'vue', false, 'default');
    });

    describe('`vue` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `vue` eslint config', async () => {
        await expectConfigState({}, 'vue', false, 'default');
      });

      it('creates `vue` eslint config if explicitly enabled', async () => {
        await expectConfigState({vue: {majorVersion: 3}}, 'vue', true, 'default');
      });

      it('does not create `vue` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({vue: false}, 'vue', ['vue', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `vue` eslint config (vue is installed)', async () => {
      await expectConfigState({}, 'vue', true, 'misc-enabled');
    });

    it('creates `vue` eslint config and prints a warning if explicitly enabled (vue is installed)', async () => {
      await expectConfigState('vue', 'vue', ['vue', true], 'misc-enabled');
    });

    it('does not create `vue` eslint config if explicitly disabled', async () => {
      await expectConfigState({vue: false}, 'vue', false, 'misc-enabled');
    });
  });

  describe('vue version detection', () => {
    beforeEach(() => {
      setInstalledPackages({});
    });

    it('does not throw if Vue version cannot be determined', async () => {
      await expect(
        testEslintConfig('vue', FIXTURES.stringLiteralInTemplateMustache, import.meta.dirname),
      ).resolves.not.toThrow();
    });

    it('prints a warning if Vue version cannot be determined', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await testEslintConfig('vue', FIXTURES.stringLiteralInTemplateMustache, import.meta.dirname);

      expect(String(stderrSpy.mock.calls[0]?.[0])).toStartWith(
        '[warn] [eslint-config-un] [vue config] Vue major version could not be detected or not supported and was also not explicitly passed',
      );
    });

    it('does not print a warning if Vue version can be determined (explicitly set)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await testEslintConfig(
        {vue: {majorVersion: 3}},
        FIXTURES.stringLiteralInTemplateMustache,
        import.meta.dirname,
      );

      expect(stderrSpy).toHaveBeenCalledTimes(0);
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('vue');

    expect(configResult.getRuleSeverities('vue')).toMatchObject({
      'vue/no-useless-mustaches': 2,
      'vue/block-lang': 0,
    });
  });

  it('`vue/no-useless-mustaches` rule fires on string literals in mustaches', async () => {
    const results = await testEslintConfig(
      {vue: {majorVersion: 3}},
      FIXTURES.stringLiteralInTemplateMustache,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.stringLiteralInTemplateMustache,
      'vue/no-useless-mustaches',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected mustache interpolation with a string literal value."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `vue` eslint config', async () => {
      const FILES = ['src/**/*.vue'];

      const configResult = await computeEslintConfig({vue: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('vue')?.files).toStrictEqual(FILES);
    });

    it('disables `vue` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({vue: {files: []}});

      expect(configResult.getConfigByUnPostfix('vue')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `vue` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({vue: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('vue')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `vue` eslint config', async () => {
    const configResult = await computeEslintConfig({
      vue: {
        overrides: {'vue/no-useless-mustaches': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('vue')).toMatchObject({
      'vue/no-useless-mustaches': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `majorVersion`', () => {
    it('disables Vue 2 only and enables Vue 3 only rules when installed vue version is 3', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleSeverities('vue')).toMatchObject({
        'vue/no-multiple-template-root': 0,
        'vue/no-deprecated-v-bind-sync': 2,
      });
    });

    it('disables Vue 2 only and enables Vue 3 only rules when set to `3`', async () => {
      const configResult = await computeEslintConfig({vue: {majorVersion: 3}});

      expect(configResult.getRuleSeverities('vue')).toMatchObject({
        'vue/no-multiple-template-root': 0,
        'vue/no-deprecated-v-bind-sync': 2,
      });
    });

    it('enables Vue 2 only rules and disables Vue 3 only rules when set to `2`', async () => {
      const configResult = await computeEslintConfig({vue: {majorVersion: 2}});

      expect(configResult.getRuleSeverities('vue')).toMatchObject({
        'vue/no-multiple-template-root': 2,
        'vue/no-deprecated-v-bind-sync': 0,
      });
    });

    it('disables Vue 2.5 deprecated attributes rules when vue < 2.5 is installed', async () => {
      setInstalledPackages({vue: '2.4.0'});

      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleSeverities('vue')).toMatchObject({
        'vue/no-deprecated-scope-attribute': 0,
        'vue/no-deprecated-slot-attribute': 0,
        'vue/no-deprecated-slot-scope-attribute': 0,
      });
    });
  });

  describe('option: `enforceApiStyle`', () => {
    it('disables `vue/component-api-style` rule by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntrySeverity('vue', 'vue/component-api-style')).toBe(0);
    });

    it('enables `vue/component-api-style` rule when set to `setup`', async () => {
      const configResult = await computeEslintConfig({vue: {enforceApiStyle: 'setup'}});

      expect(configResult.getRuleEntry('vue', 'vue/component-api-style')).toMatchInlineSnapshot(
        '[2, ["script-setup", "composition"]]',
      );
    });

    it('enables `vue/component-api-style` rule when set to `options`', async () => {
      const configResult = await computeEslintConfig({vue: {enforceApiStyle: 'options'}});

      expect(configResult.getRuleEntry('vue', 'vue/component-api-style')).toMatchInlineSnapshot(
        '[2, ["options", "composition"]]',
      );
    });
  });

  describe('option: `enforcePropsDeclarationStyle`', () => {
    it('uses `runtime` for `vue/define-props-declaration` rule by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(
        configResult.getRuleEntry('vue', 'vue/define-props-declaration'),
      ).toMatchInlineSnapshot('[2, "runtime"]');
    });

    it('uses `runtime` for `vue/define-props-declaration` rule when set to `runtime`', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(
        configResult.getRuleEntry('vue', 'vue/define-props-declaration'),
      ).toMatchInlineSnapshot('[2, "runtime"]');
    });

    it('uses `type-based` for `vue/define-props-declaration` rule when set to `type-based`', async () => {
      const configResult = await computeEslintConfig({
        vue: {enforcePropsDeclarationStyle: 'type-based'},
      });

      expect(
        configResult.getRuleEntry('vue', 'vue/define-props-declaration'),
      ).toMatchInlineSnapshot('[2, "type-based"]');
    });
  });

  describe('option: `enforcePropsDestructuring`', () => {
    const RULE_NAME = 'vue/define-props-destructuring';

    it('forbids destructuring in `vue/define-props-destructuring` rule by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntry('vue', RULE_NAME)).toMatchInlineSnapshot(
        '[2, {"destructure": "never"}]',
      );
    });

    it('forbids destructuring in `vue/define-props-destructuring` rule when option is `never`', async () => {
      const configResult = await computeEslintConfig({vue: {enforcePropsDestructuring: 'never'}});

      expect(configResult.getRuleEntry('vue', RULE_NAME)).toMatchInlineSnapshot(
        '[2, {"destructure": "never"}]',
      );
    });

    it('forbids destructuring in `vue/define-props-destructuring` rule when option is `true`', async () => {
      const configResult = await computeEslintConfig({vue: {enforcePropsDestructuring: true}});

      expect(configResult.getRuleEntry('vue', RULE_NAME)).toMatchInlineSnapshot(
        '[2, {"destructure": "never"}]',
      );
    });

    it('disables `vue/define-props-destructuring` rule when option is `false`', async () => {
      const configResult = await computeEslintConfig({vue: {enforcePropsDestructuring: false}});

      expect(configResult.getRuleEntry('vue', RULE_NAME)).toMatchInlineSnapshot('0');
    });

    it('requires destructuring in `vue/define-props-destructuring` rule when option is `always`', async () => {
      const configResult = await computeEslintConfig({vue: {enforcePropsDestructuring: 'always'}});

      expect(configResult.getRuleEntry('vue', RULE_NAME)).toMatchInlineSnapshot(
        '[2, {"destructure": "always"}]',
      );
    });

    it('requires destructuring only for assigned props in `vue/define-props-destructuring` rule when option is `onlyWhenAssigned`', async () => {
      const configResult = await computeEslintConfig({
        vue: {enforcePropsDestructuring: 'onlyWhenAssigned'},
      });

      expect(configResult.getRuleEntry('vue', RULE_NAME)).toMatchInlineSnapshot(
        '[2, {"destructure": "only-when-assigned"}]',
      );
    });
  });

  describe('option: `sfcBlockOrder`', () => {
    it('uses template-first block order by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntry('vue', 'vue/block-order')).toMatchInlineSnapshot(
        '[2, {"order": ["template", "script:not([setup])", "script[setup]", "style:not([scoped])", "style[scoped]"]}]',
      );
    });

    it('uses script-first block order when set to `script-first`', async () => {
      const configResult = await computeEslintConfig({vue: {sfcBlockOrder: 'script-first'}});

      expect(configResult.getRuleEntry('vue', 'vue/block-order')).toMatchInlineSnapshot(
        '[2, {"order": ["script:not([setup])", "script[setup]", "template", "style:not([scoped])", "style[scoped]"]}]',
      );
    });

    it('uses custom block order when set to array', async () => {
      const configResult = await computeEslintConfig({
        vue: {sfcBlockOrder: ['script[setup]', 'template', 'style']},
      });

      expect(configResult.getRuleEntry('vue', 'vue/block-order')).toMatchInlineSnapshot(
        '[2, {"order": ["script[setup]", "template", "style", "style:not([scoped])", "style[scoped]"]}]',
      );
    });
  });

  describe('option: `reportUnusedDisableDirectives`', () => {
    it('reports unused disable directives with the ESLint default severity when option is not set', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
        '[1, {"reportUnusedDisableDirectives": true}]',
      );
    });

    it.each([
      ['error', 2],
      [2, 2],
      ['warn', 1],
      [1, 1],
    ] as const)('reports with the `%s` severity when option is `%s`', async (value, severity) => {
      const configResult = await computeEslintConfig({
        vue: {reportUnusedDisableDirectives: value},
      });

      expect(configResult.getRuleEntrySeverity('vue', 'vue/comment-directive')).toBe(severity);
      expect(configResult.getRuleEntryOptions('vue', 'vue/comment-directive')).toStrictEqual([
        {reportUnusedDisableDirectives: true},
      ]);
    });

    it.each(['off', 0] as const)(
      'keeps the rule on but does not report when option is `%s`',
      async (value) => {
        const configResult = await computeEslintConfig({
          vue: {reportUnusedDisableDirectives: value},
        });

        expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
          '[2, {"reportUnusedDisableDirectives": false}]',
        );
      },
    );

    it('takes precedence over `linterOptionsReportUnusedDisableDirectives`', async () => {
      const configResult = await computeEslintConfig(
        {vue: {reportUnusedDisableDirectives: 'error'}},
        {un: {linterOptionsReportUnusedDisableDirectives: 'off'}},
      );

      expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
        '[2, {"reportUnusedDisableDirectives": true}]',
      );
    });

    describe('inherits the severity of `linterOptionsReportUnusedDisableDirectives`', () => {
      it.each([
        ['error', 2],
        [2, 2],
        ['warn', 1],
        [1, 1],
      ] as const)('when set to `%s`', async (value, severity) => {
        const configResult = await computeEslintConfig('vue', {
          un: {linterOptionsReportUnusedDisableDirectives: value},
        });

        expect(configResult.getRuleEntrySeverity('vue', 'vue/comment-directive')).toBe(severity);
      });

      it('keeps the rule on but stops reporting when set to `off`', async () => {
        const configResult = await computeEslintConfig('vue', {
          un: {linterOptionsReportUnusedDisableDirectives: 'off'},
        });

        expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
          '[2, {"reportUnusedDisableDirectives": false}]',
        );
      });

      it('only considers the entries applying to every file', async () => {
        const configResult = await computeEslintConfig('vue', {
          un: {
            linterOptionsReportUnusedDisableDirectives: [
              {value: 'off', files: ['**/*.ts']},
              {value: 'error'},
            ],
          },
        });

        expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
          '[2, {"reportUnusedDisableDirectives": true}]',
        );
      });

      it('falls back to the ESLint default when no entry applies to every file', async () => {
        const configResult = await computeEslintConfig('vue', {
          un: {linterOptionsReportUnusedDisableDirectives: {value: 'off', files: ['**/*.vue']}},
        });

        expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
          '[1, {"reportUnusedDisableDirectives": true}]',
        );
      });

      it('reports at the inherited severity when linting', async () => {
        const results = await testEslintConfig('vue', FIXTURES.templateWithUnneededDisableComment, {
          searchFixturesRelativeToPath: import.meta.dirname,
          un: {linterOptionsReportUnusedDisableDirectives: 'warn'},
        });

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.templateWithUnneededDisableComment,
            'vue/comment-directive',
          )?.severity,
        ).toBe(1);
      });

      it('reports with `error` when `noWarnings` is enabled', async () => {
        const configResult = await computeEslintConfig('vue', {un: {noWarnings: true}});

        expect(configResult.getRuleEntry('vue', 'vue/comment-directive')).toMatchInlineSnapshot(
          '[2, {"reportUnusedDisableDirectives": true}]',
        );
      });
    });
  });

  describe('option: `noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles`', () => {
    it('enables `vue/dot-notation` rule by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntrySeverity('vue', 'vue/dot-notation')).toBe(2);
    });

    it('enables `vue/dot-notation` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vue: {noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles: false},
      });

      expect(configResult.getRuleEntrySeverity('vue', 'vue/dot-notation')).toBe(2);
    });

    it('disables `vue/dot-notation` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        vue: {noPropertyAccessFromIndexSignatureSetInTsconfigForVueFiles: true},
      });

      expect(configResult.getRuleEntrySeverity('vue', 'vue/dot-notation')).toBe(0);
    });
  });

  describe('option: `preferUseTemplateRef`', () => {
    it('enables `vue/prefer-use-template-ref` rule when vue>=3.5 is installed', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntrySeverity('vue', 'vue/prefer-use-template-ref')).toBe(2);
    });

    it('disables `vue/prefer-use-template-ref` rule when vue<3.5 is installed', async () => {
      setInstalledPackages({vue: '3.4.0'});

      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntrySeverity('vue', 'vue/prefer-use-template-ref')).toBe(0);
    });

    it('enables `vue/prefer-use-template-ref` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({vue: {preferUseTemplateRef: true}});

      expect(configResult.getRuleEntrySeverity('vue', 'vue/prefer-use-template-ref')).toBe(2);
    });

    it('disables `vue/prefer-use-template-ref` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({vue: {preferUseTemplateRef: false}});

      expect(configResult.getRuleEntrySeverity('vue', 'vue/prefer-use-template-ref')).toBe(0);
    });
  });

  describe('option: `knownComponentNames`', () => {
    it('does not include extra patterns in `vue/no-undef-components` rule by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntry('vue', 'vue/no-undef-components')).toMatchInlineSnapshot(
        '[2, {"ignorePatterns": ["^router-link$", "^router-view$"]}]',
      );
    });

    it("adds specified components to `vue/no-undef-components`'s `ignorePatterns` when array syntax is used", async () => {
      const KNOWN_COMPONENTS = ['^MyComponent$'];

      const configResult = await computeEslintConfig({
        vue: {knownComponentNames: KNOWN_COMPONENTS},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-components')).toMatchObject([
        {ignorePatterns: expect.arrayContaining(KNOWN_COMPONENTS) as unknown},
      ]);
    });

    it('adds patterns with a truthy value and drops the default ones with a falsy value when object syntax is used', async () => {
      const configResult = await computeEslintConfig({
        vue: {knownComponentNames: {'^MyComponent$': true, '^router-link$': false}},
      });

      expect(
        configResult.getRuleEntryOptions('vue', 'vue/no-undef-components'),
      ).toMatchInlineSnapshot('[{"ignorePatterns": ["^router-view$", "^MyComponent$"]}]');
    });

    it('passes no options to `vue/no-undef-components` when every default pattern is dropped', async () => {
      const configResult = await computeEslintConfig({
        vue: {knownComponentNames: {'^router-link$': false, '^router-view$': false}},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-components')).toStrictEqual([]);
    });
  });

  describe('option: `knownDirectiveNames`', () => {
    it('passes no options to `vue/no-undef-directives` by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleEntry('vue', 'vue/no-undef-directives')).toMatchInlineSnapshot(
        '2',
      );
    });

    it("adds specified directives to `vue/no-undef-directives`'s `ignore` when array syntax is used", async () => {
      const KNOWN_DIRECTIVES = ['my-directive'];

      const configResult = await computeEslintConfig({
        vue: {knownDirectiveNames: KNOWN_DIRECTIVES},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-directives')).toStrictEqual([
        {ignore: KNOWN_DIRECTIVES},
      ]);
    });

    it('only adds directives with a truthy value when object syntax is used', async () => {
      const configResult = await computeEslintConfig({
        vue: {knownDirectiveNames: {'my-directive': true, 'other-directive': false}},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-directives')).toStrictEqual([
        {ignore: ['my-directive']},
      ]);
    });
  });

  describe('option: `doNotRequireComponentNamesToBeMultiWordForPatterns`', () => {
    it('does not include extra files in `vue/allow-single-word-component-names` eslint config by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(
        configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
      ).toMatchInlineSnapshot('["pages/**/*.vue", "views/**/*.vue"]');
    });

    it('adds specified patterns to `vue/allow-single-word-component-names` eslint config files when set', async () => {
      const PATTERN = '**/single-word-components/**/*.vue';

      const configResult = await computeEslintConfig({
        vue: {doNotRequireComponentNamesToBeMultiWordForPatterns: PATTERN},
      });

      expect(
        configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
      ).toIncludeAllMembers([PATTERN]);
    });
  });

  describe('option: `disallowedHtmlTags`', () => {
    it('uses default html tag restrictions by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(
        configResult.getRuleEntry('vue', 'vue/no-restricted-html-elements'),
      ).toMatchInlineSnapshot(
        '[2, "acronym", "big", "center", "content", "dir", "font", "frame", "frameset", "image", "marquee", "menuitem", "nobr", "noembed", "noframes", "param", "plaintext", "rb", "rtc", "shadow", "strike", "tt", "xmp", "applet", "bgsound", "blink", "isindex", "keygen", "multicol", "nextid", "spacer", "basefont", "listing", "command", "element"]',
      );
    });

    it('adds tags to or removes them from the disallowed list when set', async () => {
      const configResult = await computeEslintConfig({
        vue: {disallowedHtmlTags: {pre: true, center: true, marquee: false}},
      });

      const ruleOptions = configResult.getRuleEntryOptions(
        'vue',
        'vue/no-restricted-html-elements',
      );

      expect(ruleOptions).toIncludeAllMembers(['pre', 'center', 'big']);
      expect(ruleOptions).not.toIncludeAnyMembers(['marquee']);
    });
  });

  describe('option: `inheritBaseRuleSeverityAndOptionsForExtensionRules`', () => {
    it('inherits base rule severity for extension rules by default', async () => {
      const configResult = await computeEslintConfig({js: {overrides: {camelcase: 1}}, vue: true});

      expect(configResult.getRuleEntrySeverity('vue', 'vue/camelcase')).toBe(1);
    });

    it('inherits base rule severity for extension rules when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {camelcase: 1}},
        vue: {inheritBaseRuleSeverityAndOptionsForExtensionRules: true},
      });

      expect(configResult.getRuleEntrySeverity('vue', 'vue/camelcase')).toBe(1);
    });

    it('inherits a base rule severity specified as a string', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {camelcase: 'warn'}},
        vue: true,
      });

      expect(configResult.getRuleEntrySeverity('vue', 'vue/camelcase')).toBe(1);
    });

    it('does not inherit when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        js: {overrides: {camelcase: 1}},
        vue: {inheritBaseRuleSeverityAndOptionsForExtensionRules: false},
      });

      expect(configResult.getRuleEntrySeverity('vue', 'vue/camelcase')).toBe(2);
    });
  });

  describe('option: `processSfcBlocks`', () => {
    it('keeps the vue files parsed when set to `false`', async () => {
      const configResult = await computeEslintConfig({vue: {processSfcBlocks: false}});

      expect(configResult.getConfigByUnPostfix('parsing/vue')).toBeDefined();
    });

    it('keeps the vue files parsed when set to object', async () => {
      const configResult = await computeEslintConfig({
        vue: {processSfcBlocks: {blocks: {script: true}}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/vue')).toBeDefined();
    });
  });
});

describe('`prettier` package integration', () => {
  it("sets `void: 'never'` in `vue/html-self-closing` rule when `prettier` is not installed", async () => {
    const configResult = await computeEslintConfig('vue');

    expect(configResult.getRuleEntryOptions('vue', 'vue/html-self-closing')).toMatchObject([
      {html: {void: 'never'}},
    ]);
  });

  it("sets `void: 'any'` in `vue/html-self-closing` rule when `prettier` is installed", async () => {
    addInstalledPackages({prettier: '3.0.0'});

    const configResult = await computeEslintConfig('vue');

    expect(configResult.getRuleEntryOptions('vue', 'vue/html-self-closing')).toMatchObject([
      {html: {void: 'any'}},
    ]);
  });
});

describe('`vue` and `ts` configs relationship', () => {
  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if not explicitly specified', async () => {
    const configResult = await computeEslintConfig({vue: true, ts: true});

    expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).toIncludeAllMembers([GLOB_VUE]);
    expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files).toIncludeAllMembers([
      GLOB_VUE,
    ]);
  });

  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if explicitly specified', async () => {
    const FILES = ['src/**/*.vue'];

    const configResult = await computeEslintConfig({vue: {files: FILES}, ts: true});

    expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).toIncludeAllMembers(FILES);
    expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files).toIncludeAllMembers(
      FILES,
    );
  });

  it('empty `files` does not flow to `ts/{non-type-aware,type-aware}/setup` eslint configs', async () => {
    const configResult = await computeEslintConfig({vue: {files: []}, ts: true});

    expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).not.toIncludeAnyMembers([
      GLOB_VUE,
    ]);
    expect(
      configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files,
    ).not.toIncludeAnyMembers([GLOB_VUE]);
  });
});
