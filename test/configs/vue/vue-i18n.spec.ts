const FIXTURES = {
  templateWithRawText: 'template-with-raw-text.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0', 'vue-i18n': '9.0.0'});
});

describe('vue: sub config `i18n`', () => {
  describe('basic tests', () => {
    it('creates `vue/i18n` eslint config when `vue-i18n` is installed', async () => {
      const configResult = await computeEslintConfig('vue');

      const config = configResult.getConfigByUnPostfix('vue/i18n');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.vue"]');
    });

    it('does not create `vue/i18n` eslint config when `vue-i18n` is not installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig('vue');

      expect(configResult.getConfigByUnPostfix('vue/i18n')).toBeUndefined();
    });

    it('creates `vue/i18n` eslint config when set to `true`, regardless of `vue-i18n` installation', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig({vue: {configI18n: true}});

      expect(configResult.getConfigByUnPostfix('vue/i18n')).toBeDefined();
    });

    it('does not create `vue/i18n` eslint config when set to `false`, regardless of `vue-i18n` installation', async () => {
      const configResult = await computeEslintConfig({vue: {configI18n: false}});

      expect(configResult.getConfigByUnPostfix('vue/i18n')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getRuleSeverities('vue/i18n')).toMatchObject({
        'vue-i18n/no-html-messages': 2,
        'vue-i18n/key-format-style': 1,
        'vue-i18n/no-deprecated-tc': 0,
      });
    });

    it('`vue-i18n/no-raw-text` rule fires on raw text in Vue templates', async () => {
      const results = await testEslintConfig(
        'vue',
        FIXTURES.templateWithRawText,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.templateWithRawText,
        'vue-i18n/no-raw-text',
      );

      expect(error?.message).toMatchInlineSnapshot(`"raw text 'Hello World' is used"`);
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `vue/i18n` eslint config', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({vue: {configI18n: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('vue/i18n')?.files).toStrictEqual(FILES);
      });

      it('disables `vue/i18n` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({vue: {configI18n: {files: []}}});

        expect(configResult.getConfigByUnPostfix('vue/i18n')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vue/i18n` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({vue: {configI18n: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('vue/i18n')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `vue/i18n` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configI18n: {
            overrides: {'vue-i18n/no-html-messages': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('vue/i18n')).toMatchObject({
        'vue-i18n/no-html-messages': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `settings`', () => {
      it('does not set `vue-i18n` plugin settings when not provided', async () => {
        const configResult = await computeEslintConfig('vue');

        expect(
          configResult.getConfigByUnPostfix('vue/i18n')?.settings?.['vue-i18n'],
        ).toBeUndefined();
      });

      it('passes `settings` to `vue/i18n` eslint config when provided', async () => {
        const SETTINGS = {localeDir: 'src/locales/**'};

        const configResult = await computeEslintConfig({
          vue: {configI18n: {settings: SETTINGS}},
        });

        expect(configResult.getConfigByUnPostfix('vue/i18n')?.settings?.['vue-i18n']).toStrictEqual(
          SETTINGS,
        );
      });
    });

    describe('option: `vue-i18n` version', () => {
      it('enables `vue-i18n/no-deprecated-tc` and `vue-i18n/no-deprecated-v-t` rules when `vue-i18n` >=10 is installed', async () => {
        setInstalledPackages({vue: '3.5.0', 'vue-i18n': '10.0.0'});

        const configResult = await computeEslintConfig('vue');

        expect(configResult.getRuleSeverities('vue/i18n')).toMatchObject({
          'vue-i18n/no-deprecated-tc': 2,
          'vue-i18n/no-deprecated-v-t': 2,
        });
      });

      it('disables `vue-i18n/no-deprecated-tc` and `vue-i18n/no-deprecated-v-t` rules when `vue-i18n` <10 is installed', async () => {
        const configResult = await computeEslintConfig('vue');

        expect(configResult.getRuleSeverities('vue/i18n')).toMatchObject({
          'vue-i18n/no-deprecated-tc': 0,
          'vue-i18n/no-deprecated-v-t': 0,
        });
      });
    });
  });
});
