const FIXTURES = {
  jsxWithDangerouslySetInnerHtmlProp: 'jsx-with-dangerously-set-inner-html-prop.jsx',
} as const;

describe('react: sub config `dom`', () => {
  beforeEach(() => {
    addInstalledPackages({react: '19.0.0', 'react-dom': '19.0.0'});
  });

  describe('basic tests', () => {
    it('creates `react/dom` eslint config when `react-dom` is installed', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getConfigByUnPostfix('react/dom')).toBeDefined();
    });

    it('does not create `react/dom` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({react: {configDom: false}});

      expect(configResult.getConfigByUnPostfix('react/dom')).toBeUndefined();
    });

    it('creates `react/dom` eslint config even when `react-dom` is not installed if explicitly enabled', async () => {
      setInstalledPackages({react: '19.0.0'});

      const configResult = await computeEslintConfig({react: {configDom: true}});

      expect(configResult.getConfigByUnPostfix('react/dom')).toBeDefined();
    });

    it('has default `files` in `react/dom` eslint config', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getConfigByUnPostfix('react/dom')?.files).toMatchInlineSnapshot(
        '["**/*.?([cm])[jt]s?(x)"]',
      );
    });

    it('has default `ignores` in `react/dom` eslint config', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getConfigByUnPostfix('react/dom')?.ignores?.length).toBeGreaterThan(0);
    });
  });

  describe('rules', () => {
    it('correctly sets severities by default', async () => {
      const configResult = await computeEslintConfig('react');

      expect(configResult.getRuleSeverities('react/dom')).toMatchObject({
        'eslint-react/dom-no-dangerously-set-innerhtml': 2,
        'eslint-react/dom-no-string-style-prop': 0,
      });
    });

    it('`eslint-react/dom/no-dangerously-set-innerhtml` rule fires on a component using `dangerouslySetInnerHTML`', async () => {
      const results = await testEslintConfig(
        'react',
        FIXTURES.jsxWithDangerouslySetInnerHtmlProp,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.jsxWithDangerouslySetInnerHtmlProp,
        'eslint-react/dom-no-dangerously-set-innerhtml',
      );

      expect(error?.message).toMatchInlineSnapshot(
        `"Using 'dangerouslySetInnerHTML' may have security implications."`,
      );
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `react/dom` eslint config', async () => {
        const FILES = ['src/**/*.jsx'];

        const configResult = await computeEslintConfig({
          react: {configDom: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('react/dom')?.files).toStrictEqual(FILES);
      });

      it('disables `react/dom` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          react: {configDom: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('react/dom')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `react/dom` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          react: {configDom: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('react/dom')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `react/dom` eslint config', async () => {
      const configResult = await computeEslintConfig({
        react: {
          configDom: {
            overrides: {'eslint-react/dom-no-dangerously-set-innerhtml': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(configResult.getRuleSeverities('react/dom')).toMatchObject({
        'eslint-react/dom-no-dangerously-set-innerhtml': 0,
        'no-console': 0,
      });
    });
  });
});
