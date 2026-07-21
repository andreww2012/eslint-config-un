import {GLOB_MARKDOWN, GLOB_MDX} from '../../../src/constants';

const FIXTURES = {
  empty: 'empty.md',
} as const;

describe('unicorn: sub config `markdown`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/markdown` eslint config when every Markdown config is disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/markdown')).toBeUndefined();
    });

    it.each(['markdown', 'markdownLinks', 'markdownPreferences'] as const)(
      'creates `unicorn/markdown` eslint config when the `%s` config is enabled',
      async (configName) => {
        const configResult = await computeEslintConfig({unicorn: true, [configName]: true});

        const config = configResult.getConfigByUnPostfix('unicorn/markdown');

        expect(config).toBeDefined();
        expect(config?.files).toMatchInlineSnapshot('["**/*.md", "**/*.mdx"]');
        expect(config?.ignores).not.toIncludeAnyMembers([GLOB_MARKDOWN, GLOB_MDX]);
      },
    );

    it('does not create `unicorn/markdown` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {configMarkdown: false},
        markdown: true,
      });

      expect(configResult.getConfigByUnPostfix('unicorn/markdown')).toBeUndefined();
    });

    it('creates `unicorn/markdown` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configMarkdown: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/markdown')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, markdown: true});

      expect(configResult.getRuleSeverities('unicorn/markdown')).toMatchObject({
        'unicorn/no-empty-file': 2,
        'unicorn/no-missing-local-resource': 0,
      });
    });

    it('`unicorn/no-empty-file` rule fires on an empty Markdown file', async () => {
      const results = await testEslintConfig(
        {unicorn: true, markdown: true},
        FIXTURES.empty,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.empty,
        'unicorn/no-empty-file',
      );

      expect(error?.message).toMatchInlineSnapshot('"Empty files are not allowed."');
    });

    it('does not apply the JS-only `unicorn` rules to Markdown files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, markdown: true});

      expect(configResult.getRuleEntry('unicorn/markdown', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([
        GLOB_MARKDOWN,
        GLOB_MDX,
      ]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/markdown` eslint config', async () => {
        const FILES = ['docs/**/*.md'];

        const configResult = await computeEslintConfig({
          unicorn: {configMarkdown: {files: FILES}},
          markdown: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/markdown')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/markdown` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configMarkdown: {files: []}},
          markdown: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/markdown')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/markdown` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig({
          unicorn: {configMarkdown: {ignores: IGNORES}},
          markdown: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/markdown')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/markdown` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configMarkdown: {
            overrides: {'unicorn/no-empty-file': 0},
            overridesAny: {'no-console': 0},
          },
        },
        markdown: true,
      });

      expect(configResult.getRuleSeverities('unicorn/markdown')).toMatchObject({
        'unicorn/no-empty-file': 0,
        'no-console': 0,
      });
    });
  });
});
