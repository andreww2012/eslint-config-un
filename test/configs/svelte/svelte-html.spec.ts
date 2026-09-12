const FIXTURES = {
  centerElement: 'center-element.svelte',
  divElement: 'div-element.svelte',
} as const;

beforeEach(() => {
  addInstalledPackages({svelte: '5.34.3'});
});

describe('svelte: sub config `html`', () => {
  describe('basic tests', () => {
    it('creates `svelte/html` eslint config and loads `html-svelte` plugin by default', async () => {
      const configResult = await computeEslintConfig('svelte');

      const config = configResult.getConfigByUnPostfix('svelte/html');

      expect(config).toBeDefined();
      expect(configResult.getLoadedPlugin('html-svelte')).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.svelte"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `svelte/html` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({svelte: {configHtml: false}});

      expect(configResult.getConfigByUnPostfix('svelte/html')).toBeUndefined();
    });

    it('uses parent config `files` and `ignores` in `svelte/html` eslint config', async () => {
      const FILES = ['src/**/*.svelte'];
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({svelte: {files: FILES, ignores: IGNORES}});

      const config = configResult.getConfigByUnPostfix('svelte/html');

      expect(config?.files).toStrictEqual(FILES);
      expect(config?.ignores).toIncludeAllMembers(IGNORES);
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('svelte');

      expect(configResult.getRuleSeverities('svelte/html')).toMatchObject({
        'html-svelte/no-obsolete-tags': 2,
        'html-svelte/use-baseline': 1,
      });
    });

    it('`html-svelte/no-obsolete-tags` rule fires on an obsolete element', async () => {
      const result = await testEslintConfig('svelte', FIXTURES.centerElement, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.centerElement,
        'html-svelte/no-obsolete-tags',
      );

      expect(error?.message).toMatchInlineSnapshot('"Unexpected use of obsolete tag <center>"');
    });

    it('`html-svelte/no-obsolete-tags` rule does not fire on a non-obsolete element', async () => {
      const result = await testEslintConfig('svelte', FIXTURES.divElement, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.divElement,
        'html-svelte/no-obsolete-tags',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `svelte/html` eslint config', async () => {
        const FILES = ['src/**/*.svelte'];

        const configResult = await computeEslintConfig({svelte: {configHtml: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('svelte/html')?.files).toStrictEqual(FILES);
      });

      it('disables `svelte/html` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({svelte: {configHtml: {files: []}}});

        expect(configResult.getConfigByUnPostfix('svelte/html')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `svelte/html` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({svelte: {configHtml: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('svelte/html')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `svelte/html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        svelte: {
          configHtml: {
            overrides: {'html-svelte/no-obsolete-tags': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('svelte/html')).toMatchObject({
        'html-svelte/no-obsolete-tags': 0,
        'no-console': 0,
      });
    });
  });
});
