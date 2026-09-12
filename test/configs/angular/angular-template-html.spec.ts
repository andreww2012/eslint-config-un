const FIXTURES = {
  centerElement: 'center-element.html',
  divElement: 'div-element.html',
} as const;

beforeEach(() => {
  addInstalledPackages({'@angular/core': '19.0.0'});
});

describe('angular: sub config `template/html`', () => {
  describe('basic tests', () => {
    it('creates `angular/template/html` eslint config and loads `html-angular` plugin by default', async () => {
      const configResult = await computeEslintConfig('angular');

      const config = configResult.getConfigByUnPostfix('angular/template/html');

      expect(config).toBeDefined();
      expect(configResult.getLoadedPlugin('html-angular')).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.html"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `angular/template/html` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        angular: {configTemplate: {configHtml: false}},
      });

      expect(configResult.getConfigByUnPostfix('angular/template/html')).toBeUndefined();
    });

    it('does not create `angular/template/html` eslint config by default when Angular version is below 18', async () => {
      addInstalledPackages({'@angular/core': '17.0.0'});

      const configResult = await computeEslintConfig('angular');

      expect(configResult.getConfigByUnPostfix('angular/template/html')).toBeUndefined();
    });

    it('creates `angular/template/html` eslint config when set to `true` even if Angular version is below 18', async () => {
      addInstalledPackages({'@angular/core': '17.0.0'});

      const configResult = await computeEslintConfig({
        angular: {configTemplate: {configHtml: true}},
      });

      expect(configResult.getConfigByUnPostfix('angular/template/html')).toBeDefined();
    });

    it('does not create `angular/template/html` eslint config when parent config is set to `false`', async () => {
      const configResult = await computeEslintConfig({angular: {configTemplate: false}});

      expect(configResult.getConfigByUnPostfix('angular/template/html')).toBeUndefined();
    });

    it('uses parent config `files` and `ignores` in `angular/template/html` eslint config', async () => {
      const FILES = ['src/**/*.component.html'];
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        angular: {configTemplate: {files: FILES, ignores: IGNORES}},
      });

      const config = configResult.getConfigByUnPostfix('angular/template/html');

      expect(config?.files).toStrictEqual(FILES);
      expect(config?.ignores).toIncludeAllMembers(IGNORES);
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('angular');

      expect(configResult.getRuleSeverities('angular/template/html')).toMatchObject({
        'html-angular/no-obsolete-tags': 2,
        'html-angular/use-baseline': 1,
      });
    });

    it('`html-angular/no-obsolete-tags` rule fires on an obsolete element', async () => {
      const result = await testEslintConfig('angular', FIXTURES.centerElement, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.centerElement,
        'html-angular/no-obsolete-tags',
      );

      expect(error?.message).toMatchInlineSnapshot('"Unexpected use of obsolete tag <center>"');
    });

    it('`html-angular/no-obsolete-tags` rule does not fire on a non-obsolete element', async () => {
      const result = await testEslintConfig('angular', FIXTURES.divElement, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.divElement,
        'html-angular/no-obsolete-tags',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `angular/template/html` eslint config', async () => {
        const FILES = ['src/**/*.html'];

        const configResult = await computeEslintConfig({
          angular: {configTemplate: {configHtml: {files: FILES}}},
        });

        expect(configResult.getConfigByUnPostfix('angular/template/html')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `angular/template/html` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {configHtml: {files: []}}},
        });

        expect(configResult.getConfigByUnPostfix('angular/template/html')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `angular/template/html` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          angular: {configTemplate: {configHtml: {ignores: IGNORES}}},
        });

        const ignores = configResult.getConfigByUnPostfix('angular/template/html')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `angular/template/html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        angular: {
          configTemplate: {
            configHtml: {
              overrides: {'html-angular/no-obsolete-tags': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
      });

      expect(configResult.getRuleSeverities('angular/template/html')).toMatchObject({
        'html-angular/no-obsolete-tags': 0,
        'no-console': 0,
      });
    });
  });
});
