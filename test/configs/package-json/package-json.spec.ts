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
  describe('`overrides`', async () => {
    const configResult = await computeEslintConfig({
      packageJson: {overrides: {'package-json/no-redundant-files': 1}},
    });

    it('respect `overrides`', () => {
      expect(
        JSON.stringify(
          configResult.getRuleEntry('package-json', 'package-json/no-redundant-files'),
        ),
      ).toMatchInlineSnapshot(`"1"`);
    });
  });

  describe('`overridesAny`', () => {
    it('respect `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {overridesAny: {'no-console': 0}},
      });

      expect(
        JSON.stringify(configResult.getRuleEntry('package-json', 'no-console')),
      ).toMatchInlineSnapshot(`"0"`);
    });

    it('respects both `overrides` and `overridesAny`', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {
          overrides: {'package-json/no-redundant-files': 1},
          overridesAny: {'no-console': 0},
        },
      });

      expect(
        JSON.stringify(
          configResult.getRuleEntry('package-json', 'package-json/no-redundant-files'),
        ),
      ).toMatchInlineSnapshot(`"1"`);

      expect(
        JSON.stringify(configResult.getRuleEntry('package-json', 'no-console')),
      ).toMatchInlineSnapshot(`"0"`);
    });

    it('puts `overridesAny` after `overrides`', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {
          overrides: {'package-json/no-redundant-files': 1},
          overridesAny: {'package-json/no-redundant-files': 2},
        },
      });

      expect(
        JSON.stringify(
          configResult.getRuleEntry('package-json', 'package-json/no-redundant-files'),
        ),
      ).toMatchInlineSnapshot(`"2"`);
    });
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
