const FIXTURES = {
  redundantFiles: 'redundant-files/package.json',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('packageJson');

  it('loads `package-json` plugin if used', () => {
    expect(configResult.getLoadedPlugin('package-json')).toBeDefined();
  });

  it('creates `package-json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('package-json')).toBeDefined();
  });
});

describe('un options', () => {
  it('respects `overrides` and `overridesAny` in `package-json` eslint config', async () => {
    const configResult = await computeEslintConfig({
      packageJson: {
        overrides: {'package-json/no-redundant-files': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('package-json', 'package-json/no-redundant-files'),
      ),
    ).toBe(1);

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('package-json', 'no-console')),
    ).toBe(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('packageJson');

  it('enables `package-json/no-redundant-files` rule by default', () => {
    const ruleEntry = configResult.getRuleEntry('package-json', 'package-json/no-redundant-files');

    expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[2]"`);
  });

  it('does not enable `package-json/require-author` rule by default', () => {
    const ruleEntry = configResult.getRuleEntry('package-json', 'package-json/require-author');

    expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[0]"`);
  });

  it('`package-json/no-redundant-files` rule works', async () => {
    const results = await testEslintConfig(
      'packageJson',
      FIXTURES.redundantFiles,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.redundantFiles,
      'package-json/no-redundant-files',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Explicitly declaring "README.md" in "files" is unnecessary; it's included by default."`,
    );
  });
});

describe('options', () => {
  describe('`settings`', async () => {
    const PLUGIN_SETTINGS = {enforceForPrivate: true};

    const configResult = await computeEslintConfig({packageJson: {settings: PLUGIN_SETTINGS}});

    it('sets plugin settings on `package-json` eslint config', () => {
      expect(
        configResult.getConfigByUnPostfix('package-json')?.settings?.['packageJson'],
      ).toStrictEqual(PLUGIN_SETTINGS);
    });
  });

  describe.todo('`order`');

  describe.todo('`repositoryShorthand`');

  describe.todo('`collectionsToSort`');

  describe.todo('`enforceAbsoluteVersion`');

  describe.todo('`propertiesAllowedToBeEmpty`');

  describe.todo('`publishable`');

  describe.todo('`disallowUnnecessaryPropertiesInPrivatePackages`');
});
