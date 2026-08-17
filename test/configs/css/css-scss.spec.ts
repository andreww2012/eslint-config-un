import {GLOB_SCSS, SASS_PACKAGES} from '../../../src/constants';
import {packagesLoaders} from '../../../src/loaders';

const FIXTURES = {
  scssEmptyBlock: 'scss-empty-block.scss',
  scssLanguageFeatures: 'scss-language-features.scss',
} as const;

beforeEach(() => {
  addInstalledPackages({sass: '1.80.0'});
});

describe('css: sub config `scss`', () => {
  describe('basic tests', () => {
    it('creates `css/scss` eslint config by default when a Sass compiler is installed', async () => {
      const configResult = await computeEslintConfig('css');

      const config = configResult.getConfigByUnPostfix('css/scss');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.scss"]');

      const ignores = config?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).not.toIncludeAnyMembers([GLOB_SCSS]);
    });

    it.each(SASS_PACKAGES)(
      'creates `css/scss` eslint config when `%s` is installed',
      async (packageName) => {
        setInstalledPackages({[packageName]: '1.0.0'});

        expect((await computeEslintConfig('css')).getConfigByUnPostfix('css/scss')).toBeDefined();
      },
    );

    it('does not create `css/scss` eslint config when no Sass compiler is installed', async () => {
      setInstalledPackages({});

      expect((await computeEslintConfig('css')).getConfigByUnPostfix('css/scss')).toBeUndefined();
    });

    it('does not create `css/scss` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({css: {configScss: false}});

      expect(configResult.getConfigByUnPostfix('css/scss')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
    });

    it('creates `css/scss` eslint config when set to `true` and no Sass compiler is installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig({css: {configScss: true}});

      expect(configResult.getConfigByUnPostfix('css/scss')).toBeDefined();
    });

    it('does not create `css/scss` eslint config when the parent config is disabled', async () => {
      const configResult = await computeEslintConfig({css: false});

      expect(configResult.getConfigByUnPostfix('css/scss')).toBeUndefined();
    });

    it('fatally fails when `@humanwhocodes/scsstree` cannot be loaded', async () => {
      const processOutput = spyOnProcessOutput();
      using spy = vi
        .spyOn(packagesLoaders, 'scsstree')
        .mockResolvedValue({module: null, packageName: '@humanwhocodes/scsstree'});

      // Real runs die inside `logger.fatal`, but here `process.exit` is neutralized, so the
      // generator carries on until it trips over the syntax it just reported as missing
      await expect(computeEslintConfig({css: {configScss: true}})).rejects.toThrow();

      expect(spy).toHaveBeenCalledOnce();
      expect(processOutput.exit).toHaveBeenCalledWith(1);
      expect(processOutput.getStderrOutput()).toContain('@humanwhocodes/scsstree');
    });

    it('does not request `@humanwhocodes/scsstree` when the sub-config is disabled', async () => {
      using spy = vi.spyOn(packagesLoaders, 'scsstree');

      await computeEslintConfig({css: {configScss: false}});

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // Linting `.scss` files at all is what exposes them to the configs that are not restricted to
  // any `files`, so this sub-config is what makes the implicit ignores of those configs matter
  describe('implicit ignores of other configs', () => {
    const CONFIGS = {css: {configScss: true}, cssInJs: true};

    it('adds `**/*.scss` to the ignores of configs applying to every file', async () => {
      const configResult = await computeEslintConfig(CONFIGS);

      expect(configResult.getConfigByUnPostfix('css-in-js')?.ignores).toIncludeAllMembers([
        GLOB_SCSS,
      ]);
    });

    // `css-in-js/color-hex-style` reads `sourceCode.parserServices`, which the `css/css` language
    // does not provide, and throws while the rule is being created, killing the whole lint run
    it('keeps `css-in-js` rules from crashing on a .scss file', async () => {
      const results = await testEslintConfig(
        CONFIGS,
        FIXTURES.scssLanguageFeatures,
        import.meta.dirname,
      );

      expect(results.flatMap(({messages}) => messages)).toStrictEqual([]);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({css: {configScss: true}});

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('css/scss')).toMatchObject({
        'css/no-empty-blocks': 2,
        'css/no-important': 1,
        'css/no-invalid-properties': 0,
      });
    });

    it('`css/no-empty-blocks` rule fires on a .scss file with an empty block', async () => {
      const results = await testEslintConfig(
        {css: {configScss: true}},
        FIXTURES.scssEmptyBlock,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.scssEmptyBlock,
        'css/no-empty-blocks',
      );

      expect(error?.message).toMatchInlineSnapshot('"Unexpected empty block found."');
    });

    it('reports nothing on a .scss file only using SCSS language features', async () => {
      const results = await testEslintConfig(
        {css: {configScss: true}},
        FIXTURES.scssLanguageFeatures,
        import.meta.dirname,
      );

      expect(results.flatMap(({messages}) => messages)).toStrictEqual([]);
    });

    it('does not lint .scss files when only the parent config is enabled', async () => {
      const results = await testEslintConfig(
        {css: {configScss: false}},
        FIXTURES.scssEmptyBlock,
        import.meta.dirname,
      );

      expect(results.flatMap(({messages}) => messages.map(({message}) => message))).toStrictEqual([
        'File ignored because no matching configuration was supplied.',
      ]);
    });

    describe('rules disagreeing with SCSS are turned off', () => {
      it.each([
        'css/font-family-fallbacks',
        'css/no-invalid-at-rule-placement',
        'css/no-invalid-at-rules',
        'css/no-invalid-properties',
      ])('turns `%s` off, unlike in the parent config', (ruleName) => {
        expect(configResult.getRuleEntrySeverity('css/scss', ruleName)).toBe(0);
        expect(configResult.getRuleEntrySeverity('css', ruleName)).toBeGreaterThan(0);
      });
    });

    it('allows the `@function` at-rule in `css/use-baseline`', () => {
      expect(configResult.getRuleEntry('css/scss', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowAtRules": ["function"]}]',
      );
    });

    it('merges user-provided `allowedFeatures.atRules` with the `@function` at-rule', async () => {
      const scssConfigResult = await computeEslintConfig({
        css: {configScss: true, allowedFeatures: {atRules: ['layer']}},
      });

      expect(scssConfigResult.getRuleEntry('css/scss', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowAtRules": ["function", "layer"]}]',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `css/scss` eslint config', async () => {
        const FILES = ['src/**/*.scss'];

        const configResult = await computeEslintConfig({css: {configScss: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('css/scss')?.files).toStrictEqual(FILES);
      });

      it('disables `css/scss` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({css: {configScss: {files: []}}});

        expect(configResult.getConfigByUnPostfix('css/scss')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `css/scss` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({css: {configScss: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('css/scss')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `css/scss` eslint config', async () => {
      const configResult = await computeEslintConfig({
        css: {
          configScss: {
            overrides: {'css/no-empty-blocks': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleEntrySeverity('css/scss', 'css/no-empty-blocks')).toBe(0);
      expect(configResult.getRuleEntrySeverity('css/scss', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `customSyntax`', () => {
      it('uses the SCSS syntax when option is not set', async () => {
        const configResult = await computeEslintConfig('css');

        expect(
          configResult.getConfigByUnPostfix('css/scss')?.languageOptions?.['customSyntax'],
        ).toMatchObject({
          node: {ScssInterpolation: expect.any(Object) as unknown},
        });
      });

      it('uses user-provided `customSyntax` object directly', async () => {
        const USER_CUSTOM_SYNTAX = {atrules: {apply: {prelude: '<custom-selector>'}}};

        const configResult = await computeEslintConfig({
          css: {configScss: {customSyntax: USER_CUSTOM_SYNTAX}},
        });

        expect(
          configResult.getConfigByUnPostfix('css/scss')?.languageOptions?.['customSyntax'],
        ).toStrictEqual(USER_CUSTOM_SYNTAX);
      });

      it('passes `defaultSyntax` and `extraSyntax` to user-provided `customSyntax` function', async () => {
        const configResult = await computeEslintConfig({
          css: {
            configScss: {
              customSyntax: ({defaultSyntax, extraSyntax}) => ({
                ...extraSyntax,
                properties: defaultSyntax.properties,
                node: {...extraSyntax.node, Foo: {}},
              }),
            },
          },
        });

        expect(
          configResult.getConfigByUnPostfix('css/scss')?.languageOptions?.['customSyntax'],
        ).toMatchObject({
          properties: {color: expect.any(String) as unknown},
          node: {ScssInterpolation: expect.any(Object) as unknown, Foo: {}},
        });
      });

      it('does not apply the `customSyntax` of the parent config', async () => {
        const USER_CUSTOM_SYNTAX = {atrules: {apply: {prelude: '<custom-selector>'}}};

        const configResult = await computeEslintConfig({
          css: {configScss: true, customSyntax: USER_CUSTOM_SYNTAX},
        });

        expect(
          configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
        ).toStrictEqual(USER_CUSTOM_SYNTAX);
        expect(
          configResult.getConfigByUnPostfix('css/scss')?.languageOptions?.['customSyntax'],
        ).toMatchObject({
          node: {ScssInterpolation: expect.any(Object) as unknown},
        });
      });
    });

    describe('option: `tolerantMode` of the parent config', () => {
      it('does not set `tolerant` language option by default', async () => {
        const configResult = await computeEslintConfig('css');

        expect(
          configResult.getConfigByUnPostfix('css/scss')?.languageOptions?.['tolerant'],
        ).toBeUndefined();
      });

      it('sets `tolerant` language option to `true` when set to `true`', async () => {
        const configResult = await computeEslintConfig({css: {tolerantMode: true}});

        expect(
          configResult.getConfigByUnPostfix('css/scss')?.languageOptions?.['tolerant'],
        ).toBeTrue();
      });
    });
  });
});
