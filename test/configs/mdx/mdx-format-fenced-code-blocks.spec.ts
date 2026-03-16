beforeEach(() => {
  addInstalledPackages({prettier: '3.8.0'});
});

describe('basic tests', () => {
  it('creates `mdx/format-fenced-code-blocks` eslint config by default (prettier is detected)', async () => {
    const configResult = await computeEslintConfig('mdx');

    expect(configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')).toBeDefined();
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

  it('has default `files` in `mdx/format-fenced-code-blocks` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mdx: {configFormatFencedCodeBlocks: true},
    });

    expect(
      configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')?.files,
    ).toMatchInlineSnapshot(
      '["**/*.mdx/**/*.{?([cm])[jt]s?(x),vue,json,jsonc,json5,y?(a)ml,toml,htm?(l),css,astro,svelte,graphql,gql,gjs,gts}"]',
    );
  });

  it('has no implicit `ignores` in `mdx/format-fenced-code-blocks` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mdx: {configFormatFencedCodeBlocks: true},
    });

    expect(
      configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks')?.ignores,
    ).toBeUndefined();
  });
});

describe('rules', () => {
  it('enables `prettier/prettier` rule in `mdx/format-fenced-code-blocks` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mdx: {configFormatFencedCodeBlocks: true},
    });

    expect(
      configResult.getRuleEntrySeverity('mdx/format-fenced-code-blocks', 'prettier/prettier'),
    ).toBe(2);
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

    it('disables `mdx/format-fenced-code-blocks` eslint config when `files` is empty array', async () => {
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

      expect(ignores).to.include.members(IGNORES);
    });
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `mdx/format-fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mdx: {configFormatFencedCodeBlocks: {forceSeverity: 'error'}},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks'),
          (ruleName) => ruleName.startsWith('prettier/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `mdx/format-fenced-code-blocks` eslint config', async () => {
      const configResult = await computeEslintConfig({
        mdx: {configFormatFencedCodeBlocks: {forceSeverity: 'warn'}},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('mdx/format-fenced-code-blocks'),
          (ruleName) => ruleName.startsWith('prettier/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});
