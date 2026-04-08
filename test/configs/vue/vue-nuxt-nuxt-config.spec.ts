const FIXTURES = {
  nuxtConfigWithUnorderedKeys: 'nuxt.config.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0', nuxt: '3.0.0'});
});

describe('vue: sub config `nuxt/nuxtConfig`', () => {
  describe('basic tests', () => {
    it('creates `vue/nuxt/nuxt-config` eslint config when `nuxt` is installed', async () => {
      const configResult = await computeEslintConfig('vue');

      const config = configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/nuxt.config.?([cm])[jt]s?(x)"]');
    });

    it('does not create `vue/nuxt/nuxt-config` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vue: {configNuxt: {configNuxtConfig: false}},
      });

      expect(configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config')).toBeUndefined();
    });

    it('creates `vue/nuxt/nuxt-config` eslint config when set to `true`', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: {configNuxtConfig: true}}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config')).toBeDefined();
    });

    it('does not create `vue/nuxt/nuxt-config` eslint config when parent `configNuxt` is `false`', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: false}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getRuleSeverities('vue/nuxt/nuxt-config')).toMatchObject({
        'nuxt/nuxt-config-keys-order': 2,
        'nuxt/no-nuxt-config-test-key': 2,
      });
    });

    it('`nuxt/nuxt-config-keys-order` rule fires when config keys are in wrong order', async () => {
      const results = await testEslintConfig(
        {vue: {configNuxt: true}},
        FIXTURES.nuxtConfigWithUnorderedKeys,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.nuxtConfigWithUnorderedKeys,
        'nuxt/nuxt-config-keys-order',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Expected config key "modules" to come before "devtools""',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `vue/nuxt/nuxt-config` eslint config', async () => {
        const FILES = ['nuxt.config.ts'];

        const configResult = await computeEslintConfig({
          vue: {configNuxt: {configNuxtConfig: {files: FILES}}},
        });

        expect(configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `vue/nuxt/nuxt-config` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          vue: {configNuxt: {configNuxtConfig: {files: []}}},
        });

        expect(configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vue/nuxt/nuxt-config` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          vue: {configNuxt: {configNuxtConfig: {ignores: IGNORES}}},
        });

        const ignores = configResult.getConfigByUnPostfix('vue/nuxt/nuxt-config')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `vue/nuxt/nuxt-config` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configNuxt: {
            configNuxtConfig: {
              overrides: {'nuxt/nuxt-config-keys-order': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
      });

      expect(configResult.getRuleSeverities('vue/nuxt/nuxt-config')).toMatchObject({
        'nuxt/nuxt-config-keys-order': 0,
        'no-console': 0,
      });
    });
  });
});
