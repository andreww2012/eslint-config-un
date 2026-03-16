beforeEach(() => {
  addInstalledPackages({'@docusaurus/core': '3.0.0'});
});

const FIXTURES = {
  noHtmlLinks: 'no-html-links.tsx',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('docusaurus');

  it('loads `docusaurus` plugin if used', () => {
    expect(configResult.getLoadedPlugin('docusaurus')).toBeDefined();
  });

  it('creates `docusaurus` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('docusaurus')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `docusaurus` eslint config', async () => {
      await expectConfigState({}, 'docusaurus', false);
    });

    it('creates `docusaurus` eslint config if explicitly enabled', async () => {
      await expectConfigState('docusaurus', 'docusaurus', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `docusaurus` eslint config when `@docusaurus/core` is installed', async () => {
      await expectConfigState({}, 'docusaurus', true, 'default');
    });

    it('creates `docusaurus` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('docusaurus', 'docusaurus', ['docusaurus', true], 'default');
    });

    it('does not create `docusaurus` eslint config if explicitly disabled', async () => {
      await expectConfigState({docusaurus: false}, 'docusaurus', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `docusaurus` eslint config when `@docusaurus/core` is installed', async () => {
      await expectConfigState({}, 'docusaurus', true, 'misc-enabled');
    });

    it('does not create `docusaurus` eslint config if explicitly disabled', async () => {
      await expectConfigState({docusaurus: false}, 'docusaurus', false, 'misc-enabled');
    });

    it('creates `docusaurus` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('docusaurus', 'docusaurus', ['docusaurus', true], 'misc-enabled');
    });
  });

  it('has default `files` in `docusaurus` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('docusaurus')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]sx"]',
    );
  });

  it('has default `ignores` in `docusaurus` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('docusaurus')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('docusaurus');

  it('enables `docusaurus/string-literal-i18n-messages` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('docusaurus', 'docusaurus/string-literal-i18n-messages'),
    ).toBe(2);
  });

  it('disables `docusaurus/no-untranslated-text` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('docusaurus', 'docusaurus/no-untranslated-text')).toBe(
      0,
    );
  });

  it('`docusaurus/no-html-links` rule fires on JSX with `<a>` tag', async () => {
    const results = await testEslintConfig('docusaurus', FIXTURES.noHtmlLinks, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.noHtmlLinks,
      'docusaurus/no-html-links',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Do not use an `<a>` element to navigate. Use the `<Link />` component from `@docusaurus/Link` instead. See: https://docusaurus.io/docs/docusaurus-core#link"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `docusaurus` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];
      const configResult = await computeEslintConfig({
        docusaurus: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('docusaurus')?.files).toStrictEqual(FILES);
    });

    it('disables `docusaurus` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        docusaurus: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('docusaurus')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `docusaurus` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        docusaurus: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('docusaurus')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `docusaurus` eslint config', async () => {
    const configResult = await computeEslintConfig({
      docusaurus: {
        overrides: {'docusaurus/no-html-links': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('docusaurus', 'docusaurus/no-html-links')).toBe(0);
    expect(configResult.getRuleEntrySeverity('docusaurus', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `docusaurus` eslint config', async () => {
      const configResult = await computeEslintConfig({
        docusaurus: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('docusaurus'), (ruleName) =>
          ruleName.startsWith('docusaurus/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `docusaurus` eslint config', async () => {
      const configResult = await computeEslintConfig({
        docusaurus: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('docusaurus'), (ruleName) =>
          ruleName.startsWith('docusaurus/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});
