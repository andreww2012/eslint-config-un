const FIXTURES = {
  kitAppTemplate: 'kit-project/src/app.html',
} as const;

beforeEach(() => {
  addInstalledPackages({svelte: '5.34.3', '@sveltejs/kit': '2.27.0'});
});

describe('svelte: sub config `kitAppTemplate`', () => {
  describe('basic tests', () => {
    it('creates `svelte/kit-app-template` eslint config when `@sveltejs/kit` is installed and `html` config is enabled', async () => {
      const configResult = await computeEslintConfig({svelte: true, html: true});

      const config = configResult.getConfigByUnPostfix('svelte/kit-app-template');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/src/app.html"]');
    });

    it('does not create `svelte/kit-app-template` eslint config when `@sveltejs/kit` is not installed', async () => {
      setInstalledPackages({svelte: '5.34.3'});

      const configResult = await computeEslintConfig({svelte: true, html: true});

      expect(configResult.getConfigByUnPostfix('svelte/kit-app-template')).toBeUndefined();
    });

    it('does not create `svelte/kit-app-template` eslint config when `html` config is disabled', async () => {
      const configResult = await computeEslintConfig({svelte: true, html: false});

      expect(configResult.getConfigByUnPostfix('svelte/kit-app-template')).toBeUndefined();
    });

    it('creates `svelte/kit-app-template` eslint config when set to `true` and `html` config is disabled', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configKitAppTemplate: true},
        html: false,
      });

      expect(configResult.getConfigByUnPostfix('svelte/kit-app-template')).toBeDefined();
    });

    it('does not create `svelte/kit-app-template` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        svelte: {configKitAppTemplate: false},
        html: true,
      });

      expect(configResult.getConfigByUnPostfix('svelte/kit-app-template')).toBeUndefined();
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig({svelte: true, html: true});

      expect(configResult.getRuleSeverities('svelte/kit-app-template')).toMatchObject({
        'html/require-title': 0,
      });
    });

    it('`html/require-title` rule does not fire on the SvelteKit app template', async () => {
      const results = await testEslintConfig(
        {svelte: true, html: true},
        FIXTURES.kitAppTemplate,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.kitAppTemplate, 'html/require-title'),
      ).toBeUndefined();
    });

    it('does not cause a parsing error on the SvelteKit app template when set to `true` and `html` config is disabled', async () => {
      const results = await testEslintConfig(
        {svelte: {configKitAppTemplate: true}, html: false},
        FIXTURES.kitAppTemplate,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.kitAppTemplate, 'html/require-title'),
      ).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `svelte/kit-app-template` eslint config', async () => {
        const FILES = ['app/template.html'] as const;

        const configResult = await computeEslintConfig({
          svelte: {configKitAppTemplate: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('svelte/kit-app-template')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `svelte/kit-app-template` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          svelte: {configKitAppTemplate: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('svelte/kit-app-template')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `svelte/kit-app-template` eslint config and merges them with the implicit defaults', async () => {
        const IGNORES = ['**/fixtures/**'] as const;

        const configResult = await computeEslintConfig({
          svelte: {configKitAppTemplate: {ignores: IGNORES}},
        });

        expect(
          configResult.getConfigByUnPostfix('svelte/kit-app-template')?.ignores,
        ).toIncludeAllMembers(IGNORES);
      });
    });

    it('respects `overrides` and `overridesAny` in `svelte/kit-app-template` eslint config', async () => {
      const configResult = await computeEslintConfig({
        svelte: {
          configKitAppTemplate: {
            overrides: {'html/require-title': 2},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('svelte/kit-app-template')).toMatchObject({
        'html/require-title': 2,
        'no-console': 0,
      });
    });
  });
});
