import {GLOB_CSS} from '../../../src/constants';

const FIXTURES = {
  transitionAll: 'transition-all.css',
} as const;

describe('unicorn: sub config `css`', () => {
  describe('basic tests', () => {
    it('does not create `unicorn/css` eslint config when the `css` config is disabled', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('unicorn/css')).toBeUndefined();
    });

    it('creates `unicorn/css` eslint config when the `css` config is enabled', async () => {
      const configResult = await computeEslintConfig({unicorn: true, css: true});

      const config = configResult.getConfigByUnPostfix('unicorn/css');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.css"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_CSS]);
    });

    it('does not create `unicorn/css` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configCss: false}, css: true});

      expect(configResult.getConfigByUnPostfix('unicorn/css')).toBeUndefined();
    });

    it('creates `unicorn/css` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {configCss: true}});

      expect(configResult.getConfigByUnPostfix('unicorn/css')).toBeDefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({unicorn: true, css: true});

      expect(configResult.getRuleSeverities('unicorn/css')).toMatchObject({
        'unicorn/no-transition-all': 2,
        'unicorn/prefer-explicit-viewport-units': 0,
      });
    });

    it('keeps `unicorn/no-transition-all` out of the type information eslint config', async () => {
      const configResult = await computeEslintConfig({unicorn: true, css: true});

      expect(configResult.getConfigByUnPostfix('unicorn/css/@type-information')).toBeUndefined();
    });

    it('`unicorn/no-transition-all` rule fires on a CSS file transitioning `all`', async () => {
      const results = await testEslintConfig(
        {unicorn: true, css: true},
        FIXTURES.transitionAll,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.transitionAll,
        'unicorn/no-transition-all',
      );

      expect(error?.message).toMatchInlineSnapshot('"Do not use `all` as a transition property."');
    });

    it('does not apply the JS-only `unicorn` rules to CSS files', async () => {
      const configResult = await computeEslintConfig({unicorn: true, css: true});

      expect(configResult.getRuleEntry('unicorn/css', 'unicorn/no-lonely-if')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')?.ignores).toIncludeAllMembers([GLOB_CSS]);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `unicorn/css` eslint config', async () => {
        const FILES = ['src/**/*.css'];

        const configResult = await computeEslintConfig({
          unicorn: {configCss: {files: FILES}},
          css: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/css')?.files).toStrictEqual(FILES);
      });

      it('disables `unicorn/css` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          unicorn: {configCss: {files: []}},
          css: true,
        });

        expect(configResult.getConfigByUnPostfix('unicorn/css')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `unicorn/css` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig({
          unicorn: {configCss: {ignores: IGNORES}},
          css: true,
        });

        const ignores = configResult.getConfigByUnPostfix('unicorn/css')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `unicorn/css` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          configCss: {
            overrides: {'unicorn/no-transition-all': 0},
            overridesAny: {'no-console': 0},
          },
        },
        css: true,
      });

      expect(configResult.getRuleSeverities('unicorn/css')).toMatchObject({
        'unicorn/no-transition-all': 0,
        'no-console': 0,
      });
    });
  });
});
