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
      await expectConfigState({}, 'package-json', false);
    });

    it('creates `package-json` eslint config if explicitly enabled', async () => {
      await expectConfigState('packageJson', 'package-json', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `package-json` eslint config by default', async () => {
      await expectConfigState({}, 'package-json', true, 'default');
    });

    it('creates `package-json` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('packageJson', 'package-json', ['packageJson', true], 'default');
    });

    it('does not create `package-json` eslint config if explicitly disabled', async () => {
      await expectConfigState({packageJson: false}, 'package-json', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `package-json` eslint config', async () => {
      await expectConfigState({}, 'package-json', true, 'misc-enabled');
    });

    it('creates `package-json` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('packageJson', 'package-json', ['packageJson', true], 'misc-enabled');
    });

    it('does not create `package-json` eslint config if explicitly disabled', async () => {
      await expectConfigState({packageJson: false}, 'package-json', false, 'misc-enabled');
    });
  });

  it('has default `files` in `package-json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('package-json')?.files).toMatchInlineSnapshot(
      '["**/package.json"]',
    );
  });

  it('has default `ignores` in `package-json` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('package-json')?.ignores?.length).toBeGreaterThan(0);
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

    it('disables `package-json` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({packageJson: {files: []}});

      expect(configResult.getConfigByUnPostfix('package-json')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `package-json` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({packageJson: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('package-json')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
    it('uses default order (`sort-package-json`) in `package-json/order-properties` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/order-properties'),
      ).toMatchInlineSnapshot('[2, {"order": "sort-package-json"}]');
    });

    it('uses provided order in `package-json/order-properties` rule', async () => {
      const ORDER = ['name', 'version'];

      const configResult = await computeEslintConfig({packageJson: {order: ORDER}});

      expect(
        configResult.getRuleEntryOptions('package-json', 'package-json/order-properties'),
      ).toStrictEqual([{order: ORDER}]);
    });
  });

  describe('`repositoryShorthand`', () => {
    it('uses default form (`object`) in `package-json/repository-shorthand` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/repository-shorthand'),
      ).toMatchInlineSnapshot('[2, {"form": "object"}]');
    });

    it('uses `shorthand` form in `package-json/repository-shorthand` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {repositoryShorthand: 'shorthand'},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/repository-shorthand'),
      ).toMatchInlineSnapshot('[2, {"form": "shorthand"}]');
    });
  });

  describe('`collectionsToSort`', () => {
    it('uses default collections in `package-json/sort-collections` rule', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/sort-collections'),
      ).toMatchInlineSnapshot(
        '[2, ["devDependencies", "dependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "overrides", "resolutions", "dependenciesMeta", "pnpm.allowedDeprecatedVersions", "pnpm.overrides", "pnpm.packageExtensions", "pnpm.patchedDependencies", "pnpm.peerDependencyRules.allowedVersions"]]',
      );
    });

    it('merges user-provided collections with defaults in `package-json/sort-collections` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {collectionsToSort: {scripts: true}},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/sort-collections'),
      ).toMatchInlineSnapshot(
        '[2, ["devDependencies", "dependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "overrides", "resolutions", "dependenciesMeta", "pnpm.allowedDeprecatedVersions", "pnpm.overrides", "pnpm.packageExtensions", "pnpm.patchedDependencies", "pnpm.peerDependencyRules.allowedVersions", "scripts"]]',
      );
    });

    it('allows disabling a default collection in `package-json/sort-collections` rule', async () => {
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

  describe('`propertiesAllowedToBeEmpty`', () => {
    it('ignores `browserslist` property by default in `package-json/no-empty-fields` rule by default', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2, {"ignoreProperties": ["browserslist"]}]');
    });

    it('uses user-provided properties in `package-json/no-empty-fields` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: ['config']},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2, {"ignoreProperties": ["config"]}]');
    });

    it('passes no options to `package-json/no-empty-fields` rule when set to empty array', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: []},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('2');
    });

    it('merges a record with the default list in `package-json/no-empty-fields` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: {config: true}},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2, {"ignoreProperties": ["browserslist", "config"]}]');
    });

    it('disables a default property via the record form in `package-json/no-empty-fields` rule', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: {config: true, browserslist: false}},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('[2, {"ignoreProperties": ["config"]}]');
    });

    it('passes no options to `package-json/no-empty-fields` rule when the default is disabled via the record form', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {propertiesAllowedToBeEmpty: {browserslist: false}},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/no-empty-fields'),
      ).toMatchInlineSnapshot('2');
    });
  });

  describe('`publishable`', () => {
    it('disables publishable-specific rules by default', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntrySeverity('package-json', 'package-json/require-description'),
      ).toBe(0);
    });

    it('enables publishable-specific rules when set to `true`', async () => {
      const configResult = await computeEslintConfig({packageJson: {publishable: true}});

      expect(
        configResult.getRuleEntrySeverity('package-json', 'package-json/require-description'),
      ).toBe(2);
    });
  });

  describe('`disallowUnnecessaryPropertiesInPrivatePackages`', () => {
    it('disables `package-json/restrict-private-properties` rule by default', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntrySeverity(
          'package-json',
          'package-json/restrict-private-properties',
        ),
      ).toBe(0);
    });

    it('enables `package-json/restrict-private-properties` rule when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {disallowUnnecessaryPropertiesInPrivatePackages: true},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/restrict-private-properties'),
      ).toMatchInlineSnapshot('2');
    });

    it('enables `package-json/restrict-private-properties` rule with custom blocked properties when set to a string array', async () => {
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

  describe('option: `banTopLevelProperties`', () => {
    it('disables `package-json/restrict-top-level-properties` rule by default', async () => {
      const configResult = await computeEslintConfig('packageJson');

      expect(
        configResult.getRuleEntrySeverity(
          'package-json',
          'package-json/restrict-top-level-properties',
        ),
      ).toBe(0);
    });

    it("enables `package-json/restrict-top-level-properties` rule with all popular tools when set to `'popularTools'`", async () => {
      const configResult = await computeEslintConfig({
        packageJson: {banTopLevelProperties: 'popularTools'},
      });

      expect(
        configResult.getRuleEntry('package-json', 'package-json/restrict-top-level-properties'),
      ).toMatchInlineSnapshot(
        '[2, {"ban": [{"message": "Configure AVA in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "ava"}, {"message": "Configure Babel in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "babel"}, {"message": "Configure Browserslist in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "browserslist"}, {"message": "Configure c8 in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "c8"}, {"message": "Configure commitlint in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "commitlint"}, {"message": "Configure ESLint in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "eslintConfig"}, {"message": "Configure Jest in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "jest"}, {"message": "Configure lint-staged in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "lint-staged"}, {"message": "Configure Mocha in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "mocha"}, {"message": "Configure nano-staged in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "nano-staged"}, {"message": "Configure nodemon in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "nodemonConfig"}, {"message": "Configure np in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "np"}, {"message": "Configure nyc in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "nyc"}, {"message": "Configure oclif in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "oclif"}, {"message": "Configure pnpm in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "pnpm"}, {"message": "Configure Prettier in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "prettier"}, {"message": "Configure semantic-release in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "release"}, {"message": "Configure release-it in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "release-it"}, {"message": "Configure Renovate in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "renovate"}, {"message": "Configure simple-git-hooks in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "simple-git-hooks"}, {"message": "Configure Size Limit in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "size-limit"}, {"message": "Configure Stylelint in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "stylelint"}, {"message": "Configure tsd in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "tsd"}, {"message": "Configure TypeDoc in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "typedoc"}, {"message": "Configure Volta in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "volta"}, {"message": "Configure Wireit in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "wireit"}, {"message": "Configure XO in a dedicated config file to avoid bloating package.json and mixing concerns.", "property": "xo"}]}]',
      );
    });

    it('enables `package-json/restrict-top-level-properties` rule when set to an array of strings', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {banTopLevelProperties: ['prettier', 'babel']},
      });

      expect(
        configResult.getRuleEntryOptions(
          'package-json',
          'package-json/restrict-top-level-properties',
        ),
      ).toStrictEqual([{ban: [{property: 'prettier'}, {property: 'babel'}]}]);
    });

    it('enables `package-json/restrict-top-level-properties` rule when set to an object with `true` values', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {banTopLevelProperties: {prettier: true, babel: true}},
      });

      expect(
        configResult.getRuleEntryOptions(
          'package-json',
          'package-json/restrict-top-level-properties',
        ),
      ).toStrictEqual([{ban: [{property: 'prettier'}, {property: 'babel'}]}]);
    });

    it('enables `package-json/restrict-top-level-properties` rule with custom messages when set to an object with string values', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {
          banTopLevelProperties: {
            prettier: 'Use .prettierrc instead',
            babel: 'Use babel.config.js instead',
          },
        },
      });

      expect(
        configResult.getRuleEntryOptions(
          'package-json',
          'package-json/restrict-top-level-properties',
        ),
      ).toStrictEqual([
        {
          ban: [
            {property: 'prettier', message: 'Use .prettierrc instead'},
            {property: 'babel', message: 'Use babel.config.js instead'},
          ],
        },
      ]);
    });

    it('excludes `false` entries when set to an object with mixed `true`/`false` values', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {banTopLevelProperties: {prettier: true, babel: false}},
      });

      expect(
        configResult.getRuleEntryOptions(
          'package-json',
          'package-json/restrict-top-level-properties',
        ),
      ).toStrictEqual([{ban: [{property: 'prettier'}]}]);
    });

    it('disables `package-json/restrict-top-level-properties` rule when set to an object with all `false` values', async () => {
      const configResult = await computeEslintConfig({
        packageJson: {banTopLevelProperties: {prettier: false}},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'package-json',
          'package-json/restrict-top-level-properties',
        ),
      ).toBe(0);
    });
  });
});
