const FIXTURES = {
  dupeStyleProperties: 'dupe-style-properties.jsx',
  noDupeStyleProperties: 'no-dupe-style-properties.jsx',
  hexColorShort: 'hex-color-short.jsx',
  hexColorLong: 'hex-color-long.jsx',
  namedColor: 'named-color.jsx',
  hexColorWithNamedEquivalent: 'hex-color-with-named-equivalent.jsx',
  namedColorsMultipleProperties: 'named-colors-multiple-properties.jsx',
  hexColorsMultipleProperties: 'hex-colors-multiple-properties.jsx',
  leadingZero: 'leading-zero.jsx',
  noLeadingZero: 'no-leading-zero.jsx',
  propertyCamelCase: 'property-camelcase.jsx',
  propertyKebabCase: 'property-kebabcase.jsx',
  cssAttributeDupe: 'css-attribute-dupe.jsx',
  cssAttributeNoDupe: 'css-attribute-no-dupe.jsx',
  defineFunctionDupe: 'define-function-dupe.js',
  defineFunctionNoDupe: 'define-function-no-dupe.js',
} as const;

const JSX_EXTRA_CONFIGS: Parameters<typeof testEslintConfig>[2] = {
  un: {
    // If `.jsx` file is not matched by any other config, it'll be ignored and there is no way to avoid this behavior
    extraConfigs: [{files: ['**/*.jsx']}],
  },
  searchFixturesRelativeToPath: import.meta.dirname,
};

