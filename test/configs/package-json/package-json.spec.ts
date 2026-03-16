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

  describe('mode: all configs are disabled', () => {
    it('does not create `package-json` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('package-json')).toBeUndefined();
    });

    it('creates `package-json` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(configResult.getConfigByUnPostfix('package-json')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `package-json` eslint config by default', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('package-json')).toBeDefined();
    });

    it('creates `package-json` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig('packageJson', {reset: true});

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to enable `packageJson` config because this is the default',
        ),
      ).toBe(true);
    });

    it('does not create `package-json` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({packageJson: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('package-json')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `package-json` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('package-json')).toBeDefined();
    });
  });

  it('has default `files` in `package-json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('package-json')?.files).toMatchInlineSnapshot(
      '["**/package.json"]',
    );
  });

  it('has default `ignores` in `package-json` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('package-json')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('packageJson');

  it('enables `package-json/no-redundant-files` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('package-json', 'package-json/no-redundant-files'),
    ).toBe(2);
  });

  it('does not enable `package-json/require-author` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('package-json', 'package-json/require-author')).toBe(
      0,
    );
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

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `package-json` eslint config', async () => {
      const FILES = ['package.json'];
      const configResult = await computeEslintConfig({packageJson: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('package-json')?.files).toStrictEqual(FILES);
    });

    it('disables `package-json` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({packageJson: {files: []}});

      expect(configResult.getConfigByUnPostfix('package-json')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `package-json` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({packageJson: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('package-json')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `package-json` eslint config', async () => {
    const configResult = await computeEslintConfig({
      packageJson: {
        overrides: {'package-json/no-redundant-files': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('package-json', 'package-json/no-redundant-files'),
    ).toBe(1);

    expect(configResult.getRuleEntrySeverity('package-json', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `package-json` eslint config', async () => {
      const configResult = await computeEslintConfig({packageJson: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('package-json'), (ruleName) =>
          ruleName.startsWith('package-json/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `package-json` eslint config', async () => {
      const configResult = await computeEslintConfig({packageJson: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('package-json'), (ruleName) =>
          ruleName.startsWith('package-json/'),
        ),
      ).toStrictEqual([1]);
    });
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

  describe('`order`', () => {
    it('uses default order (`sort-package-json`) in `order-properties` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/order-properties'),
      ).toMatchInlineSnapshot('[2, {"order": "sort-package-json"}]');
    });

    it('uses provided order in `order-properties` rule', async () => {
      const configResult = await computeEslintConfig({packageJson: {order: 'legacy'}});

      expect(
        configResult.getRuleEntry('package-json', 'package-json/order-properties'),
      ).toMatchInlineSnapshot('[2, {"order": "legacy"}]');
    });
  });

  describe('`repositoryShorthand`', () => {
    it('uses default form (`object`) in `repository-shorthand` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/repository-shorthand'),
      ).toMatchInlineSnapshot('[2, {"form": "object"}]');
    });

    it('uses `shorthand` form in `repository-shorthand` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {repositoryShorthand: 'shorthand'},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/repository-shorthand'),
      ).toMatchInlineSnapshot('[2, {"form": "shorthand"}]');
    });
  });

  describe('`collectionsToSort`', () => {
    it('uses default collections in `sort-collections` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/sort-collections'),
      ).toMatchInlineSnapshot(
        '[2, ["devDependencies", "dependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "overrides", "resolutions", "dependenciesMeta", "pnpm.allowedDeprecatedVersions", "pnpm.overrides", "pnpm.packageExtensions", "pnpm.patchedDependencies", "pnpm.peerDependencyRules.allowedVersions"]]',
      );
    });

    it('merges user-provided collections with defaults in `sort-collections` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {collectionsToSort: {scripts: true}},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/sort-collections'),
      ).toMatchInlineSnapshot(
        '[2, ["devDependencies", "dependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "overrides", "resolutions", "dependenciesMeta", "pnpm.allowedDeprecatedVersions", "pnpm.overrides", "pnpm.packageExtensions", "pnpm.patchedDependencies", "pnpm.peerDependencyRules.allowedVersions", "scripts"]]',
      );
    });

    it('allows disabling a default collection in `sort-collections` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {collectionsToSort: {dependencies: false}},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/sort-collections'),
      ).toMatchInlineSnapshot(
        '[2, ["devDependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "overrides", "resolutions", "dependenciesMeta", "pnpm.allowedDeprecatedVersions", "pnpm.overrides", "pnpm.packageExtensions", "pnpm.patchedDependencies", "pnpm.peerDependencyRules.allowedVersions"]]',
      );
    });
  });

  describe('`enforceAbsoluteVersion`', () => {
    it('disables `node-dependencies/absolute-version` rule when `enforceAbsoluteVersion` is `false` (default)', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntrySeverity('package-json', 'node-dependencies/absolute-version'),
      ).toBe(0);
    });

    it('enables `node-dependencies/absolute-version` rule with default options when `enforceAbsoluteVersion` is `true`', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {enforceAbsoluteVersion: true},
      });

      expect(
        configResult.getRuleEntry('package-json', 'node-dependencies/absolute-version'),
      ).toMatchInlineSnapshot(
        '[2, {"optionalDependencies": "ignore", "peerDependencies": "ignore"}]',
      );
    });

    it("enables `node-dependencies/absolute-version` rule when `enforceAbsoluteVersion` is `'never'`", async () => {
      const configResult = await computeEslintConfig({
        packageJson: {enforceAbsoluteVersion: 'never'},
      });

      expect(
        configResult.getRuleEntry('package-json', 'node-dependencies/absolute-version'),
      ).toMatchInlineSnapshot('[2, "never"]');
    });

    it('enables `node-dependencies/absolute-version` rule with custom options when `enforceAbsoluteVersion` is an object', async () => {
      const OPTIONS = {optionalDependencies: 'ignore', peerDependencies: 'always'} as const;

      const configResult = await computeEslintConfig({
        packageJson: {enforceAbsoluteVersion: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('package-json', 'node-dependencies/absolute-version'),
      ).toStrictEqual([OPTIONS]);
    });
  });

  describe('`propertiesAllowedToBeEmpty`', () => {
    it('ignores `browserslist` property by default in `no-empty-fields` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2, {"ignoreProperties": ["browserslist"]}]');
    });

    it('uses user-provided properties in `no-empty-fields` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: ['config']},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2, {"ignoreProperties": ["config"]}]');
    });

    it('passes no options to `no-empty-fields` rule when `propertiesAllowedToBeEmpty` is empty', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: []},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2]');
    });
  });

  describe('`publishable`', () => {
    it('disables publishable-specific rules when `publishable` is `false` (default)', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntrySeverity('package-json', 'package-json/require-description'),
      ).toBe(0);
    });

    it('enables publishable-specific rules when `publishable` is `true`', async () => {
      const configResult = await computeEslintConfig({packageJson: {publishable: true}});

      expect(
        configResult.getRuleEntrySeverity('package-json', 'package-json/require-description'),
      ).toBe(2);
    });
  });

  describe('`disallowUnnecessaryPropertiesInPrivatePackages`', () => {
    it('disables `restrict-private-properties` rule when `disallowUnnecessaryPropertiesInPrivatePackages` is `false` (default)', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntrySeverity(
          'package-json',
          'package-json/restrict-private-properties',
        ),
      ).toBe(0);
    });

    it('enables `restrict-private-properties` rule when `disallowUnnecessaryPropertiesInPrivatePackages` is `true`', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {disallowUnnecessaryPropertiesInPrivatePackages: true},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/restrict-private-properties'),
      ).toMatchInlineSnapshot('[2]');
    });

    it('enables `restrict-private-properties` rule with custom blocked properties when `disallowUnnecessaryPropertiesInPrivatePackages` is a string array', async () => {
      const PROPERTIES = ['funding', 'bugs'];

      const configResult = await computeEslintConfig({
        packageJson: {disallowUnnecessaryPropertiesInPrivatePackages: PROPERTIES},
      });

      expect(
        configResult.getRuleEntryOptions(
          'package-json',
          'package-json/restrict-private-properties',
        ),
      ).toStrictEqual([{blockedProperties: PROPERTIES}]);
    });
  });
});
