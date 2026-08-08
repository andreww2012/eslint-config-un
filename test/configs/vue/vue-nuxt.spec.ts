const FIXTURES = {
  nuxtUsingProcessServer: 'nuxt-using-process-server-instead-of-import-meta-server.vue',
} as const;

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0', nuxt: '3.0.0'});
});

describe('vue: sub config `nuxt`', () => {
  describe('basic tests', () => {
    it('creates `vue/nuxt` eslint config and loads `nuxt` plugin when `nuxt` is installed', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getLoadedPlugin('nuxt')).toBeDefined();

      const config = configResult.getConfigByUnPostfix('vue/nuxt');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.vue"]');
    });

    it('does not create `vue/nuxt` eslint config and does not load `nuxt` plugin when `nuxt` is not installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig('vue');

      expect(configResult.getLoadedPlugin('nuxt')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt')).toBeUndefined();
    });

    it('creates `vue/nuxt` eslint config when set to `true`, regardless of `nuxt` installation', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt')).toBeDefined();
    });

    it('does not create `vue/nuxt` eslint config when set to `false`, regardless of `nuxt` installation', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: false}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getRuleSeverities('vue/nuxt')).toMatchObject({
        'nuxt/prefer-import-meta': 2,
        'nuxt/no-page-meta-runtime-values': 2,
      });
    });

    it('`nuxt/prefer-import-meta` rule fires when using `process.server`', async () => {
      const results = await testEslintConfig(
        {vue: {configNuxt: true}},
        FIXTURES.nuxtUsingProcessServer,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.nuxtUsingProcessServer,
        'nuxt/prefer-import-meta',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Replace `process.server` with `import.meta.server`."',
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `vue/nuxt` eslint config', async () => {
        const FILES = ['src/**/*.vue'];

        const configResult = await computeEslintConfig({vue: {configNuxt: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('vue/nuxt')?.files).toStrictEqual(FILES);
      });

      it('disables `vue/nuxt` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({vue: {configNuxt: {files: []}}});

        expect(configResult.getConfigByUnPostfix('vue/nuxt')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `vue/nuxt` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({vue: {configNuxt: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('vue/nuxt')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `vue/nuxt` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vue: {
          configNuxt: {
            overrides: {'nuxt/prefer-import-meta': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('vue/nuxt')).toMatchObject({
        'nuxt/prefer-import-meta': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `nuxtMajorVersion`', () => {
      it('uses nuxt 3 paths by default when nuxt 3 is installed', async () => {
        const configResult = await computeEslintConfig('vue');

        expect(
          configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
        ).toMatchInlineSnapshot(
          '["pages/**/*.vue", "views/**/*.vue", "layouts/**/*.vue", "app.vue", "error.vue"]',
        );
      });

      it('uses nuxt 4 paths when nuxt 4 is installed', async () => {
        setInstalledPackages({vue: '3.5.0', nuxt: '4.0.0'});

        const configResult = await computeEslintConfig('vue');

        expect(
          configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
        ).toMatchInlineSnapshot(
          '["app/pages/**/*.vue", "app/views/**/*.vue", "app/layouts/**/*.vue", "app/app.vue", "app/error.vue"]',
        );
      });

      it('uses nuxt 4 paths when `nuxtMajorVersion` is set to `4`', async () => {
        const configResult = await computeEslintConfig({vue: {configNuxt: {nuxtMajorVersion: 4}}});

        expect(
          configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
        ).toMatchInlineSnapshot(
          '["app/pages/**/*.vue", "app/views/**/*.vue", "app/layouts/**/*.vue", "app/app.vue", "app/error.vue"]',
        );
      });
    });

    describe('option: `v4DirectoryStructure`', () => {
      it('uses nuxt 3 paths when `v4DirectoryStructure` is set to `false`', async () => {
        const configResult = await computeEslintConfig({
          vue: {configNuxt: {v4DirectoryStructure: false}},
        });

        expect(
          configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
        ).not.toIncludeAnyMembers(['app/layouts/**/*.vue', 'app/app.vue', 'app/error.vue']);
      });

      it('uses nuxt 4 paths when `v4DirectoryStructure` is explicitly set to `true`', async () => {
        const configResult = await computeEslintConfig({
          vue: {configNuxt: {v4DirectoryStructure: true}},
        });

        expect(
          configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
        ).toIncludeAllMembers(['app/layouts/**/*.vue', 'app/app.vue', 'app/error.vue']);
      });
    });
  });

  // `vueOrNuxtProjectDir` lives on the parent `vue` config, but only this sub config's paths observe it.
  describe('option: `vueOrNuxtProjectDir` of the parent config', () => {
    it('uses no project directory prefix by default when nuxt 3 is installed', async () => {
      const configResult = await computeEslintConfig('vue');

      expect(configResult.getConfigByUnPostfix('vue/nuxt')?.files).toStrictEqual(['**/*.vue']);
    });

    it('uses `app` as the project directory by default when nuxt 4 is installed', async () => {
      setInstalledPackages({vue: '3.5.0', nuxt: '4.0.0'});

      const configResult = await computeEslintConfig('vue');

      expect(configResult.getConfigByUnPostfix('vue/nuxt')?.files).toStrictEqual(['app/**/*.vue']);
    });

    it('prefixes nuxt paths with the user-provided project directory', async () => {
      const PROJECT_DIR = 'source';

      const configResult = await computeEslintConfig({vue: {vueOrNuxtProjectDir: PROJECT_DIR}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt')?.files).toStrictEqual([
        `${PROJECT_DIR}/**/*.vue`,
      ]);
      expect(
        configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
      ).toIncludeAllMembers([`${PROJECT_DIR}/app.vue`, `${PROJECT_DIR}/layouts/**/*.vue`]);
    });
  });

  it('does not add nuxt-specific paths to `vue/allow-single-word-component-names` eslint config when sub config is disabled', async () => {
    const configResult = await computeEslintConfig({vue: {configNuxt: false}});

    expect(
      configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
    ).not.toIncludeAnyMembers(['layouts/**/*.vue', 'app.vue', 'error.vue']);
  });
});
