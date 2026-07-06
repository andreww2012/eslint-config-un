import {GLOB_SVELTE} from '../../../src/constants';

const FIXTURES = {
  stringLiteralInSvelteExpression: 'string-literal-in-svelte-expression.svelte',
} as const;

beforeEach(() => {
  addInstalledPackages({svelte: '5.34.3'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('svelte');

  it('loads `svelte` plugin if used', () => {
    expect(configResult.getLoadedPlugin('svelte')).toBeDefined();
  });

  it('creates `svelte` and `svelte/setup` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('svelte')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('svelte/setup')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `svelte` eslint config', async () => {
      await expectConfigState({}, 'svelte', false);
    });

    it('creates `svelte` eslint config if explicitly enabled', async () => {
      await expectConfigState('svelte', 'svelte', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `svelte` eslint config when `svelte` package is installed', async () => {
      await expectConfigState({}, 'svelte', true, 'default');
    });

    it('does not create `svelte` eslint config if explicitly disabled', async () => {
      await expectConfigState({svelte: false}, 'svelte', false, 'default');
    });

    it('creates `svelte` eslint config and prints a warning if explicitly enabled (already the default)', async () => {
      await expectConfigState('svelte', 'svelte', ['svelte', true], 'default');
    });

    describe('`svelte` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `svelte` eslint config', async () => {
        await expectConfigState({}, 'svelte', false, 'default');
      });

      it('creates `svelte` eslint config if explicitly enabled', async () => {
        await expectConfigState('svelte', 'svelte', true, 'default');
      });

      it('does not create `svelte` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({svelte: false}, 'svelte', ['svelte', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `svelte` eslint config (svelte package is installed)', async () => {
      await expectConfigState({}, 'svelte', true, 'misc-enabled');
    });

    it('creates `svelte` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('svelte', 'svelte', ['svelte', true], 'misc-enabled');
    });

    it('does not create `svelte` eslint config if explicitly disabled', async () => {
      await expectConfigState({svelte: false}, 'svelte', false, 'misc-enabled');
    });
  });

  it('has default `files` in `svelte` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('svelte')?.files).toMatchInlineSnapshot(
      '["**/*.svelte"]',
    );
  });

  it('has default `ignores` in `svelte` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('svelte')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `svelte` eslint config', async () => {
      const FILES = ['src/**/*.svelte'];

      const configResult = await computeEslintConfig({svelte: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('svelte')?.files).toStrictEqual(FILES);
    });

    it('disables `svelte` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({svelte: {files: []}});

      expect(configResult.getConfigByUnPostfix('svelte')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `svelte` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({svelte: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('svelte')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `svelte` eslint config', async () => {
    const configResult = await computeEslintConfig({
      svelte: {
        overrides: {'svelte/no-at-html-tags': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('svelte', 'svelte/no-at-html-tags')).toBe(0);
    expect(configResult.getRuleEntrySeverity('svelte', 'no-console')).toBe(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('svelte');

  it('enables `svelte/no-at-html-tags` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('svelte', 'svelte/no-at-html-tags')).toBe(2);
  });

  it('disables `svelte/no-target-blank` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('svelte', 'svelte/no-target-blank')).toBe(0);
  });

  it('`svelte/no-useless-mustaches` rule fires on a mustache with a string literal', async () => {
    const results = await testEslintConfig(
      'svelte',
      FIXTURES.stringLiteralInSvelteExpression,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.stringLiteralInSvelteExpression,
      'svelte/no-useless-mustaches',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected mustache interpolation with a string literal value."',
    );
  });
});

describe('options', () => {
  describe('option: `svelteVersion`', () => {
    it('enables `svelte/prefer-style-directive` rule when installed `svelte` version is >=3.46 (detected from the installed package version)', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/prefer-style-directive')).toBe(1);
    });

    it('enables `svelte/prefer-style-directive` rule when set to >=3.46', async () => {
      const configResult = await computeEslintConfig({svelte: {svelteVersion: 3.46}});

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/prefer-style-directive')).toBe(1);
    });

    it('disables `svelte/prefer-style-directive` rule when set to <3.46', async () => {
      const configResult = await computeEslintConfig({svelte: {svelteVersion: 3}});

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/prefer-style-directive')).toBe(0);
    });

    it('disables `svelte/prefer-style-directive` rule by default and installed `svelte` version is < 3.46', async () => {
      setInstalledPackages({svelte: '3'});

      const configResult = await computeEslintConfig({svelte: {svelteVersion: 3}});

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/prefer-style-directive')).toBe(0);
    });

    it('enables `svelte/require-event-prefix` rule by default and installed `svelte` version is >= 5', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/require-event-prefix')).toBe(2);
    });

    it('disables `svelte/require-event-prefix` rule by default and installed `svelte` version is < 5', async () => {
      setInstalledPackages({svelte: '4'});

      const configResult = await computeEslintConfig('svelte');

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/require-event-prefix')).toBe(0);
    });

    it('enables `svelte/require-event-prefix` rule when set to >=5', async () => {
      const configResult = await computeEslintConfig({svelte: {svelteVersion: 5}});

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/require-event-prefix')).toBe(2);
    });

    it('disables `svelte/require-event-prefix` rule when set to <5', async () => {
      const configResult = await computeEslintConfig({svelte: {svelteVersion: 4}});

      expect(configResult.getRuleEntrySeverity('svelte', 'svelte/require-event-prefix')).toBe(0);
    });
  });

  describe('option: `isPrettierPluginSvelteUsed`', () => {
    it('does not create `svelte/prettier` eslint config by default (`isPrettierPluginSvelteUsed` is false)', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(configResult.getConfigByUnPostfix('svelte/prettier')).toBeUndefined();
    });

    it('creates `svelte/prettier` eslint config when `isPrettierPluginSvelteUsed` is true', async () => {
      const configResult = await computeEslintConfig({
        svelte: {isPrettierPluginSvelteUsed: true},
      });

      expect(configResult.getConfigByUnPostfix('svelte/prettier')).toBeDefined();
    });

    it('disables stylistic rules in `svelte/prettier` eslint config when `isPrettierPluginSvelteUsed` is true', async () => {
      const configResult = await computeEslintConfig({
        svelte: {isPrettierPluginSvelteUsed: true},
      });

      expect(configResult.getRuleEntrySeverity('svelte/prettier', 'svelte/html-quotes')).toBe(0);
      expect(configResult.getRuleEntrySeverity('svelte/prettier', 'svelte/html-self-closing')).toBe(
        0,
      );
    });
  });

  describe('option: `disallowedHtmlTags`', () => {
    it('restricts default invalid html tags in `svelte/no-restricted-html-elements` by default', async () => {
      const configResult = await computeEslintConfig('svelte');
      const ruleEntry = configResult.getRuleEntry('svelte', 'svelte/no-restricted-html-elements');

      expect(ruleEntry).toMatchInlineSnapshot(
        '[2, "acronym", "big", "center", "content", "dir", "font", "frame", "frameset", "image", "marquee", "menuitem", "nobr", "noembed", "noframes", "param", "plaintext", "rb", "rtc", "shadow", "strike", "tt", "xmp", "applet", "bgsound", "blink", "isindex", "keygen", "multicol", "nextid", "spacer", "basefont", "listing", "command", "element"]',
      );
    });

    it('adds custom disallowed tags to `svelte/no-restricted-html-elements` rule', async () => {
      const configResult = await computeEslintConfig({
        svelte: {disallowedHtmlTags: {iframe: true}},
      });
      const ruleEntry = configResult.getRuleEntry('svelte', 'svelte/no-restricted-html-elements');

      expect(ruleEntry).toMatchInlineSnapshot(
        '[2, "acronym", "big", "center", "content", "dir", "font", "frame", "frameset", "image", "marquee", "menuitem", "nobr", "noembed", "noframes", "param", "plaintext", "rb", "rtc", "shadow", "strike", "tt", "xmp", "applet", "bgsound", "blink", "isindex", "keygen", "multicol", "nextid", "spacer", "basefont", "listing", "command", "element", "iframe"]',
      );
    });

    it('allows a previously-restricted invalid tag when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        svelte: {disallowedHtmlTags: {font: false}},
      });
      const ruleEntry = configResult.getRuleEntry('svelte', 'svelte/no-restricted-html-elements');

      expect(ruleEntry).toMatchInlineSnapshot(
        '[2, "acronym", "big", "center", "content", "dir", "frame", "frameset", "image", "marquee", "menuitem", "nobr", "noembed", "noframes", "param", "plaintext", "rb", "rtc", "shadow", "strike", "tt", "xmp", "applet", "bgsound", "blink", "isindex", "keygen", "multicol", "nextid", "spacer", "basefont", "listing", "command", "element"]',
      );
    });
  });

  describe('option: `settings`', () => {
    it('does not set svelte settings by default', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(
        configResult.getConfigByUnPostfix('svelte/setup')?.settings?.['svelte'],
      ).toBeUndefined();
    });

    it('sets svelte settings when `settings` is provided', async () => {
      const SETTINGS = {ignoreWarnings: ['some-rule']};

      const configResult = await computeEslintConfig({svelte: {settings: SETTINGS}});

      expect(configResult.getConfigByUnPostfix('svelte/setup')?.settings?.['svelte']).toStrictEqual(
        SETTINGS,
      );
    });
  });

  describe('option: `svelteKitConfig`', () => {
    it('does not set `svelteConfig` in parserOptions by default', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(
        (
          configResult.getConfigByUnPostfix('svelte/setup')?.languageOptions?.['parserOptions'] as
            Record<string, unknown> | undefined
        )?.['svelteConfig'],
      ).toBeUndefined();
    });

    it('sets `svelteConfig` in parserOptions when `svelteKitConfig` is provided', async () => {
      const SVELTE_KIT_CONFIG = {};
      const configResult = await computeEslintConfig({
        svelte: {svelteKitConfig: SVELTE_KIT_CONFIG},
      });

      expect(
        (
          configResult.getConfigByUnPostfix('svelte/setup')?.languageOptions?.['parserOptions'] as
            Record<string, unknown> | undefined
        )?.['svelteConfig'],
      ).toBe(SVELTE_KIT_CONFIG);
    });
  });
});

