import {GLOB_CSS} from '../../../src/constants';

const FIXTURES = {
  cssEmptyBlock: 'css-empty-block.css',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('css');

  it('loads `css` plugin if used', () => {
    expect(configResult.getLoadedPlugin('css')).toBeDefined();
  });

  it('creates `css` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `css` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();
    });

    it('creates `css` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `css` eslint config by default (when stylelint is not installed)', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
    });

    it('creates `css` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('css', {reset: true});

      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to enable `css` config because this is the default',
        ),
      ).toBe(true);
    });

    it('does not create `css` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({css: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();
    });

    it('does not create `css` eslint config when `stylelint` is installed', async () => {
      addInstalledPackages({stylelint: '16.0.0'});

      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();
    });

    it('creates `css` eslint config if explicitly enabled when `stylelint` is installed', async () => {
      addInstalledPackages({stylelint: '16.0.0'});

      const configResult = await computeEslintConfig('css', {reset: true});

      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
    });

    it('does not create `css` eslint config and prints a warning if explicitly disabled when `stylelint` is installed', async () => {
      addInstalledPackages({stylelint: '16.0.0'});

      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({css: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `css` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `css` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
    });
  });

  it('has default `files` in `css` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('css')?.files).toMatchInlineSnapshot('["**/*.css"]');
  });

  it('has default `ignores` in `css` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('css')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).to.not.include.members([GLOB_CSS]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('css');

  it('enables `css/no-empty-blocks` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('css', 'css/no-empty-blocks')).toBe(2);
  });

  it('disables `css/prefer-logical-properties` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('css', 'css/prefer-logical-properties')).toBe(0);
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
      const configResult = await computeEslintConfig({
        css: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('css')?.files).toStrictEqual(FILES);
    });

    it('disables `css` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        css: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('css')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `css` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        css: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('css')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `css` eslint config', async () => {
      const configResult = await computeEslintConfig({
        css: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('css'), (ruleName) =>
          ruleName.startsWith('css/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `css` eslint config', async () => {
      const configResult = await computeEslintConfig({
        css: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('css'), (ruleName) =>
          ruleName.startsWith('css/'),
        ),
      ).toStrictEqual([1]);
    });
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

    it('sets `tolerant` language option to `true` when `tolerantMode` is `true`', async () => {
      const configResult = await computeEslintConfig({
        css: {tolerantMode: true},
      });

      expect(configResult.getConfigByUnPostfix('css')?.languageOptions?.['tolerant']).toBe(true);
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
  });

  describe('option: `allowedFontUnits`', () => {
    it('allows `rem` and `em` font units by default', async () => {
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
    it('has no extra allowed features in `use-baseline` rule by default', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot('[1, {}]');
    });

    it('sets `allowAtRules` in `use-baseline` rule when `atRules` is provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFeatures: {atRules: ['layer']}},
      });

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowAtRules": ["layer"]}]',
      );
    });

    it('sets `allowProperties` in `use-baseline` rule when `properties` is provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFeatures: {properties: ['grid-template']}},
      });

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowProperties": ["grid-template"]}]',
      );
    });

    it('sets `allowSelectors` in `use-baseline` rule when `selectors` is provided', async () => {
      const configResult = await computeEslintConfig({
        css: {allowedFeatures: {selectors: ['has']}},
      });

      expect(configResult.getRuleEntry('css', 'css/use-baseline')).toMatchInlineSnapshot(
        '[1, {"allowSelectors": ["has"]}]',
      );
    });
  });
});
