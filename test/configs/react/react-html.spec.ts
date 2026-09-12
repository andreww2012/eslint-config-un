const FIXTURES = {
  centerElement: 'center-element.jsx',
  divElement: 'div-element.jsx',
} as const;

beforeEach(() => {
  addInstalledPackages({react: '19.0.0'});
});

describe('react: sub config `html`', () => {
  describe('basic tests', () => {
    it('creates `react/html` eslint config and loads `html-react` plugin by default', async () => {
      const configResult = await computeEslintConfig('react');

      const config = configResult.getConfigByUnPostfix('react/html');

      expect(config).toBeDefined();
      expect(configResult.getLoadedPlugin('html-react')).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `react/html` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig({react: {configHtml: false}});

      expect(configResult.getConfigByUnPostfix('react/html')).toBeUndefined();
    });

    it('uses parent config `files` and `ignores` in `react/html` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({react: {files: FILES, ignores: IGNORES}});

      const config = configResult.getConfigByUnPostfix('react/html');

      expect(config?.files).toStrictEqual(FILES);
      expect(config?.ignores).toIncludeAllMembers(IGNORES);
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getRuleSeverities('react/html')).toMatchObject({
        'html-react/no-obsolete-tags': 2,
        'html-react/use-baseline': 1,
      });
    });

    it('`html-react/no-obsolete-tags` rule fires on an obsolete element', async () => {
      const result = await testEslintConfig('react', FIXTURES.centerElement, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.centerElement,
        'html-react/no-obsolete-tags',
      );

      expect(error?.message).toMatchInlineSnapshot('"Unexpected use of obsolete tag <center>"');
    });

    it('`html-react/no-obsolete-tags` rule does not fire on a non-obsolete element', async () => {
      const result = await testEslintConfig('react', FIXTURES.divElement, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.divElement,
        'html-react/no-obsolete-tags',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/html` eslint config', async () => {
        const FILES = ['src/**/*.jsx'];

        const configResult = await computeEslintConfig({react: {configHtml: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('react/html')?.files).toStrictEqual(FILES);
      });

      it('disables `react/html` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({react: {configHtml: {files: []}}});

        expect(configResult.getConfigByUnPostfix('react/html')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `react/html` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({react: {configHtml: {ignores: IGNORES}}});

        const ignores = configResult.getConfigByUnPostfix('react/html')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/html` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configHtml: {
            overrides: {'html-react/no-obsolete-tags': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('react/html')).toMatchObject({
        'html-react/no-obsolete-tags': 0,
        'no-console': 0,
      });
    });
  });
});
