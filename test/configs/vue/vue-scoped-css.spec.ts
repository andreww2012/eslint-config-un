import {GLOB_VUE} from '../../../src/constants';

const FIXTURES = {
  componentWithUnusedScopedSelector: 'component-with-unused-scoped-selector.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0'});
});

describe('vue: sub config `scopedCss`', () => {
  describe('basic tests', () => {
    it('creates `vue/scoped-css` eslint config by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getConfigByUnPostfix('vue/scoped-css')).toBeDefined();
    });

    it('lints the vue files only, the way every sibling config does', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getConfigByUnPostfix('vue/scoped-css')?.files).toStrictEqual([GLOB_VUE]);
    });

    it('creates `vue/scoped-css` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({vue: {configScopedCss: true}});

      expect(configResult.getConfigByUnPostfix('vue/scoped-css')).toBeDefined();
    });

    it('does not create `vue/scoped-css` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({vue: {configScopedCss: false}});

      expect(configResult.getConfigByUnPostfix('vue/scoped-css')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleSeverities('vue/scoped-css')).toMatchObject({
        'vue-scoped-css/no-unused-selector': 2,
        'vue-scoped-css/enforce-style-type': 0,
      });
    });

    it('`vue-scoped-css/no-unused-selector` rule fires on unused scoped selectors', async () => {
      const results = await testEslintConfig(
        'vue',
        FIXTURES.componentWithUnusedScopedSelector,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.componentWithUnusedScopedSelector,
        'vue-scoped-css/no-unused-selector',
      );

      expect(error?.message).toMatchInlineSnapshot('"The selector `.unused` is unused."');
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `vue/scoped-css` eslint config', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({vue: {configScopedCss: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('vue/scoped-css')?.files).toStrictEqual(FILES);
      });

      it('disables `vue/scoped-css` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({vue: {configScopedCss: {files: []}}});

        expect(configResult.getConfigByUnPostfix('vue/scoped-css')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vue/scoped-css` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          vue: {configScopedCss: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('vue/scoped-css')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `vue/scoped-css` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configScopedCss: {
            overrides: {'vue-scoped-css/no-unused-selector': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('vue/scoped-css')).toMatchObject({
        'vue-scoped-css/no-unused-selector': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `allowedStyleType`', () => {
      it('disables `vue-scoped-css/enforce-style-type` rule by default', async () => {
        const configResult = await computeEslintConfig('vue');

        expect(
          configResult.getRuleEntrySeverity('vue/scoped-css', 'vue-scoped-css/enforce-style-type'),
        ).toBe(0);
      });

      it('enables `vue-scoped-css/enforce-style-type` rule with `plain` and `scoped` allowed when set to object', async () => {
        const configResult = await computeEslintConfig({
          vue: {configScopedCss: {allowedStyleType: {module: false, plain: true}}},
        });

        expect(
          configResult.getRuleEntry('vue/scoped-css', 'vue-scoped-css/enforce-style-type'),
        ).toMatchInlineSnapshot('[2, {"allows": ["plain", "scoped"]}]');
      });

      it('disables `vue-scoped-css/enforce-style-type` rule when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          vue: {configScopedCss: {allowedStyleType: true}},
        });

        expect(
          configResult.getRuleEntrySeverity('vue/scoped-css', 'vue-scoped-css/enforce-style-type'),
        ).toBe(0);
      });
    });
  });
});