describe('basic tests', () => {
  it('creates `css-in-js` eslint config if set to `true`', async () => {
    const configResult = await computeEslintConfig('cssInJs');

    const config = configResult.getConfigByUnPostfix('css-in-js');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);
  });

  it('does not create `css-in-js` eslint config if set to `false`', async () => {
    const configResult = await computeEslintConfig({cssInJs: false});

    expect(configResult.getConfigByUnPostfix('css-in-js')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `css-in-js` eslint config', async () => {
      await expectConfigState({}, 'css-in-js', false);
    });

    it('creates `css-in-js` eslint config if explicitly enabled', async () => {
      await expectConfigState('cssInJs', 'css-in-js', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `css-in-js` eslint config', async () => {
      await expectConfigState({}, 'css-in-js', true, 'default');
    });

    it('creates `css-in-js` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('cssInJs', 'css-in-js', ['cssInJs', true], 'default');
    });

    it('does not create `css-in-js` eslint config if explicitly disabled', async () => {
      await expectConfigState({cssInJs: false}, 'css-in-js', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `css-in-js` eslint config', async () => {
      await expectConfigState({}, 'css-in-js', true, 'misc-enabled');
    });

    it('creates `css-in-js` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('cssInJs', 'css-in-js', ['cssInJs', true], 'misc-enabled');
    });

    it('does not create `css-in-js` eslint config if explicitly disabled', async () => {
      await expectConfigState({cssInJs: false}, 'css-in-js', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('cssInJs');

    expect(configResult.getRuleSeverities('css-in-js')).toMatchObject({
      'css-in-js/no-dupe-properties': 2,
      'css-in-js/color-hex-style': 2,
    });
  });

  it('triggers `css-in-js/no-dupe-properties` for duplicate style properties', async () => {
    const results = await testEslintConfig(
      'cssInJs',
      FIXTURES.dupeStyleProperties,
      JSX_EXTRA_CONFIGS,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.dupeStyleProperties,
      'css-in-js/no-dupe-properties',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Duplicate property 'background-color' and 'backgroundColor'."`,
    );
  });

  it('does not trigger `css-in-js/no-dupe-properties` for unique style properties', async () => {
    const results = await testEslintConfig(
      'cssInJs',
      FIXTURES.noDupeStyleProperties,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.noDupeStyleProperties,
      'css-in-js/no-dupe-properties',
    );

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `css-in-js` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({cssInJs: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('css-in-js')?.files).toStrictEqual(FILES);
    });

    it('disables `css-in-js` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({cssInJs: {files: []}});

      expect(configResult.getConfigByUnPostfix('css-in-js')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `css-in-js` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({cssInJs: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('css-in-js')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `css-in-js` eslint config', async () => {
    const configResult = await computeEslintConfig({
      cssInJs: {
        overrides: {'css-in-js/no-dupe-properties': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('css-in-js', 'css-in-js/no-dupe-properties')).toBe(0);
    expect(configResult.getRuleEntrySeverity('css-in-js', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    describe('`attributes`', () => {
      it('does not trigger for duplicate properties in custom attribute by default', async () => {
        const results = await testEslintConfig(
          'cssInJs',
          FIXTURES.cssAttributeDupe,
          JSX_EXTRA_CONFIGS,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.cssAttributeDupe,
          'css-in-js/no-dupe-properties',
        );

        expect(error).toBeUndefined();
      });

      it('triggers for duplicate properties in custom attribute when `attributes` includes it', async () => {
        const results = await testEslintConfig(
          {cssInJs: {settings: {attributes: ['css']}}},
          FIXTURES.cssAttributeDupe,
          JSX_EXTRA_CONFIGS,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.cssAttributeDupe,
          'css-in-js/no-dupe-properties',
        );

        expect(error?.message).toMatchInlineSnapshot(
          `"Duplicate property 'background-color' and 'backgroundColor'."`,
        );
      });

      it('does not trigger for unique properties in custom attribute when `attributes` includes it', async () => {
        const results = await testEslintConfig(
          {cssInJs: {settings: {attributes: ['css']}}},
          FIXTURES.cssAttributeNoDupe,
          JSX_EXTRA_CONFIGS,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.cssAttributeNoDupe,
          'css-in-js/no-dupe-properties',
        );

        expect(error).toBeUndefined();
      });
    });

    describe('`defineFunctions`', () => {
      it('does not trigger for duplicate properties in custom function by default', async () => {
        const results = await testEslintConfig(
          'cssInJs',
          FIXTURES.defineFunctionDupe,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.defineFunctionDupe,
          'css-in-js/no-dupe-properties',
        );

        expect(error).toBeUndefined();
      });

      it('triggers for duplicate properties in custom function when `defineFunctions` includes it', async () => {
        const results = await testEslintConfig(
          {cssInJs: {settings: {defineFunctions: {'my-module': ['myStyleFn']}}}},
          FIXTURES.defineFunctionDupe,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.defineFunctionDupe,
          'css-in-js/no-dupe-properties',
        );

        expect(error?.message).toMatchInlineSnapshot(
          `"Duplicate property 'background-color' and 'backgroundColor'."`,
        );
      });

      it('does not trigger for unique properties in custom function when `defineFunctions` includes it', async () => {
        const results = await testEslintConfig(
          {cssInJs: {settings: {defineFunctions: {'my-module': ['myStyleFn']}}}},
          FIXTURES.defineFunctionNoDupe,
          import.meta.dirname,
        );

        const error = findLintMessageFromLintResults(
          results,
          FIXTURES.defineFunctionNoDupe,
          'css-in-js/no-dupe-properties',
        );

        expect(error).toBeUndefined();
      });
    });
  });

  describe('option: `hexColorsStyle`', () => {
    it('triggers for short hex color by default', async () => {
      const results = await testEslintConfig('cssInJs', FIXTURES.hexColorShort, JSX_EXTRA_CONFIGS);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorShort,
        'css-in-js/color-hex-style',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected '#abc' to be '#aabbcc'."`);
    });

    it('does not trigger for long hex color by default', async () => {
      const results = await testEslintConfig('cssInJs', FIXTURES.hexColorLong, JSX_EXTRA_CONFIGS);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorLong,
        'css-in-js/color-hex-style',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for long hex color when set to `short`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {hexColorsStyle: 'short'}},
        FIXTURES.hexColorLong,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorLong,
        'css-in-js/color-hex-style',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected '#aabbcc' to be '#abc'."`);
    });

    it('does not trigger for short hex color when set to `short`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {hexColorsStyle: 'short'}},
        FIXTURES.hexColorShort,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorShort,
        'css-in-js/color-hex-style',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for short hex color when set to `long`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {hexColorsStyle: 'long'}},
        FIXTURES.hexColorShort,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorShort,
        'css-in-js/color-hex-style',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected '#abc' to be '#aabbcc'."`);
    });

    it('does not trigger for long hex color when set to `long`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {hexColorsStyle: 'long'}},
        FIXTURES.hexColorLong,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorLong,
        'css-in-js/color-hex-style',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('option: `preferNamedColors`', () => {
    it('triggers for named color by default', async () => {
      const results = await testEslintConfig('cssInJs', FIXTURES.namedColor, JSX_EXTRA_CONFIGS);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.namedColor,
        'css-in-js/named-color',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected 'red' to be '#f00'."`);
    });

    it('does not trigger for hex color by default', async () => {
      const results = await testEslintConfig(
        'cssInJs',
        FIXTURES.hexColorWithNamedEquivalent,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorWithNamedEquivalent,
        'css-in-js/named-color',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for hex color when set to `true`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {preferNamedColors: true}},
        FIXTURES.hexColorWithNamedEquivalent,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorWithNamedEquivalent,
        'css-in-js/named-color',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected '#ff0000' to be 'red'."`);
    });

    it('does not trigger for named color when set to `true`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {preferNamedColors: true}},
        FIXTURES.namedColor,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.namedColor,
        'css-in-js/named-color',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for named color when set to `false`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {preferNamedColors: false}},
        FIXTURES.namedColor,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.namedColor,
        'css-in-js/named-color',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Expected 'red' to be '#f00'."`);
    });

    it('does not trigger for hex color when set to `false`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {preferNamedColors: false}},
        FIXTURES.hexColorWithNamedEquivalent,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorWithNamedEquivalent,
        'css-in-js/named-color',
      );

      expect(error).toBeUndefined();
    });

    it('does not trigger for named color on ignored property when using object form', async () => {
      const results = await testEslintConfig(
        {cssInJs: {preferNamedColors: {flag: false, ignoreProperties: ['color']}}},
        FIXTURES.namedColorsMultipleProperties,
        JSX_EXTRA_CONFIGS,
      );

      const errors = findLintMessageFromLintResults(
        results,
        FIXTURES.namedColorsMultipleProperties,
        'css-in-js/named-color',
        {all: true},
      );

      expect(errors).toHaveLength(1);
      expect(errors[0]?.message).toMatchInlineSnapshot(`"Expected 'blue' to be '#00f'."`);
    });

    it('does not trigger for hex color on ignored property when using object form with flag true', async () => {
      const results = await testEslintConfig(
        {cssInJs: {preferNamedColors: {flag: true, ignoreProperties: ['color']}}},
        FIXTURES.hexColorsMultipleProperties,
        JSX_EXTRA_CONFIGS,
      );

      const errors = findLintMessageFromLintResults(
        results,
        FIXTURES.hexColorsMultipleProperties,
        'css-in-js/named-color',
        {all: true},
      );

      expect(errors).toHaveLength(1);
      expect(errors[0]?.message).toMatchInlineSnapshot(`"Expected '#0000ff' to be 'blue'."`);
    });
  });

  describe('option: `avoidLeadingZero`', () => {
    it('triggers for missing leading zero by default', async () => {
      const results = await testEslintConfig('cssInJs', FIXTURES.noLeadingZero, JSX_EXTRA_CONFIGS);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.noLeadingZero,
        'css-in-js/number-leading-zero',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected a leading zero."');
    });

    it('does not trigger for leading zero by default', async () => {
      const results = await testEslintConfig('cssInJs', FIXTURES.leadingZero, JSX_EXTRA_CONFIGS);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.leadingZero,
        'css-in-js/number-leading-zero',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for missing leading zero when set to `false`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {avoidLeadingZero: false}},
        FIXTURES.noLeadingZero,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.noLeadingZero,
        'css-in-js/number-leading-zero',
      );

      expect(error?.message).toMatchInlineSnapshot('"Expected a leading zero."');
    });

    it('does not trigger for leading zero when set to `false`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {avoidLeadingZero: false}},
        FIXTURES.leadingZero,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.leadingZero,
        'css-in-js/number-leading-zero',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for leading zero when set to `true`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {avoidLeadingZero: true}},
        FIXTURES.leadingZero,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.leadingZero,
        'css-in-js/number-leading-zero',
      );

      expect(error?.message).toMatchInlineSnapshot('"Unexpected leading zero."');
    });

    it('does not trigger for no leading zero when set to `true`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {avoidLeadingZero: true}},
        FIXTURES.noLeadingZero,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.noLeadingZero,
        'css-in-js/number-leading-zero',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('option: `propertyCasing`', () => {
    it('triggers for kebab-case by default', async () => {
      const results = await testEslintConfig(
        'cssInJs',
        FIXTURES.propertyKebabCase,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.propertyKebabCase,
        'css-in-js/property-casing',
      );

      expect(error?.message).toMatchInlineSnapshot(`"'background-color' is not in camelCase."`);
    });

    it('does not trigger for camelCase by default', async () => {
      const results = await testEslintConfig(
        'cssInJs',
        FIXTURES.propertyCamelCase,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.propertyCamelCase,
        'css-in-js/property-casing',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for camelCase when set to `kebab-case`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {propertyCasing: 'kebab-case'}},
        FIXTURES.propertyCamelCase,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.propertyCamelCase,
        'css-in-js/property-casing',
      );

      expect(error?.message).toMatchInlineSnapshot(`"'backgroundColor' is not in kebab-case."`);
    });

    it('does not trigger for kebab-case when set to `kebab-case`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {propertyCasing: 'kebab-case'}},
        FIXTURES.propertyKebabCase,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.propertyKebabCase,
        'css-in-js/property-casing',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for kebab-case when set to `camelCase`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {propertyCasing: 'camelCase'}},
        FIXTURES.propertyKebabCase,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.propertyKebabCase,
        'css-in-js/property-casing',
      );

      expect(error?.message).toMatchInlineSnapshot(`"'background-color' is not in camelCase."`);
    });

    it('does not trigger for camelCase when set to `camelCase`', async () => {
      const results = await testEslintConfig(
        {cssInJs: {propertyCasing: 'camelCase'}},
        FIXTURES.propertyCamelCase,
        JSX_EXTRA_CONFIGS,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.propertyCamelCase,
        'css-in-js/property-casing',
      );

      expect(error).toBeUndefined();
    });
  });
});