describe('`svelte` and `ts` configs relationship', () => {
  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if not explicitly specified', async () => {
    const configResult = await computeEslintConfig({svelte: true, ts: true});

    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).toIncludeAllMembers(
      [GLOB_SVELTE],
    );
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toIncludeAllMembers([
      GLOB_SVELTE,
    ]);
  });

  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if explicitly specified', async () => {
    const FILES = ['src/**/*.svelte'];

    const configResult = await computeEslintConfig({svelte: {files: FILES}, ts: true});

    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).toIncludeAllMembers(
      FILES,
    );
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toIncludeAllMembers(
      FILES,
    );
  });

  it('`files` specified in `enforceTypescriptInScriptSection` sub-config take precedence over the parent config `files` and flow to `ts/{non-type-aware,type-aware}/setup` eslint configs', async () => {
    const MAIN_FILES = ['a/**/*.svelte'];
    const TS_FILES = ['b/**/*.svelte'];

    const configResult = await computeEslintConfig({
      svelte: {files: MAIN_FILES, configEnforceTypescriptInScriptSection: {files: TS_FILES}},
      ts: true,
    });

    const configTsNonTypeAwareSetup = configResult.getConfigByUnPostfix('ts/non-type-aware/setup');
    const configTsTypeAwareSetup = configResult.getConfigByUnPostfix('ts/type-aware/setup');

    expect(configTsNonTypeAwareSetup?.files).toIncludeAllMembers(TS_FILES);
    expect(configTsNonTypeAwareSetup?.files).not.toIncludeAllMembers(MAIN_FILES);

    expect(configTsTypeAwareSetup?.files).toIncludeAllMembers(TS_FILES);
    expect(configTsTypeAwareSetup?.files).not.toIncludeAllMembers(MAIN_FILES);
  });

  it('empty `files` do not flow to `ts/{non-type-aware,type-aware}/setup` eslint configs', async () => {
    const configResult = await computeEslintConfig({svelte: {files: []}, ts: true});

    expect(
      configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
    ).not.toIncludeAnyMembers([GLOB_SVELTE]);
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).not.toIncludeAnyMembers(
      [GLOB_SVELTE],
    );
  });
});
