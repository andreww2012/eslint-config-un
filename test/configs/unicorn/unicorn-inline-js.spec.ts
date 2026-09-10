import {GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  htmlWithEmptyScript: 'html-with-empty-script.html',
  empty: 'empty.js',
} as const;

describe('unicorn: sub config `inline-js`', () => {
  describe('basic tests', () => {
    it('creates `unicorn/inline-js` eslint config when the `jsInline` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, jsInline: true});

      const config = configResult.getConfigByUnPostfix('unicorn/inline-js');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.htm?(l)"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_HTM_HTML]);
    });

    it('does not create `unicorn/inline-js` eslint config when the `jsInline` config is disabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, jsInline: false});

      expect(configResult.getConfigByUnPostfix('unicorn/inline-js')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('disables `unicorn/no-empty-file` rule', async () => {
      const configResult = await computeEslintConfig({unicorn: true, jsInline: true});

      expect(configResult.getRuleSeverities('unicorn/inline-js')).toStrictEqual({
        'unicorn/no-empty-file': 0,
      });
    });

    it('does not report `unicorn/no-empty-file` on an empty `<script>` tag', async () => {
      const results = await testEslintConfig(
        {unicorn: true, jsInline: true},
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
        {unicorn: true, jsInline: true},
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
