import {GLOB_CSS} from '../../../src/constants';

const FIXTURES = {
  fullViewportHeight: 'full-viewport-height.css',
} as const;

describe('css: sub config `unicorn`', () => {
  describe('basic tests', () => {
    it('creates `css/unicorn` eslint config and loads `cssicorn` plugin by default', async () => {
      const configResult = await computeEslintConfig('css');

      const config = configResult.getConfigByUnPostfix('css/unicorn');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.css"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_CSS]);

      expect(configResult.getLoadedPlugin('cssicorn')).toBeDefined();
    });

    it('creates `css/unicorn` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({css: {configUnicorn: true}});

      expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeDefined();
    });

    it('does not create `css/unicorn` eslint config and does not load `cssicorn` plugin when set to `false`', async () => {
      const configResult = await computeEslintConfig({css: {configUnicorn: false}});

      expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('css')).toBeDefined();
      expect(configResult.getLoadedPlugin('cssicorn')).toBeUndefined();
    });

    it('does not create `css/unicorn` eslint config when the parent config is disabled', async () => {
      const configResult = await computeEslintConfig({css: false});

      expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getRuleSeverities('css/unicorn')).toMatchObject({
        'cssicorn/prefer-explicit-viewport-units': 2,
        'cssicorn/prefer-short-hex-color': 0,
      });
    });

    it('`cssicorn/prefer-explicit-viewport-units` rule fires on a CSS file using `vh` units', async () => {
      const results = await testEslintConfig(
        'css',
        FIXTURES.fullViewportHeight,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.fullViewportHeight,
        'cssicorn/prefer-explicit-viewport-units',
      );

      expect(error?.message).toMatchInlineSnapshot('"Prefer `100dvh` over `100vh`."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('inherits `files` from the parent config', async () => {
        const FILES = ['src/**/*.css'];

        const configResult = await computeEslintConfig({css: {files: FILES}});

        expect(configResult.getConfigByUnPostfix('css/unicorn')?.files).toStrictEqual(FILES);
      });

      it('uses user-provided `files` in `css/unicorn` eslint config', async () => {
        const FILES = ['styles/**/*.css'];

        const configResult = await computeEslintConfig({
          css: {configUnicorn: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('css/unicorn')?.files).toStrictEqual(FILES);
      });

      it('disables `css/unicorn` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          css: {configUnicorn: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('css/unicorn')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `css/unicorn` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig({
          css: {configUnicorn: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('css/unicorn')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `css/unicorn` eslint config', async () => {
      const configResult = await computeEslintConfig({
        css: {
          configUnicorn: {
            overrides: {'cssicorn/prefer-explicit-viewport-units': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('css/unicorn')).toMatchObject({
        'cssicorn/prefer-explicit-viewport-units': 0,
        'no-console': 0,
      });
    });
  });
});
