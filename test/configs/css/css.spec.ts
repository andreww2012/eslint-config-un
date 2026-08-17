import {GLOB_CSS} from '../../../src/constants';
import {packagesLoaders} from '../../../src/loaders';

const FIXTURES = {
  cssEmptyBlock: 'css-empty-block.css',
} as const;

describe('basic tests', () => {
  it('creates `css` eslint config and loads `css` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('css');

    const config = configResult.getConfigByUnPostfix('css');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.css"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_CSS]);

    expect(configResult.getLoadedPlugin('css')).toBeDefined();
  });

  it('does not create `css` eslint config and does not load `css` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({css: false});

    expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();
    expect(configResult.getLoadedPlugin('css')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `css` eslint config', async () => {
      await expectConfigState({}, 'css', false);
    });

    it('creates `css` eslint config if explicitly enabled', async () => {
      await expectConfigState('css', 'css', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `css` eslint config by default (when stylelint is not installed)', async () => {
      await expectConfigState({}, 'css', true, 'default');
    });

    it('creates `css` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('css', 'css', ['css', true], 'default');
    });

    it('does not create `css` eslint config if explicitly disabled', async () => {
      await expectConfigState({css: false}, 'css', false, 'default');
    });

    it('does not create `css` eslint config when `stylelint` is installed', async () => {
      addInstalledPackages({stylelint: '16.0.0'});

      await expectConfigState({}, 'css', false, 'default');
    });

    it('creates `css` eslint config if explicitly enabled when `stylelint` is installed', async () => {
      addInstalledPackages({stylelint: '16.0.0'});

      await expectConfigState('css', 'css', true, 'default');
    });

    it('does not create `css` eslint config and prints a warning if explicitly disabled when `stylelint` is installed', async () => {
      addInstalledPackages({stylelint: '16.0.0'});

      await expectConfigState({css: false}, 'css', ['css', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `css` eslint config', async () => {
      await expectConfigState({}, 'css', true, 'misc-enabled');
    });

    it('creates `css` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('css', 'css', ['css', true], 'misc-enabled');
    });

    it('does not create `css` eslint config if explicitly disabled', async () => {
      await expectConfigState({css: false}, 'css', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('css');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('css')).toMatchObject({
      'css/no-empty-blocks': 2,
      'css/font-family-fallbacks': 1,
      'css/prefer-logical-properties': 0,
    });
  });

  it('`css/no-empty-blocks` rule fires on a .css file with an empty block', async () => {
    const results = await testEslintConfig('css', FIXTURES.cssEmptyBlock, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.cssEmptyBlock,
      'css/no-empty-blocks',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unexpected empty block found."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `css` eslint config', async () => {
      const FILES = ['src/**/*.css'];

      const configResult = await computeEslintConfig({css: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('css')?.files).toStrictEqual(FILES);
    });

    it('disables `css` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({css: {files: []}});

      expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `css` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({css: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('css')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `css` eslint config', async () => {
    const configResult = await computeEslintConfig({
      css: {overrides: {'css/no-empty-blocks': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('css', 'css/no-empty-blocks')).toBe(0);
    expect(configResult.getRuleEntrySeverity('css', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `tolerantMode`', () => {
    it('does not set `tolerant` language option by default', async () => {
      const configResult = await computeEslintConfig('css');

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['tolerant'],
      ).toBeUndefined();
    });

    it('sets `tolerant` language option to `true` when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        css: {tolerantMode: true},
      });

      expect(configResult.getConfigByUnPostfix('css')?.languageOptions?.['tolerant']).toBeTrue();
    });

    it('does not set `tolerant` language option when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        css: {tolerantMode: false},
      });

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['tolerant'],
      ).toBeUndefined();
    });
  });

  describe('option: `customSyntax`', () => {
    it('does not set `customSyntax` in language options by default', async () => {
      const configResult = await computeEslintConfig('css');

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toBeUndefined();
    });

    it('sets user-provided `customSyntax` directly when `tailwindcss` is not installed', async () => {
      const USER_CUSTOM_SYNTAX = {atrules: {apply: {prelude: '<custom-selector>'}}};

      const configResult = await computeEslintConfig({
        css: {customSyntax: USER_CUSTOM_SYNTAX},
      });

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toStrictEqual(USER_CUSTOM_SYNTAX);
    });

    it('uses user-provided `customSyntax` object directly when `tailwindcss@3` is installed)', async () => {
      addInstalledPackages({tailwindcss: '3.4.17'});

      const USER_CUSTOM_SYNTAX = {atrules: {apply: {prelude: '<custom-selector>'}}};

      const configResult = await computeEslintConfig({
        css: {customSyntax: USER_CUSTOM_SYNTAX},
      });

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toStrictEqual(USER_CUSTOM_SYNTAX);
    });

    it('passes `extraSyntax` to user-provided `customSyntax` function when `tailwindcss@3` is installed', async () => {
      addInstalledPackages({tailwindcss: '3.4.17'});

      const configResult = await computeEslintConfig({
        css: {
          customSyntax: ({extraSyntax}) => ({
            ...extraSyntax,
            node: {...extraSyntax?.node, Foo: {}},
          }),
        },
      });

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toMatchObject({
        atrules: {
          tailwind: {prelude: 'base | components | utilities | variants'},
        },
        node: {TailwindThemeKey: {}, TailwindUtilityClass: {}, Foo: {}},
      });
    });

    it('uses tailwind 3 customSyntax when `tailwindcss@3` is installed', async () => {
      addInstalledPackages({tailwindcss: '3.4.17'});

      const configResult = await computeEslintConfig('css');

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toMatchObject({
        atrules: {
          tailwind: {prelude: 'base | components | utilities | variants'},
        },
        node: {TailwindThemeKey: {}, TailwindUtilityClass: {}},
      });
    });

    it('uses tailwind 4 customSyntax when `tailwindcss@4` is installed', async () => {
      addInstalledPackages({tailwindcss: '4.0.0'});

      const configResult = await computeEslintConfig('css');

      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toMatchObject({
        atrules: {
          utility: {prelude: '<ident>'},
          theme: expect.any(Object) as unknown,
        },
        node: {TailwindThemeKey: {}, TailwindUtilityClass: {}},
      });
    });

    it('does not request `@eslint/css-tree` when `customSyntax` is a plain object', async () => {
      using spy = vi.spyOn(packagesLoaders, 'eslintCssTreeSyntax');

      await computeEslintConfig({
        css: {customSyntax: {atrules: {apply: {prelude: '<custom-selector>'}}}},
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it('requests `@eslint/css-tree` when `customSyntax` is a function', async () => {
      using spy = vi.spyOn(packagesLoaders, 'eslintCssTreeSyntax');

      await computeEslintConfig({
        css: {customSyntax: ({defaultSyntax}) => defaultSyntax},
      });

      expect(spy).toHaveBeenCalledOnce();
    });

    it('passes an empty `defaultSyntax` to the `customSyntax` function when `@eslint/css-tree` cannot be loaded', async () => {
      using spy = vi
        .spyOn(packagesLoaders, 'eslintCssTreeSyntax')
        .mockResolvedValue({module: null, packageName: '@eslint/css-tree'});

      const configResult = await computeEslintConfig({
        css: {customSyntax: ({defaultSyntax}) => defaultSyntax},
      });

      expect(spy).toHaveBeenCalledOnce();
      expect(
        configResult.getConfigByUnPostfix('css')?.languageOptions?.['customSyntax'],
      ).toStrictEqual({});
    });
  });

  describe('option: `allowedFontUnits`', () => {
    it('allows `rem` and `em` font units when set to provided', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getRuleEntry('css', 'css/relative-font-units')).toMatchInlineSnapshot(
        '[2, {"allowUnits": ["rem", "em"]}]',
      );
    });

    it('adds a custom font unit to the allowed list when provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFontUnits: {lh: true}},
      });

      expect(configResult.getRuleEntry('css', 'css/relative-font-units')).toMatchInlineSnapshot(
        '[2, {"allowUnits": ["rem", "em", "lh"]}]',
      );
    });

    it('removes a default font unit from the allowed list when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFontUnits: {rem: false}},
      });

      expect(configResult.getRuleEntry('css', 'css/relative-font-units')).toMatchInlineSnapshot(
        '[2, {"allowUnits": ["em"]}]',
      );
    });
  });

  describe('option: `allowedFeatures`', () => {
    it('has no extra allowed features in `css/use-baseline` rule by default', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot('[1, {}]');
    });

    it('sets `allowAtRules` in `css/use-baseline` rule when `atRules` is provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFeatures: {atRules: ['layer']}},
      });

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowAtRules": ["layer"]}]',
      );
    });

    it('sets `allowProperties` in `css/use-baseline` rule when `properties` is provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFeatures: {properties: ['grid-template']}},
      });

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowProperties": ["grid-template"]}]',
      );
    });

    it('sets `allowSelectors` in `css/use-baseline` rule when `selectors` is provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFeatures: {selectors: ['has']}},
      });

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowSelectors": ["has"]}]',
      );
    });
  });
});
