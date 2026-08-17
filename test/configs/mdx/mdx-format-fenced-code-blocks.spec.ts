const FIXTURES = {
  unformattedCodeBlock: 'unformatted-code-block.mdx',
} as const;

beforeEach(() => {
  addInstalledPackages({prettier: '3.8.0'});
});

describe('mdx: sub config `formatFencedCodeBlocks`', () => {
  describe('basic tests', () => {
    it('creates `mdx/format-fenced-code-blocks` eslint config by default (`prettier` is detected)', async () => {
      const configResult = await computeEslintConfig('mdx');

      const config = configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot(
        '["**/*.mdx/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,scss,astro,svelte,graphql,gql,gjs,gts}"]',
      );
      expect(config?.ignores).toBeUndefined();
    });

    it('does not create `mdx/format-fenced-code-blocks` eslint config when `prettier` is not installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig('mdx');

      expect(configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')).toBeUndefined();
    });

    it('does not create `mdx/format-fenced-code-blocks` eslint config when `configFormatFencedCodeBlocks` is `false`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {configFormatFencedCodeBlocks: false},
      });

      expect(configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')).toBeUndefined();
    });

    it('creates `mdx/format-fenced-code-blocks` eslint config when `configFormatFencedCodeBlocks` is `true`', async () => {
      const configResult = await computeEslintConfig({
        mdx: {configFormatFencedCodeBlocks: true},
      });

      expect(configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({
        mdx: {configFormatFencedCodeBlocks: true},
      });

      expect(configResult.getRuleSeverities('mdx/format-fenced-code-blocks')).toMatchObject({
        'prettier/prettier': 2,
      });
    });

    it('`prettier/prettier` rule fires on an mdx file with an unformatted fenced code block', async () => {
      const results = await testEslintConfig(
        {mdx: {configFormatFencedCodeBlocks: true}},
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
      it('uses user-provided `files` in `mdx/format-fenced-code-blocks` eslint config', async () => {
        const FILES = ['docs/**/*.mdx/**/*.js'];

        const configResult = await computeEslintConfig({
          mdx: {configFormatFencedCodeBlocks: {files: FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')?.files,
        ).toStrictEqual(FILES);
      });

      it('disables `mdx/format-fenced-code-blocks` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          mdx: {configFormatFencedCodeBlocks: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `mdx/format-fenced-code-blocks` eslint config', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          mdx: {configFormatFencedCodeBlocks: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
      });
    });

    it('respects `overrides` and `overridesAny` in `mdx/format-fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mdx: {
          configFormatFencedCodeBlocks: {
            overrides: {'prettier/prettier': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('mdx/format-fenced-code-blocks')).toMatchObject({
        'prettier/prettier': 0,
        'no-console': 0,
      });
    });
  });
});
