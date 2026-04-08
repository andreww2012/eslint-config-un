const FIXTURES = {
  imgWithoutAlt: 'img-without-alt.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0'});
});

describe('vue: sub config `a11y`', () => {
  describe('basic tests', () => {
    it('creates `vue/a11y` eslint config by default', async () => {
      const configResult = await computeEslintConfig('vue');

      const config = configResult.getConfigByUnPostfix('vue/a11y');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.vue"]');
    });

    it('creates `vue/a11y` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({vue: {configA11y: true}});

      expect(configResult.getConfigByUnPostfix('vue/a11y')).toBeDefined();
    });

    it('does not create `vue/a11y` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({vue: {configA11y: false}});

      expect(configResult.getConfigByUnPostfix('vue/a11y')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleSeverities('vue/a11y')).toMatchObject({
        'vuejs-accessibility/alt-text': 2,
        'vuejs-accessibility/tabindex-no-positive': 2,
      });
    });

    it('`vuejs-accessibility/alt-text` rule fires on `<img>` without `alt`', async () => {
      const results = await testEslintConfig('vue', FIXTURES.imgWithoutAlt, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.imgWithoutAlt,
        'vuejs-accessibility/alt-text',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"img elements must have an alt prop, either with meaningful text, or an empty string for decorative images."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `vue/a11y` eslint config', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({vue: {configA11y: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('vue/a11y')?.files).toStrictEqual(FILES);
      });

      it('disables `vue/a11y` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({vue: {configA11y: {files: []}}});

        expect(configResult.getConfigByUnPostfix('vue/a11y')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vue/a11y` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({vue: {configA11y: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('vue/a11y')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `vue/a11y` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configA11y: {
            overrides: {'vuejs-accessibility/alt-text': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('vue/a11y')).toMatchObject({
        'vuejs-accessibility/alt-text': 0,
        'no-console': 0,
      });
    });
  });
});
