import {GLOB_MDX} from '../../../src/constants';

const FIXTURES = {
  unclosedJsxTag: 'unclosed-jsx-tag.mdx',
} as const;

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

    it('does not create `mdx/mdx` eslint config if explicitly disabled', async () => {
      await expectConfigState({mdx: false}, 'mdx/mdx', false, 'misc-enabled');
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
    expect(ignores).not.toIncludeAnyMembers([GLOB_MDX]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('mdx');

  it('enables `mdx/remark` rule by default with warning severity', () => {
    expect(configResult.getRuleEntrySeverity('mdx/mdx', 'mdx/remark')).toBe(1);
  });

  // `mdx/remark` itself only reports when remark-lint plugins are configured in a remark config,
  // so what is verifiable here is that MDX files really go through the mdx parser.
  it('reports MDX syntax errors, proving the mdx parser is applied to `.mdx` files', async () => {
    const results = await testEslintConfig('mdx', FIXTURES.unclosedJsxTag, import.meta.dirname);

    expect(
      results.flatMap(({messages}) => messages.map(({message}) => message)),
    ).toMatchInlineSnapshot(
      '["Preprocessing error: Expected a closing tag for `<p>` (3:1-3:4) before the end of `paragraph`"]',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `mdx/mdx` eslint config', async () => {
      const FILES = ['src/**/*.mdx'];

      const configResult = await computeEslintConfig({mdx: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('mdx/mdx')?.files).toStrictEqual(FILES);
    });

    it('disables all `mdx` eslint configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({mdx: {files: []}});

      expect(configResult.getConfigByUnPostfix('mdx/mdx')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('mdx/setup/code-blocks-processor')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `mdx/mdx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({mdx: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('mdx/mdx')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set mdx settings by default', async () => {
      const configResult = await computeEslintConfig('mdx');
      const config = configResult.getConfigByUnPostfix('mdx/mdx');

      expect(config?.settings?.['mdx/code-blocks']).toBeUndefined();
      expect(config?.settings?.['mdx/language-mapper']).toBeUndefined();
    });

    it('sets mdx settings when provided, transforming keys to `mdx/<kebab-case>`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {
          settings: {
            codeBlocks: true,
            languageMapper: {js: 'jsx'},
            ignoreRemarkConfig: true,
            remarkConfigPath: './.remarkrc.js',
          },
        },
      });

      const config = configResult.getConfigByUnPostfix('mdx/mdx');

      expect(config?.settings).toStrictEqual({
        'mdx/code-blocks': true,
        'mdx/language-mapper': {js: 'jsx'},
        'mdx/ignore-remark-config': true,
        'mdx/remark-config-path': './.remarkrc.js',
      });
    });
  });

  describe('option: `lintCodeBlocks`', () => {
    it('creates `mdx/code-blocks` eslint config by default', async () => {
      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });

    it('creates `mdx/code-blocks` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({mdx: {lintCodeBlocks: true}});

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });

    it('does not create `mdx/code-blocks` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {lintCodeBlocks: false},
      });

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeUndefined();
    });

    it('creates `mdx/code-blocks` eslint config when set to object', async () => {
      const configResult = await computeEslintConfig({
        mdx: {lintCodeBlocks: {}},
      });

      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
    });

    it('applies custom files from option object to `mdx/setup/code-blocks-processor`', async () => {
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
    it('sets `impliedStrict` to `true` in code-blocks `parserOptions` by default', async () => {
      const configResult = await computeEslintConfig('mdx');
      const config = configResult.getConfigByUnPostfix('mdx/code-blocks');

      expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
        '{"ecmaFeatures": {"impliedStrict": true}}',
      );
    });

    it('sets `impliedStrict` to `true` in code-blocks `parserOptions` when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {codeBlocksImpliedStrictMode: true},
      });
      const config = configResult.getConfigByUnPostfix('mdx/code-blocks');

      expect(config?.languageOptions?.['parserOptions']).toMatchInlineSnapshot(
        '{"ecmaFeatures": {"impliedStrict": true}}',
      );
    });

    it('sets `impliedStrict` to `false` in code-blocks `parserOptions` when set to `false`', async () => {
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
    it('does not create `mdx/code-blocks/ignore` eslint config by default', async () => {
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

      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'no-console')).toBe(0);
      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'prefer-const')).toBe(0);
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

      expect(configResult.getRuleEntrySeverity('mdx/code-blocks', 'no-shadow')).toBe(0);
    });
  });
});
