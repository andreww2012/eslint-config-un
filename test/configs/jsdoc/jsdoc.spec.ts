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
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeUndefined();
    });

    it('creates `jsdoc` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('jsdoc');

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeDefined();
    });

    it('does not create `jsdoc` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({jsdoc: false});

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `jsdoc` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `jsdoc` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeDefined();
    });

    it('creates `jsdoc` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('jsdoc', {reset: true});

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to enable `jsdoc` config because this is the default',
        ),
      ).toBe(true);
    });

    it('does not create `jsdoc` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({jsdoc: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jsdoc` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeDefined();
    });
  });

  it('has no explicit `files` restriction in `jsdoc` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('jsdoc')?.files).toBeUndefined();
  });

  it('has default `ignores` in `jsdoc` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('jsdoc')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsdoc');

  it('enables `jsdoc/check-access` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/check-access')).toBe(2);
  });

  it('disables `jsdoc/convert-to-jsdoc-comments` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/convert-to-jsdoc-comments')).toBe(0);
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
      const configResult = await computeEslintConfig({
        jsdoc: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('jsdoc')?.files).toStrictEqual(FILES);
    });

    it('disables `jsdoc` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('jsdoc')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jsdoc` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        jsdoc: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('jsdoc')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `jsdoc` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('jsdoc'), (ruleName) =>
          ruleName.startsWith('jsdoc/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `jsdoc` eslint config', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('jsdoc'), (ruleName) =>
          ruleName.startsWith('jsdoc/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set jsdoc settings when not provided', async () => {
      const configResult = await computeEslintConfig('jsdoc');
      const config = configResult.getConfigByUnPostfix('jsdoc');

      expect(config?.settings?.['jsdoc']).toBeUndefined();
    });

    it('sets jsdoc settings when provided', async () => {
      const SETTINGS = {ignorePrivate: true, mode: 'jsdoc'} as const;

      const configResult = await computeEslintConfig({
        jsdoc: {settings: SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('jsdoc')?.settings?.['jsdoc']).toStrictEqual(
        SETTINGS,
      );
    });
  });

  describe('option: `customTags`', () => {
    it('does not set `definedTags` in `check-tag-names` rule options when `customTags` is not provided', async () => {
      const configResult = await computeEslintConfig('jsdoc');

      expect(configResult.getRuleEntryOptions('jsdoc', 'jsdoc/check-tag-names')).toStrictEqual([]);
    });

    it('sets `definedTags` in `check-tag-names` rule options when `customTags` is provided', async () => {
      const CUSTOM_TAGS = ['slot', 'component'];

      const configResult = await computeEslintConfig({
        jsdoc: {customTags: CUSTOM_TAGS},
      });

      expect(configResult.getRuleEntryOptions('jsdoc', 'jsdoc/check-tag-names')).toStrictEqual([
        {definedTags: CUSTOM_TAGS},
      ]);
    });
  });

  describe('option: `extraMultilineCommentsStartingWithToIgnore`', () => {
    it('uses default ignore list for `no-bad-blocks` rule when option is not provided', async () => {
      const configResult = await computeEslintConfig('jsdoc');
      const rule = configResult.getRuleEntry('jsdoc', 'jsdoc/no-bad-blocks');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"ignore": ["ts-check", "ts-expect-error", "ts-ignore", "ts-nocheck", "__PURE__", "__NO_SIDE_EFFECTS__", "vite-ignore"]}]',
      );
    });

    it('merges user-provided values with default ignore list for `no-bad-blocks` rule', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {extraMultilineCommentsStartingWithToIgnore: ['eslint-disable', 'webpack-magic']},
      });
      const rule = configResult.getRuleEntry('jsdoc', 'jsdoc/no-bad-blocks');

      expect(rule).toMatchInlineSnapshot(
        '[2, {"ignore": ["ts-check", "ts-expect-error", "ts-ignore", "ts-nocheck", "__PURE__", "__NO_SIDE_EFFECTS__", "vite-ignore", "eslint-disable", "webpack-magic"]}]',
      );
    });
  });

  describe('option: `formatTypeValues`', () => {
    it('enables `type-formatting` rule when `formatTypeValues` is `true` (default)', async () => {
      const configResult = await computeEslintConfig('jsdoc');

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/type-formatting')).toBe(2);
    });

    it('disables `type-formatting` rule when `formatTypeValues` is `false`', async () => {
      const configResult = await computeEslintConfig({
        jsdoc: {formatTypeValues: false},
      });

      expect(configResult.getRuleEntrySeverity('jsdoc', 'jsdoc/type-formatting')).toBe(0);
    });
  });
});
