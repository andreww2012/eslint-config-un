import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  wrongParamNames: 'wrong-param-names.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('jsdoc');

  it('loads `jsdoc` plugin if used', () => {
    expect(configResult.getLoadedPlugin('jsdoc')).toBeDefined();
  });

  it('creates `jsdoc` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jsdoc')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jsdoc` eslint config', async () => {
      await expectConfigState({}, 'jsdoc', false);
    });

    it('creates `jsdoc` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsdoc', 'jsdoc', true);
    });

    it('does not create `jsdoc` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({jsdoc: false}, 'jsdoc', ['jsdoc', false]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `jsdoc` eslint config', async () => {
      await expectConfigState({}, 'jsdoc', true, 'default');
    });

    it('creates `jsdoc` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jsdoc', 'jsdoc', ['jsdoc', true], 'default');
    });

    it('does not create `jsdoc` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsdoc: false}, 'jsdoc', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jsdoc` eslint config', async () => {
      await expectConfigState({}, 'jsdoc', true, 'misc-enabled');
    });

    it('creates `jsdoc` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jsdoc', 'jsdoc', ['jsdoc', true], 'misc-enabled');
    });

    it('does not create `jsdoc` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsdoc: false}, 'jsdoc', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `jsdoc` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('jsdoc')?.files).toBeUndefined();
  });

  it('has default `ignores` in `jsdoc` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('jsdoc')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsdoc');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('jsdoc')).toMatchObject({
      'jsdoc/check-access': 2,
      'jsdoc/require-next-type': 1,
      'jsdoc/convert-to-jsdoc-comments': 0,
    });
  });

  it('`jsdoc/check-param-names` rule fires on mismatched param names', async () => {
    const results = await testEslintConfig('jsdoc', FIXTURES.wrongParamNames, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.wrongParamNames,
      'jsdoc/check-param-names',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Expected @param names to be "a, b". Got "wrongName, anotherWrong"."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `jsdoc` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({jsdoc: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('jsdoc')?.files).toStrictEqual(FILES);
    });

    it('disables `jsdoc` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsdoc: {files: []}});

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jsdoc` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsdoc: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('jsdoc')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jsdoc` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jsdoc: {overrides: {'jsdoc/check-access': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/check-access')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jsdoc', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set jsdoc settings by default', async () => {
      const configResult = await computeEslintConfig('jsdoc');
      const config = configResult.getConfigByUnPostfix('jsdoc');

      expect(config?.settings?.['jsdoc']).toBeUndefined();
    });

    it('sets jsdoc settings when provided', async () => {
      const SETTINGS = {ignorePrivate: true, mode: 'jsdoc'} as const;

      const configResult = await computeEslintConfig({jsdoc: {settings: SETTINGS}});

      expect(configResult.getConfigByUnPostfix('jsdoc')?.settings?.['jsdoc']).toStrictEqual(
        SETTINGS,
      );
    });
  });

  describe('option: `customTags`', () => {
    it('does not set `definedTags` in `jsdoc/check-tag-names` rule options by default', async () => {
      const configResult = await computeEslintConfig('jsdoc');

      expect(configResult.getRuleEntryOptions('jsdoc', 'jsdoc/check-tag-names')).toStrictEqual([]);
    });

    it('sets `definedTags` in `jsdoc/check-tag-names` rule options when `customTags` is provided', async () => {
      const CUSTOM_TAGS = ['slot', 'component'];

      const configResult = await computeEslintConfig({
        jsdoc: {customTags: CUSTOM_TAGS},
      });

      expect(configResult.getRuleEntryOptions('jsdoc', 'jsdoc/check-tag-names')).toStrictEqual([
        {definedTags: CUSTOM_TAGS},
      ]);
    });

    it('sets `definedTags` from truthy keys when `customTags` is a record', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {customTags: {slot: true, component: false}},
      });

      expect(configResult.getRuleEntryOptions('jsdoc', 'jsdoc/check-tag-names')).toStrictEqual([
        {definedTags: ['slot']},
      ]);
    });
  });

  describe('option: `extraMultilineCommentsStartingWithToIgnore`', () => {
    it('uses default ignore list for `jsdoc/no-bad-blocks` rule by default', async () => {
      const configResult = await computeEslintConfig('jsdoc');
      const rule = configResult.getRuleEntry('jsdoc', 'jsdoc/no-bad-blocks');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"ignore": ["ts-check", "ts-expect-error", "ts-ignore", "ts-nocheck", "__PURE__", "__NO_SIDE_EFFECTS__", "vite-ignore"]}]',
      );
    });

    it('merges user-provided values with default ignore list for `jsdoc/no-bad-blocks` rule', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {extraMultilineCommentsStartingWithToIgnore: ['eslint-disable', 'webpack-magic']},
      });
      const rule = configResult.getRuleEntry('jsdoc', 'jsdoc/no-bad-blocks');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"ignore": ["ts-check", "ts-expect-error", "ts-ignore", "ts-nocheck", "__PURE__", "__NO_SIDE_EFFECTS__", "vite-ignore", "eslint-disable", "webpack-magic"]}]',
      );
    });

    it('merges a record with the default ignore list for `jsdoc/no-bad-blocks` rule', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {extraMultilineCommentsStartingWithToIgnore: {'eslint-disable': true}},
      });
      const rule = configResult.getRuleEntry('jsdoc', 'jsdoc/no-bad-blocks');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"ignore": ["ts-check", "ts-expect-error", "ts-ignore", "ts-nocheck", "__PURE__", "__NO_SIDE_EFFECTS__", "vite-ignore", "eslint-disable"]}]',
      );
    });

    it('disables a default entry via the record form for `jsdoc/no-bad-blocks` rule', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {extraMultilineCommentsStartingWithToIgnore: {'ts-nocheck': false}},
      });
      const rule = configResult.getRuleEntry('jsdoc', 'jsdoc/no-bad-blocks');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"ignore": ["ts-check", "ts-expect-error", "ts-ignore", "__PURE__", "__NO_SIDE_EFFECTS__", "vite-ignore"]}]',
      );
    });
  });

  describe('option: `formatTypeValues`', () => {
    it('enables `jsdoc/type-formatting` rule by default', async () => {
      const configResult = await computeEslintConfig('jsdoc');

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/type-formatting')).toBe(2);
    });

    it('enables `jsdoc/type-formatting` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({jsdoc: {formatTypeValues: true}});

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/type-formatting')).toBe(2);
    });

    it('disables `jsdoc/type-formatting` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({jsdoc: {formatTypeValues: false}});

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/type-formatting')).toBe(0);
    });
  });

  describe('option: `normalizeSeeLinks`', () => {
    it('disables `jsdoc/normalize-see-links` rule by default', async () => {
      const configResult = await computeEslintConfig('jsdoc');

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/normalize-see-links')).toBe(0);
    });

    it('disables `jsdoc/normalize-see-links` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({jsdoc: {normalizeSeeLinks: false}});

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/normalize-see-links')).toBe(0);
    });

    it('enables `jsdoc/normalize-see-links` rule with its default options when set to `true`', async () => {
      const configResult = await computeEslintConfig({jsdoc: {normalizeSeeLinks: true}});

      expect(configResult.getRuleEntry('jsdoc', 'jsdoc/normalize-see-links')).toMatchInlineSnapshot(
        '[2, {"canonicalForm": "pipe"}]',
      );
    });

    it('sets `canonicalForm` from a string shortcut in `jsdoc/normalize-see-links` rule', async () => {
      const configResult = await computeEslintConfig({jsdoc: {normalizeSeeLinks: 'prefix'}});

      expect(configResult.getRuleEntry('jsdoc', 'jsdoc/normalize-see-links')).toMatchInlineSnapshot(
        '[2, {"canonicalForm": "prefix"}]',
      );
    });

    it('passes an object as `jsdoc/normalize-see-links` rule options as-is', async () => {
      const OPTIONS = {canonicalForm: 'pipe', enableFixer: false, wrapBareUrls: true} as const;

      const configResult = await computeEslintConfig({jsdoc: {normalizeSeeLinks: OPTIONS}});

      expect(configResult.getRuleEntryOptions('jsdoc', 'jsdoc/normalize-see-links')).toStrictEqual([
        OPTIONS,
      ]);
    });
  });
});
