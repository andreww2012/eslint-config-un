import {GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  fileInputWithImageAccept: 'file-input-with-image-accept.html',
} as const;

describe('unicorn: sub config `html`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/html` eslint config when the `html` config is disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/html')).toBeUndefined();
    });

    it('creates `unicorn/html` eslint config when the `html` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, html: true});

      const config = configResult.getConfigByUnPostfix('unicorn/html');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.htm?(l)"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_HTM_HTML]);
    });

    it('does not create `unicorn/html` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configHtml: false}, html: true});

      expect(configResult.getConfigByUnPostfix('unicorn/html')).toBeUndefined();
    });

    it('creates `unicorn/html` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configHtml: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/html')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, html: true});

      expect(configResult.getRuleSeverities('unicorn/html')).toMatchObject({
        'unicorn/no-invalid-file-input-accept': 2,
        'unicorn/no-missing-local-resource': 0,
      });
    });

    it('`unicorn/no-invalid-file-input-accept` rule fires on a file input with an invalid `accept`', async () => {
      const results = await testEslintConfig(
        {unicorn: true, html: true},
        FIXTURES.fileInputWithImageAccept,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.fileInputWithImageAccept,
        'unicorn/no-invalid-file-input-accept',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Prefer `.image` as the file input `accept` value."',
      );
    });

    it('does not apply the JS-only `unicorn` rules to HTML files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, html: true});

      expect(configResult.getRuleEntry('unicorn/html', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([
        GLOB_HTM_HTML,
      ]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/html` eslint config', async () => {
        const FILES = ['src/**/*.html'];

        const configResult = await computeEslintConfig({
          unicorn: {configHtml: {files: FILES}},
          html: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/html')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/html` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configHtml: {files: []}},
          html: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/html')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/html` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig({
          unicorn: {configHtml: {ignores: IGNORES}},
          html: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/html')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configHtml: {
            overrides: {'unicorn/no-invalid-file-input-accept': 0},
            overridesAny: {'no-console': 0},
          },
        },
        html: true,
      });

      expect(configResult.getRuleSeverities('unicorn/html')).toMatchObject({
        'unicorn/no-invalid-file-input-accept': 0,
        'no-console': 0,
      });
    });
  });
});
