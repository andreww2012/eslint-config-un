const FIXTURES = {
  htmlWithEmptyScript: 'html-with-empty-script.html',
  empty: 'empty.js',
} as const;

describe('unicorn: sub config `html-scripts`', () => {
  describe('basic tests', () => {
    it('creates `unicorn/html-scripts` eslint config when the `htmlScripts` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, htmlScripts: true});

      const config = configResult.getConfigByUnPostfix('unicorn/html-scripts');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.*/+([0-9])_script-+([0-9]).?(m)js"]');
    });

    it('does not create `unicorn/html-scripts` eslint config when the `htmlScripts` config is disabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, htmlScripts: false});

      expect(configResult.getConfigByUnPostfix('unicorn/html-scripts')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('disables `unicorn/no-empty-file` rule', async () => {
      const configResult = await computeEslintConfig({unicorn: true, htmlScripts: true});

      expect(configResult.getRuleSeverities('unicorn/html-scripts')).toStrictEqual({
        'unicorn/no-empty-file': 0,
      });
    });

    it('does not report `unicorn/no-empty-file` on an empty `<script>` tag', async () => {
      const results = await testEslintConfig(
        {unicorn: true, htmlScripts: true},
        FIXTURES.htmlWithEmptyScript,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.htmlWithEmptyScript,
          'unicorn/no-empty-file',
          {all: true},
        ),
      ).toBeEmpty();
    });

    it('keeps reporting `unicorn/no-empty-file` on an empty JS file', async () => {
      const results = await testEslintConfig(
        {unicorn: true, htmlScripts: true},
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
  });
});
