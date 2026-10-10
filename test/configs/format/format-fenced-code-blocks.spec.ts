import {GLOB_MD_X_CODE_BLOCKS} from '../../../src/constants';

const FIXTURES = {
  unformattedMarkdownCodeBlock: 'unformatted-code-block.md',
  unformattedMdxCodeBlock: 'unformatted-code-block.mdx',
} as const;

const CONFIG_POSTFIX = 'format/prettier/fenced-code-blocks';

beforeEach(() => {
  addInstalledPackages({prettier: '3.9.9'});
});

describe('format: sub config `fencedCodeBlocks`', () => {
  describe('basic tests', () => {
    it('creates `format/prettier/fenced-code-blocks` eslint config if set to `true`', async () => {
      const configResult = await computeEslintConfig({format: {configFencedCodeBlocks: true}});

      const config = configResult.getConfigByUnPostfix(CONFIG_POSTFIX);

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*.md/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,scss,astro,svelte,graphql,gql,gjs,gts}", "**/*.mdx/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,scss,astro,svelte,graphql,gql,gjs,gts}"]',
      );
      expect(config?.ignores).toBeUndefined();
    });

    it('does not create `format/prettier/fenced-code-blocks` eslint config by default', async () => {
      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)).toBeUndefined();
    });

    it('does not create `format/prettier/fenced-code-blocks` eslint config if set to `false`', async () => {
      const configResult = await computeEslintConfig({format: {configFencedCodeBlocks: false}});

      expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({format: {configFencedCodeBlocks: true}});

      expect(configResult.getRuleSeverities(CONFIG_POSTFIX)).toMatchObject({
        'format/prettier': 2,
      });
    });

    it('`format/prettier` rule fires on a Markdown file with an unformatted fenced code block', async () => {
      const results = await testEslintConfig(
        {
          markdown: true,
          format: {
            files: [],
            configFencedCodeBlocks: true,
            formatter: ['prettier', {singleQuote: true}],
          },
        },
        FIXTURES.unformattedMarkdownCodeBlock,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unformattedMarkdownCodeBlock,
        'format/prettier',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
    });

    it('`format/prettier` rule fires on an MDX file with an unformatted fenced code block', async () => {
      const results = await testEslintConfig(
        {
          mdx: true,
          format: {
            files: [],
            configFencedCodeBlocks: true,
            formatter: ['prettier', {singleQuote: true}],
          },
        },
        FIXTURES.unformattedMdxCodeBlock,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unformattedMdxCodeBlock,
        'format/prettier',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `format/prettier/fenced-code-blocks` eslint config', async () => {
        const FILES = ['docs/**/*.md/**/*.js'];

        const configResult = await computeEslintConfig({
          format: {configFencedCodeBlocks: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.files).toStrictEqual(FILES);
      });

      it('disables `format/prettier/fenced-code-blocks` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          format: {configFencedCodeBlocks: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `format/prettier/fenced-code-blocks` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          format: {configFencedCodeBlocks: {ignores: IGNORES}},
        });

        expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.ignores).toStrictEqual(IGNORES);
      });
    });

    it('respects `overrides` and `overridesAny` in `format/prettier/fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        format: {
          configFencedCodeBlocks: {
            overrides: {'format/prettier': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities(CONFIG_POSTFIX)).toMatchObject({
        'format/prettier': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `formatter`', () => {
      it('uses the formatter of the parent config when option is not set', async () => {
        addInstalledPackages({oxfmt: '0.72.0'});

        const configResult = await computeEslintConfig({
          format: {formatter: 'oxfmt', configFencedCodeBlocks: true},
        });

        expect(configResult.getConfigByUnPostfix('format/oxfmt/fenced-code-blocks')).toBeDefined();
      });

      it('uses its own formatter and options when option is set', async () => {
        addInstalledPackages({oxfmt: '0.72.0'});
        const OPTIONS = {printWidth: 100};

        const configResult = await computeEslintConfig({
          format: {configFencedCodeBlocks: {formatter: ['oxfmt', OPTIONS]}},
        });

        expect(configResult.getConfigByUnPostfix('format/prettier')).toBeDefined();
        expect(
          configResult.getRuleEntryOptions('format/oxfmt/fenced-code-blocks', 'format/oxfmt'),
        ).toStrictEqual([OPTIONS]);
      });

      it('does not create `format/oxfmt/fenced-code-blocks` eslint config and prints a warning when the formatter is not installed', async () => {
        using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

        const configResult = await computeEslintConfig({
          format: {configFencedCodeBlocks: {formatter: 'oxfmt'}},
        });

        expect(
          configResult.getConfigByUnPostfix('format/oxfmt/fenced-code-blocks'),
        ).toBeUndefined();
        expect(stderrSpy.mock.calls.flat().join('')).toContain(
          '[format/fencedCodeBlocks] `oxfmt` package is not installed',
        );
      });
    });

    describe('option: `readFormatterConfig`', () => {
      it('uses the value of the parent config when option is not set', async () => {
        const configResult = await computeEslintConfig({
          format: {readFormatterConfig: false, configFencedCodeBlocks: true},
        });

        expect(configResult.getRuleEntryOptions(CONFIG_POSTFIX, 'format/prettier')).toStrictEqual([
          {},
          {readConfig: false},
        ]);
      });

      it('takes precedence over the value of the parent config when option is set', async () => {
        const configResult = await computeEslintConfig({
          format: {readFormatterConfig: false, configFencedCodeBlocks: {readFormatterConfig: true}},
        });

        expect(configResult.getRuleEntryOptions(CONFIG_POSTFIX, 'format/prettier')).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('parent config', () => {
    it('formats fenced code blocks in the parent config by default', async () => {
      const configResult = await computeEslintConfig('format');

      expect(configResult.getConfigByUnPostfix('format/prettier')?.ignores).toBeUndefined();
    });

    it('stops formatting fenced code blocks in the parent config when the sub-config is enabled', async () => {
      const configResult = await computeEslintConfig({format: {configFencedCodeBlocks: true}});

      expect(configResult.getConfigByUnPostfix('format/prettier')?.ignores).toStrictEqual([
        GLOB_MD_X_CODE_BLOCKS,
      ]);
    });

    it('keeps fenced code blocks out of the parent config with user-provided `ignores`', async () => {
      const IGNORES = ['dist/**'];

      const configResult = await computeEslintConfig({
        format: {ignores: IGNORES, configFencedCodeBlocks: true},
      });

      expect(configResult.getConfigByUnPostfix('format/prettier')?.ignores).toStrictEqual([
        GLOB_MD_X_CODE_BLOCKS,
        ...IGNORES,
      ]);
    });

    it('only formats fenced code blocks when the parent config `files` is empty', async () => {
      const configResult = await computeEslintConfig({
        format: {files: [], configFencedCodeBlocks: true},
      });

      expect(configResult.getConfigByUnPostfix('format/prettier')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)).toBeDefined();
    });

    it('numbers `format/prettier/fenced-code-blocks` eslint configs in array notation', async () => {
      const configResult = await computeEslintConfig({
        format: [{configFencedCodeBlocks: true}, {configFencedCodeBlocks: true}],
      });

      expect(configResult.getConfigByUnPostfix(`${CONFIG_POSTFIX}#0`)).toBeDefined();
      expect(configResult.getConfigByUnPostfix(`${CONFIG_POSTFIX}#1`)).toBeDefined();
    });
  });
});
