import {GLOB_MDX} from '../../../src/constants';

const FIXTURES = {
  unclosedJsxTag: 'unclosed-jsx-tag.mdx',
} as const;

describe('basic tests', () => {
  it('creates `mdx/{mdx,setup/code-blocks-processor}` eslint configs and loads `mdx` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('mdx');

    const config = configResult.getConfigByUnPostfix('mdx/mdx');

    expect(config).toBeDefined();
    expect(configResult.getConfigByUnPostfix('mdx/code-blocks-processor')).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.mdx"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_MDX]);

    expect(configResult.getLoadedPlugin('mdx')).toBeDefined();
  });

  it('does not create `mdx/{mdx,setup/code-blocks-processor}` eslint configs and does not load `mdx` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({mdx: false});

    expect(configResult.getConfigByUnPostfix('mdx/mdx')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('mdx/code-blocks-processor')).toBeUndefined();
    expect(configResult.getLoadedPlugin('mdx')).toBeUndefined();
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
      await expectConfigState('mdx', 'mdx/mdx', ['mdx', true], 'misc-enabled');
    });

    it('does not create `mdx/mdx` eslint config if explicitly disabled', async () => {
      await expectConfigState({mdx: false}, 'mdx/mdx', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('mdx');

  // `mdx/remark` itself only reports when remark-lint plugins are configured in a remark config,
  // so what is verifiable here is that MDX files really go through the mdx parser.
  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('mdx/mdx')).toMatchObject({
      'mdx/remark': 1,
    });
  });

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

    it('disables `mdx/{mdx,setup/code-blocks-processor}` eslint configs, but not the sub-configs, when set to empty array', async () => {
      const configResult = await computeEslintConfig({mdx: {files: []}});

      expect(configResult.getConfigByUnPostfix('mdx/mdx')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('mdx/code-blocks-processor')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('mdx/code-blocks')).toBeDefined();
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
      const configResult = await computeEslintConfig('mdx', {
        un: {
          plugins: {
            mdx: {
              settings: {
                codeBlocks: true,
                languageMapper: {js: 'jsx'},
                ignoreRemarkConfig: true,
                remarkConfigPath: './.remarkrc.js',
              },
            },
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
});
