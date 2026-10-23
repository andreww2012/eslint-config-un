import {GLOB_CSS} from '../../../src/constants';

const FIXTURES = {
  colorBeforeDisplay: 'color-before-display.css',
  differentVarFallbacks: 'different-var-fallbacks.css',
  fullViewportHeight: 'full-viewport-height.css',
  hexColorLiteral: 'hex-color-literal.css',
  nonstandardElementSelector: 'nonstandard-element-selector.css',
} as const;

describe('css: sub config `unicorn`', () => {
  describe('basic tests', () => {
    it('creates `css/unicorn` eslint config and loads `cssicorn` plugin by default', async () => {
      const configResult = await computeEslintConfig('css');

      const config = configResult.getConfigByUnPostfix('css/unicorn');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.css"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_CSS]);

      expect(configResult.getLoadedPlugin('cssicorn')).toBeDefined();
    });

    it('creates `css/unicorn` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({css: {configUnicorn: true}});

      expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeDefined();
    });

    it('does not create `css/unicorn` eslint config and does not load `cssicorn` plugin when set to `false`', async () => {
      const configResult = await computeEslintConfig({css: {configUnicorn: false}});

      expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
      expect(configResult.getLoadedPlugin('cssicorn')).toBeUndefined();
    });

    it('does not create `css/unicorn` eslint config when the parent config is disabled', async () => {
      const configResult = await computeEslintConfig({css: false});

      expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getRuleSeverities('css/unicorn')).toMatchObject({
        'cssicorn/prefer-explicit-viewport-units': 2,
        'cssicorn/prefer-short-hex-color': 0,
      });
    });

    it('`cssicorn/prefer-explicit-viewport-units` rule fires on a CSS file using `vh` units', async () => {
      const results = await testEslintConfig(
        'css',
        FIXTURES.fullViewportHeight,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.fullViewportHeight,
        'cssicorn/prefer-explicit-viewport-units',
      );

      expect(error?.message).toMatchInlineSnapshot('"Prefer `100dvh` over `100vh`."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('inherits `files` from the parent config', async () => {
        const FILES = ['src/**/*.css'] as const;

        const configResult = await computeEslintConfig({css: {files: FILES}});

        expect(configResult.getConfigByUnPostfix('css/unicorn')?.files).toStrictEqual(FILES);
      });

      it('uses user-provided `files` in `css/unicorn` eslint config', async () => {
        const FILES = ['styles/**/*.css'] as const;

        const configResult = await computeEslintConfig({
          css: {configUnicorn: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('css/unicorn')?.files).toStrictEqual(FILES);
      });

      it('disables `css/unicorn` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `css/unicorn` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'] as const;

        const configResult = await computeEslintConfig({
          css: {configUnicorn: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('css/unicorn')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `css/unicorn` eslint config', async () => {
      const configResult = await computeEslintConfig({
        css: {
          configUnicorn: {
            overrides: {'cssicorn/prefer-explicit-viewport-units': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('css/unicorn')).toMatchObject({
        'cssicorn/prefer-explicit-viewport-units': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `propertyOrder`', () => {
      it('enables `cssicorn/consistent-property-order` rule with `concentric-css` order by default', async () => {
        const configResult = await computeEslintConfig('css');

        expect(
          configResult.getRuleEntry('css/unicorn', 'cssicorn/consistent-property-order'),
        ).toMatchInlineSnapshot('[2, {"order": "concentric-css"}]');
      });

      it('enables `cssicorn/consistent-property-order` rule with `concentric-css` order when option is `true`', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {propertyOrder: true}},
        });

        expect(
          configResult.getRuleEntry('css/unicorn', 'cssicorn/consistent-property-order'),
        ).toMatchInlineSnapshot('[2, {"order": "concentric-css"}]');
      });

      it('disables `cssicorn/consistent-property-order` rule when option is `false`', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {propertyOrder: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('css/unicorn', 'cssicorn/consistent-property-order'),
        ).toBe(0);
      });

      it('enables `cssicorn/consistent-property-order` rule with `concentric-css` order when option is `concentric-css`', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {propertyOrder: 'concentric-css'}},
        });

        expect(
          configResult.getRuleEntry('css/unicorn', 'cssicorn/consistent-property-order'),
        ).toMatchInlineSnapshot('[2, {"order": "concentric-css"}]');
      });

      it('enables `cssicorn/consistent-property-order` rule with `alphabetical` order when option is `alphabetical`', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {propertyOrder: 'alphabetical'}},
        });

        expect(
          configResult.getRuleEntry('css/unicorn', 'cssicorn/consistent-property-order'),
        ).toMatchInlineSnapshot('[2, {"order": "alphabetical"}]');
      });

      it('passes a custom order to `cssicorn/consistent-property-order` rule when option is an array', async () => {
        const ORDER = ['display', 'position'] as const;

        const configResult = await computeEslintConfig({
          css: {configUnicorn: {propertyOrder: [...ORDER]}},
        });

        expect(
          configResult.getRuleEntryOptions('css/unicorn', 'cssicorn/consistent-property-order'),
        ).toStrictEqual([{order: ORDER}]);
      });

      it.each(['recess', 'clean'] as const)(
        'passes the property list of the stylelint config to `cssicorn/consistent-property-order` rule when option is `%s`',
        async (propertyOrder) => {
          const configResult = await computeEslintConfig({css: {configUnicorn: {propertyOrder}}});

          const ruleOptions = configResult.getRuleEntryOptions(
            'css/unicorn',
            'cssicorn/consistent-property-order',
          );

          expect(ruleOptions).toStrictEqual([
            {order: expect.arrayContaining(['composes', 'all', 'display', 'color']) as unknown},
          ]);
          expect(JSON.stringify(ruleOptions)).not.toContain('filter:');
        },
      );

      it('`cssicorn/consistent-property-order` rule reports `color` before `display` by default', async () => {
        const results = await testEslintConfig(
          'css',
          FIXTURES.colorBeforeDisplay,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.colorBeforeDisplay,
          'cssicorn/consistent-property-order',
        );

        expect(error?.message).toMatchInlineSnapshot(
          '"Expected property `display` before `color`."',
        );
      });

      it.each(['recess', 'clean'] as const)(
        '`cssicorn/consistent-property-order` rule reports `color` before `display` when option is `%s`',
        async (propertyOrder) => {
          const results = await testEslintConfig(
            {css: {configUnicorn: {propertyOrder}}},
            FIXTURES.colorBeforeDisplay,
            import.meta.dirname,
          );

          const error = findLintMessageFromLintResults(
            results,
            FIXTURES.colorBeforeDisplay,
            'cssicorn/consistent-property-order',
          );

          expect(error?.message).toMatchInlineSnapshot(
            '"Expected property `display` before `color`."',
          );
        },
      );

      it('`cssicorn/consistent-property-order` rule does not report `color` before `display` when option is `alphabetical`', async () => {
        const results = await testEslintConfig(
          {css: {configUnicorn: {propertyOrder: 'alphabetical'}}},
          FIXTURES.colorBeforeDisplay,
          import.meta.dirname,
        );

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.colorBeforeDisplay,
            'cssicorn/consistent-property-order',
          ),
        ).toBeUndefined();
      });
    });

    describe('option: `customProperties`', () => {
      const CUSTOM_PROPERTIES = {'--brand-color': '#6750a4'} as const;

      it('disables `cssicorn/consistent-custom-property-fallbacks` and `cssicorn/prefer-existing-custom-properties` rules by default', async () => {
        const configResult = await computeEslintConfig('css');

        expect(configResult.getRuleSeverities('css/unicorn')).toMatchObject({
          'cssicorn/consistent-custom-property-fallbacks': 0,
          'cssicorn/prefer-existing-custom-properties': 0,
        });
      });

      it('disables `cssicorn/consistent-custom-property-fallbacks` and `cssicorn/prefer-existing-custom-properties` rules when option is an empty object', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {customProperties: {}}},
        });

        expect(configResult.getRuleSeverities('css/unicorn')).toMatchObject({
          'cssicorn/consistent-custom-property-fallbacks': 0,
          'cssicorn/prefer-existing-custom-properties': 0,
        });
      });

      it('enables `cssicorn/prefer-existing-custom-properties` rule as a warning with the custom properties when option is set', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {customProperties: CUSTOM_PROPERTIES}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'css/unicorn',
            'cssicorn/prefer-existing-custom-properties',
          ),
        ).toBe(1);
        expect(
          configResult.getRuleEntryOptions(
            'css/unicorn',
            'cssicorn/prefer-existing-custom-properties',
          ),
        ).toStrictEqual([{customProperties: CUSTOM_PROPERTIES}]);
      });

      it('enables `cssicorn/consistent-custom-property-fallbacks` rule with the custom property names when option is set', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {customProperties: CUSTOM_PROPERTIES}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'css/unicorn',
            'cssicorn/consistent-custom-property-fallbacks',
          ),
        ).toBe(2);
        expect(
          configResult.getRuleEntryOptions(
            'css/unicorn',
            'cssicorn/consistent-custom-property-fallbacks',
          ),
        ).toStrictEqual([{customProperties: Object.keys(CUSTOM_PROPERTIES)}]);
      });

      it('`cssicorn/prefer-existing-custom-properties` rule reports a literal value of a custom property when option is set', async () => {
        const results = await testEslintConfig(
          {css: {configUnicorn: {customProperties: CUSTOM_PROPERTIES}}},
          FIXTURES.hexColorLiteral,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.hexColorLiteral,
          'cssicorn/prefer-existing-custom-properties',
        );

        expect(error?.message).toMatchInlineSnapshot(
          '"Prefer existing custom property `var(--brand-color)` over this literal value."',
        );
      });

      it('`cssicorn/consistent-custom-property-fallbacks` rule reports a different fallback of a custom property when option is set', async () => {
        const results = await testEslintConfig(
          {css: {configUnicorn: {customProperties: CUSTOM_PROPERTIES}}},
          FIXTURES.differentVarFallbacks,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.differentVarFallbacks,
          'cssicorn/consistent-custom-property-fallbacks',
        );

        expect(error?.message).toMatchInlineSnapshot(
          '"Fallback for custom property `--brand-color` differs from its first fallback."',
        );
      });
    });

    describe('option: `knownElementNames`', () => {
      it('does not pass `allow` option to `cssicorn/no-unknown-type-selectors` rule by default', async () => {
        const configResult = await computeEslintConfig('css');

        expect(
          configResult.getRuleEntry('css/unicorn', 'cssicorn/no-unknown-type-selectors'),
        ).toMatchInlineSnapshot('2');
      });

      it('does not pass `allow` option to `cssicorn/no-unknown-type-selectors` rule when option is an empty array', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {knownElementNames: []}},
        });

        expect(
          configResult.getRuleEntry('css/unicorn', 'cssicorn/no-unknown-type-selectors'),
        ).toMatchInlineSnapshot('2');
      });

      it('passes the names as `allow` option to `cssicorn/no-unknown-type-selectors` rule when option is set', async () => {
        const KNOWN_ELEMENT_NAMES = ['_', /^legacy-/] as const;

        const configResult = await computeEslintConfig({
          css: {configUnicorn: {knownElementNames: KNOWN_ELEMENT_NAMES}},
        });

        expect(
          configResult.getRuleEntryOptions('css/unicorn', 'cssicorn/no-unknown-type-selectors'),
        ).toStrictEqual([{allow: KNOWN_ELEMENT_NAMES}]);
      });

      it('`cssicorn/no-unknown-type-selectors` rule reports a nonstandard element name by default', async () => {
        const results = await testEslintConfig(
          'css',
          FIXTURES.nonstandardElementSelector,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.nonstandardElementSelector,
          'cssicorn/no-unknown-type-selectors',
        );

        expect(error?.message).toMatchInlineSnapshot(`"Unknown type selector 'widget'."`);
      });

      it('`cssicorn/no-unknown-type-selectors` rule does not report a nonstandard element name matching a regular expression from the option', async () => {
        const results = await testEslintConfig(
          {css: {configUnicorn: {knownElementNames: [/^widg/]}}},
          FIXTURES.nonstandardElementSelector,
          import.meta.dirname,
        );

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.nonstandardElementSelector,
            'cssicorn/no-unknown-type-selectors',
          ),
        ).toBeUndefined();
      });
    });
  });
});
