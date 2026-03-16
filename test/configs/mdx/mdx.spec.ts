import {GLOB_MDX} from '../../../src/constants';

// NOTE: no fixture needed yet — `mdx/remark` requires remark-lint plugins (not yet installed)
// to produce messages; implement once the remark story in src/configs/mdx.ts is completed.

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('mdx');

  it('loads `mdx` plugin if used', () => {
    expect(configResult.getLoadedPlugin('mdx')).toBeDefined();
  });

  it('creates `mdx/mdx` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('mdx/mdx')).toBeDefined();
  });

  it('creates `mdx/setup/code-blocks-processor` and `mdx/code-blocks` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('mdx/setup/code-blocks-processor')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `mdx/mdx` eslint config', async () => {
      await expectConfigState({}, 'mdx/mdx', false);
    });

    it('creates `mdx/mdx` eslint config if explicitly enabled', async () => {
      await expectConfigState('mdx', 'mdx/mdx', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `mdx/mdx` eslint config (enabled by default)', async () => {
      await expectConfigState({}, 'mdx/mdx', true, 'default');
    });

    it('creates `mdx/mdx` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('mdx', 'mdx/mdx', ['mdx', true], 'default');
    });

    it('does not create `mdx/mdx` eslint config if explicitly disabled', async () => {
      await expectConfigState({mdx: false}, 'mdx/mdx', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `mdx/mdx` eslint config', async () => {
      await expectConfigState({}, 'mdx/mdx', true, 'misc-enabled');
    });

    it('creates `mdx/mdx` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({mdx: true}, 'mdx/mdx', ['mdx', true], 'misc-enabled');
    });
  });

  it('has default `files` in `mdx/mdx` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('mdx/mdx')?.files).toMatchInlineSnapshot(
      '["**/*.mdx"]',
    );
  });

  it('has default `ignores` in `mdx/mdx` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('mdx/mdx')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_MDX]);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `mdx/mdx` eslint config', async () => {
      const FILES = ['src/**/*.mdx'];
      const configResult = await computeEslintConfig({
        mdx: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('mdx/mdx')?.files).toStrictEqual(FILES);
    });

    it('disables all `mdx` eslint configs when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        mdx: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('mdx/mdx')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('mdx/setup/code-blocks-processor')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `mdx/mdx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        mdx: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('mdx/mdx')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `mdx/mdx` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mdx: {overrides: {'mdx/remark': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('mdx/mdx', 'mdx/remark')).toBe(0);
    expect(configResult.getRuleEntrySeverity('mdx/mdx', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `mdx/mdx` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mdx: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('mdx/mdx'), (ruleName) =>
          ruleName.startsWith('mdx/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `mdx/mdx` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mdx: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('mdx/mdx'), (ruleName) =>
          ruleName.startsWith('mdx/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('mdx');

  it('enables `mdx/remark` rule by default with warning severity', () => {
    expect(configResult.getRuleEntrySeverity('mdx/mdx', 'mdx/remark')).toBe(1);
  });

  // TODO: figure out how to trigger
  it.todo('`mdx/remark` rule fires on MDX file with remark warnings');
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set mdx settings when not provided', async () => {
      const configResult = await computeEslintConfig('mdx');
      const config = configResult.getConfigByUnPostfix('mdx/mdx');

      expect(config?.settings?.['mdx']).toBeUndefined();
    });

    it('sets mdx settings when provided', async () => {
      const SETTINGS = {unusedExpressions: true} as const;

      const configResult = await computeEslintConfig({
        mdx: {settings: SETTINGS},
      });

      const config = configResult.getConfigByUnPostfix('mdx/mdx');

      expect(config?.settings?.['mdx']).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `lintCodeBlocks`', () => {
    it('creates `mdx/code-blocks` eslint config when `lintCodeBlocks` is `true` (default)', async () => {
      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });

    it('does not create `mdx/code-blocks` eslint config when `lintCodeBlocks` is `false`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {lintCodeBlocks: false},
      });

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeUndefined();
    });

    it('creates `mdx/code-blocks` eslint config when `lintCodeBlocks` is an object', async () => {
      const configResult = await computeEslintConfig({
        mdx: {lintCodeBlocks: {}},
      });

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });

    it('applies custom files from `lintCodeBlocks` object to `mdx/setup/code-blocks-processor`', async () => {
      const FILES = ['docs/**/*.mdx'];
      const configResult = await computeEslintConfig({
        mdx: {lintCodeBlocks: {files: FILES}},
      });

      expect(
        configResult.getConfigByUnPostfix('mdx/setup/code-blocks-processor')?.files,
      ).toStrictEqual(FILES);
    });
  });

  describe('option: `codeBlocksImpliedStrictMode`', () => {
    it('sets `impliedStrict` to `true` in code-blocks `parserOptions` when `true` (default)', async () => {
      const configResult = await computeEslintConfig('mdx');
      const config = configResult.getConfigByUnPostfix('mdx/code-blocks');

      expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
        '{"ecmaFeatures": {"impliedStrict": true}}',
      );
    });

    it('sets `impliedStrict` to `false` in code-blocks `parserOptions` when `false`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {codeBlocksImpliedStrictMode: false},
      });
      const config = configResult.getConfigByUnPostfix('mdx/code-blocks');

      expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
        '{"ecmaFeatures": {"impliedStrict": false}}',
      );
    });
  });

  describe('option: `codeBlocksIgnoredLanguages`', () => {
    it('does not create `mdx/code-blocks/ignore` eslint config when not set (default)', async () => {
      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks/ignore')).toBeUndefined();
    });

    it('creates `mdx/code-blocks/ignore` with correct ignores when array is provided', async () => {
      const configResult = await computeEslintConfig({
        mdx: {codeBlocksIgnoredLanguages: ['python', 'ruby']},
      });

      expect(
        configResult.getConfigByUnPostfix('mdx/code-blocks/ignore')?.ignores,
      ).toMatchInlineSnapshot('["**/*.mdx/**/*.{python,ruby}"]');
    });
  });

  describe('option: `overridesCodeBlocks`', () => {
    it('applies overrides to `mdx/code-blocks` eslint config rules', async () => {
      const configResult = await computeEslintConfig({
        mdx: {overridesCodeBlocks: {'no-console': 0}},
      });

      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'no-console')).toBe(0);
    });
  });

  describe('disabled rules in embedded code blocks', () => {
    it('disables default rules in `mdx/code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getRuleEntry('mdx/code-blocks', 'no-console')).toBe(0);
      expect(configResult.getRuleEntry('mdx/code-blocks', 'prefer-const')).toBe(0);
    });

    it('does not disable a rule in `mdx/code-blocks` when excluded via `markdownCodeBlocksRules.doNotDisable`', async () => {
      const configResult = await computeEslintConfig('mdx', {
        un: {markdownCodeBlocksRules: {doNotDisable: {'no-console': true}}},
      });

      expect(configResult.getRuleEntry('mdx/code-blocks', 'no-console')).toBeUndefined();
    });

    it('additionally disables a rule in `mdx/code-blocks` when set via `markdownCodeBlocksRules.additionalDisabledRules`', async () => {
      const configResult = await computeEslintConfig('mdx', {
        un: {markdownCodeBlocksRules: {additionalDisabledRules: {'no-shadow': true}}},
      });

      expect(configResult.getRuleEntry('mdx/code-blocks', 'no-shadow')).toBe(0);
    });
  });
});
