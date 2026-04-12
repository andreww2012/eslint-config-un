const FIXTURES = {
  unformattedCodeBlock: 'unformatted-code-block.md',
} as const;

beforeEach(() => {
  addInstalledPackages({prettier: '3.0.0'});
});

describe('markdown: sub config `formatFencedCodeBlocks`', () => {
  describe('basic tests', () => {
    it('creates `markdown/format-fenced-code-blocks` eslint config when `prettier` is installed', async () => {
      const configResult = await computeEslintConfig('markdown');

      expect(configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks')).toBeDefined();
    });

    it('does not create `markdown/format-fenced-code-blocks` eslint config when `configFormatFencedCodeBlocks` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configFormatFencedCodeBlocks: false},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks'),
      ).toBeUndefined();
    });

    it('creates `markdown/format-fenced-code-blocks` eslint config when `configFormatFencedCodeBlocks` is `true`', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configFormatFencedCodeBlocks: true},
      });

      expect(configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks')).toBeDefined();
    });

    it('has default `files` in `markdown/format-fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configFormatFencedCodeBlocks: true},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks')?.files,
      ).toMatchInlineSnapshot(
        '["**/*.md/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,astro,svelte,graphql,gql,gjs,gts}"]',
      );
    });

    it('has no implicit `ignores` in `markdown/format-fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configFormatFencedCodeBlocks: true},
      });

      expect(
        configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks')?.ignores,
      ).toBeUndefined();
    });

    it('does not create `markdown/format-fenced-code-blocks` eslint config when `prettier` is not installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig('markdown');

      expect(
        configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks'),
      ).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('enables `prettier/prettier` rule in `markdown/format-fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdown: {configFormatFencedCodeBlocks: true},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown/format-fenced-code-blocks',
          'prettier/prettier',
        ),
      ).toBe(2);
    });

    it('`prettier/prettier` rule fires on a markdown file with an unformatted fenced code block', async () => {
      const results = await testEslintConfig(
        {markdown: {configFormatFencedCodeBlocks: true}},
        FIXTURES.unformattedCodeBlock,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.unformattedCodeBlock,
        'prettier/prettier',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Replace \`"hello"\` with \`'hello'\`"`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `markdown/format-fenced-code-blocks` eslint config', async () => {
        const FILES = ['docs/**/*.md/**/*.js'];

        const configResult = await computeEslintConfig({
          markdown: {configFormatFencedCodeBlocks: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `markdown/format-fenced-code-blocks` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          markdown: {configFormatFencedCodeBlocks: {files: []}},
        });

        expect(
          configResult.getConfigByUnPostfix('markdown/format-fenced-code-blocks'),
        ).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `markdown/format-fenced-code-blocks` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          markdown: {configFormatFencedCodeBlocks: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix(
          'markdown/format-fenced-code-blocks',
        )?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
      });
    });
  });
});
