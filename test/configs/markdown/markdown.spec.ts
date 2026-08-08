import {GLOB_MARKDOWN} from '../../../src/constants';
import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  skippedHeadingLevel: 'skipped-heading-level.md',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('markdown');

  it('loads `markdown` plugin if used', () => {
    expect(configResult.getLoadedPlugin('markdown')).toBeDefined();
  });

  it('creates `markdown/{markdown,setup/code-blocks-processor,code-blocks}` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('markdown/markdown')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('markdown/setup/code-blocks-processor')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `markdown/markdown` eslint config', async () => {
      await expectConfigState({}, 'markdown/markdown', false);
    });

    it('creates `markdown/markdown` eslint config if explicitly enabled', async () => {
      await expectConfigState('markdown', 'markdown/markdown', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `markdown/markdown` eslint config (enabled by default)', async () => {
      await expectConfigState({}, 'markdown/markdown', true, 'default');
    });

    it('creates `markdown/markdown` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('markdown', 'markdown/markdown', ['markdown', true], 'default');
    });

    it('does not create `markdown/markdown` eslint config if explicitly disabled', async () => {
      await expectConfigState({markdown: false}, 'markdown/markdown', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `markdown/markdown` eslint config', async () => {
      await expectConfigState({}, 'markdown/markdown', true, 'misc-enabled');
    });

    it('creates `markdown/markdown` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('markdown', 'markdown/markdown', ['markdown', true], 'misc-enabled');
    });

    it('does not create `markdown/markdown` eslint config if explicitly disabled', async () => {
      await expectConfigState({markdown: false}, 'markdown/markdown', false, 'misc-enabled');
    });
  });

  it('has default `files` in `markdown/markdown` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('markdown/markdown')?.files).toMatchInlineSnapshot(
      '["**/*.md"]',
    );
  });

  it('has default `ignores` in `markdown/markdown` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('markdown/markdown')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_MARKDOWN]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('markdown');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('markdown/markdown')).toMatchObject({
      'markdown/heading-increment': 2,
      'markdown/no-bare-urls': 0,
    });
  });

  it('`markdown/heading-increment` rule fires on a markdown file with a skipped heading level', async () => {
    const results = await testEslintConfig(
      'markdown',
      FIXTURES.skippedHeadingLevel,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.skippedHeadingLevel,
      'markdown/heading-increment',
    );

    expect(error?.message).toMatchInlineSnapshot('"Heading level skipped from 1 to 3."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `markdown/markdown` eslint config', async () => {
      const FILES = ['docs/**/*.md'];

      const configResult = await computeEslintConfig({markdown: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('markdown/markdown')?.files).toStrictEqual(FILES);
    });

    it('disables all `markdown` eslint configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({markdown: {files: []}});

      expect(configResult.getConfigByUnPostfix('markdown/markdown')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('markdown/setup/code-blocks-processor'),
      ).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `markdown/markdown` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({markdown: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('markdown/markdown')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `markdown/markdown` eslint config', async () => {
    const configResult = await computeEslintConfig({
      markdown: {
        overrides: {'markdown/heading-increment': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('markdown/markdown', 'markdown/heading-increment'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('markdown/markdown', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `lintMarkdown`', () => {
    it('creates `markdown/markdown` eslint config by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getConfigByUnPostfix('markdown/markdown')).toBeDefined();
    });

    it('creates `markdown/markdown` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({markdown: {lintMarkdown: true}});

      expect(configResult.getConfigByUnPostfix('markdown/markdown')).toBeDefined();
    });

    it('does not create `markdown/markdown` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({markdown: {lintMarkdown: false}});

      expect(configResult.getConfigByUnPostfix('markdown/markdown')).toBeUndefined();
    });
  });

  describe('option: `language`', () => {
    it('uses `gfm` dialect by default in `markdown/markdown` eslint config', async () => {
      const configResult = await computeEslintConfig('markdown');
      const config = configResult.getConfigByUnPostfix('markdown/markdown');

      expect(config?.language).toBe('markdown/gfm');
    });

    it('uses `commonmark` dialect when `language` is set to `commonmark`', async () => {
      const configResult = await computeEslintConfig({markdown: {language: 'commonmark'}});

      expect(configResult.getConfigByUnPostfix('markdown/markdown')?.language).toBe(
        'markdown/commonmark',
      );
    });

    it('sets `allowLabels` for GFM alerts in `markdown/no-missing-label-refs` rule when dialect is `gfm`', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(
        configResult.getRuleEntry('markdown/markdown', 'markdown/no-missing-label-refs'),
      ).toMatchInlineSnapshot(
        '[2, {"allowLabels": ["!note", "!NOTE", "!Note", "!tip", "!TIP", "!Tip", "!important", "!IMPORTANT", "!Important", "!warning", "!WARNING", "!Warning", "!caution", "!CAUTION", "!Caution"]}]',
      );
    });

    it('does not set `allowLabels` in `markdown/no-missing-label-refs` rule when dialect is `commonmark`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {language: 'commonmark'},
      });

      expect(
        configResult.getRuleEntry('markdown/markdown', 'markdown/no-missing-label-refs'),
      ).toMatchInlineSnapshot('[2, {}]');
    });

    it('creates `markdown/language-override/{i}` eslint config when `language` is array', async () => {
      const FILES = ['CHANGELOG.md'];

      const configResult = await computeEslintConfig({
        markdown: {language: [{language: 'commonmark', files: FILES}]},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/language-override/0')?.files,
      ).toStrictEqual(FILES);
    });

    it('does not create language override configs when `language` is a string', async () => {
      const configResult = await computeEslintConfig({
        markdown: {language: 'commonmark'},
      });

      expect(configResult.getConfigByUnPostfix('markdown/language-override/0')).toBeUndefined();
    });
  });

  describe('option: `allowHtmlTags`', () => {
    it('disables `markdown/no-html` rule by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getRuleEntrySeverity('markdown/markdown', 'markdown/no-html')).toBe(0);
    });

    it('disables `markdown/no-html` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({markdown: {allowHtmlTags: true}});

      expect(configResult.getRuleEntrySeverity('markdown/markdown', 'markdown/no-html')).toBe(0);
    });

    it('enables `markdown/no-html` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({markdown: {allowHtmlTags: false}});

      expect(configResult.getRuleEntrySeverity('markdown/markdown', 'markdown/no-html')).toBe(2);
    });

    it('enables `markdown/no-html` rule with `allowed` option when set to array', async () => {
      const ALLOWED_HTML_TAGS = ['details', 'summary'];

      const configResult = await computeEslintConfig({
        markdown: {allowHtmlTags: ALLOWED_HTML_TAGS},
      });

      expect(
        configResult.getRuleEntryOptions('markdown/markdown', 'markdown/no-html'),
      ).toStrictEqual([{allowed: ALLOWED_HTML_TAGS}]);
    });
  });

  describe('option: `lintCodeBlocks`', () => {
    it('creates `markdown/code-blocks` eslint config by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(
        configResult.getConfigByUnPostfix('markdown/code-blocks')?.files,
      ).toMatchInlineSnapshot(
        '["**/*.md/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,astro,svelte,graphql,gql,gjs,gts}"]',
      );
    });

    it('creates `markdown/code-blocks` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({markdown: {lintCodeBlocks: true}});

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeDefined();
    });

    it('does not create `markdown/code-blocks` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {lintCodeBlocks: false},
      });

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeUndefined();
    });

    it('creates `markdown/code-blocks` eslint config when `lintCodeBlocks` is object', async () => {
      const configResult = await computeEslintConfig({
        markdown: {lintCodeBlocks: {files: ['docs/**/*.md']}},
      });

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks')).toBeDefined();
    });

    it('applies custom files from `lintCodeBlocks` object to `markdown/setup/code-blocks-processor`', async () => {
      const FILES = ['docs/**/*.md'];

      const configResult = await computeEslintConfig({
        markdown: {lintCodeBlocks: {files: FILES}},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/setup/code-blocks-processor')?.files,
      ).toStrictEqual(FILES);
    });
  });

  describe('option: `codeBlocksIgnoredLanguages`', () => {
    it('does not create `markdown/code-blocks/ignore` eslint config by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getConfigByUnPostfix('markdown/code-blocks/ignore')).toBeUndefined();
    });

    it('creates `markdown/code-blocks/ignore` with correct ignores when array is provided', async () => {
      const configResult = await computeEslintConfig({
        markdown: {codeBlocksIgnoredLanguages: ['python', 'ruby']},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/code-blocks/ignore')?.ignores,
      ).toMatchInlineSnapshot('["**/*.md/**/*.{python,ruby}"]');
    });
  });

  describe('option: `codeBlocksAllowedLanguages`', () => {
    it('disables `markdown/fenced-code-language` rule by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(
        configResult.getRuleEntrySeverity('markdown/markdown', 'markdown/fenced-code-language'),
      ).toBe(0);
    });

    it('enables `markdown/fenced-code-language` rule with `required` when `codeBlocksAllowedLanguages` is array', async () => {
      const LANGUAGES = ['js', 'ts'] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({
        markdown: {codeBlocksAllowedLanguages: LANGUAGES},
      });

      expect(
        configResult.getRuleEntryOptions('markdown/markdown', 'markdown/fenced-code-language'),
      ).toStrictEqual([{required: LANGUAGES}]);
    });

    it('enables `markdown/fenced-code-language` rule without `required` when `codeBlocksAllowedLanguages` is `any-lang-required`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {codeBlocksAllowedLanguages: 'any-lang-required'},
      });

      expect(
        configResult.getRuleEntry('markdown/markdown', 'markdown/fenced-code-language'),
      ).toMatchInlineSnapshot('[2, {}]');
    });
  });

  describe('option: `codeBlocksImpliedStrictMode`', () => {
    it('sets `impliedStrict` to `true` in code-blocks `parserOptions` by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(
        configResult.getConfigByUnPostfix('markdown/code-blocks')?.languageOptions?.[
          'parserOptions'
        ],
      ).toStrictEqual({ecmaFeatures: {impliedStrict: true}});
    });

    it('sets `impliedStrict` to `true` in code-blocks `parserOptions` when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {codeBlocksImpliedStrictMode: true},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/code-blocks')?.languageOptions?.[
          'parserOptions'
        ],
      ).toStrictEqual({ecmaFeatures: {impliedStrict: true}});
    });

    it('sets `impliedStrict` to `false` in code-blocks `parserOptions` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {codeBlocksImpliedStrictMode: false},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/code-blocks')?.languageOptions?.[
          'parserOptions'
        ],
      ).toStrictEqual({ecmaFeatures: {impliedStrict: false}});
    });
  });

  describe('option: `parseFrontmatter`', () => {
    it('sets frontmatter to `yaml` in `markdown/markdown` eslint config by default', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(
        configResult.getConfigByUnPostfix('markdown/markdown')?.languageOptions?.['frontmatter'],
      ).toBe('yaml');
    });

    it('sets frontmatter to `toml` in `markdown/markdown` eslint config when set to provided', async () => {
      const configResult = await computeEslintConfig({
        markdown: {parseFrontmatter: 'toml'},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/markdown')?.languageOptions?.['frontmatter'],
      ).toBe('toml');
    });
  });

  describe('option: `overridesCodeBlocks`', () => {
    it('applies overrides to `markdown/code-blocks` eslint config rules', async () => {
      const configResult = await computeEslintConfig({
        markdown: {overridesCodeBlocks: {'no-console': 0}},
      });

      expect(configResult.getRuleEntrySeverity('markdown/code-blocks', 'no-console')).toBe(0);
    });
  });
});
