import path from 'node:path';

const FIXTURES = {
  importBuiltinNodeModuleWithoutNodeProtocol: 'import-builtin-node-module-without-node-protocol.js',
  packageJsonWithEnginesNodeFrom14: 'package-json-engines-node-from-14',
  packageJsonWithEnginesNodeFrom20_11: 'package-json-engines-node-from-20-11',
  packageJsonWithoutEnginesNode: 'package-json-without-engines-node',
} as const;

const mockUserPackageJsonPath = (fixtureDirectory: string) => {
  vi.doMock(import('empathic/package'), () => ({
    up: () =>
      path.resolve(path.join(import.meta.dirname, 'fixtures', fixtureDirectory, 'package.json')),
  }));
};

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('node');

  it('loads `node` plugin if used', () => {
    expect(configResult.getLoadedPlugin('node')).toBeDefined();
  });

  it('creates `node` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('node')).toBeDefined();
  });

  it('`node` eslint config includes node.js globals', async () => {
    const globals = await import('globals');
    const nodeConfig = configResult.getConfigByUnPostfix('node');

    expect(nodeConfig?.languageOptions?.['globals']).toStrictEqual(globals.node);
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `node` eslint config', async () => {
      await expectConfigState({}, 'node', false);
    });

    it('creates `node` eslint config if explicitly enabled', async () => {
      await expectConfigState('node', 'node', true);
    });

    it('does not create `node` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({node: false}, 'node', ['node', false]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `node` eslint config', async () => {
      await expectConfigState({}, 'node', true, 'default');
    });

    it('creates `node` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('node', 'node', ['node', true], 'default');
    });

    it('does not create `node` eslint config if explicitly disabled', async () => {
      await expectConfigState({node: false}, 'node', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `node` eslint config', async () => {
      await expectConfigState({}, 'node', true, 'misc-enabled');
    });

    it('creates `node` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('node', 'node', ['node', true], 'misc-enabled');
    });

    it('does not create `node` eslint config if explicitly disabled', async () => {
      await expectConfigState({node: false}, 'node', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('node');

    expect(configResult.getRuleSeverities('node')).toMatchObject({
      'node/hashbang': 2,
      'node/global-require': 0,
    });
  });

  it('`node/prefer-node-protocol` rule works', async () => {
    const results = await testEslintConfig(
      'node',
      FIXTURES.importBuiltinNodeModuleWithoutNodeProtocol,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.importBuiltinNodeModuleWithoutNodeProtocol,
      'node/prefer-node-protocol',
    );

    expect(error?.message).toMatchInlineSnapshot('"Prefer `node:fs` over `fs`."');
  });

  describe("`unicorn/prefer-import-meta-properties` rule based on `engines.node` in user's package.json", () => {
    afterEach(() => {
      vi.doUnmock(import('empathic/package'));
    });

    it('enables the rule if supports `import.meta`', async () => {
      mockUserPackageJsonPath(FIXTURES.packageJsonWithEnginesNodeFrom20_11);

      const configResult = await computeEslintConfig('node');

      expect(
        configResult.getRuleEntrySeverity('node', 'unicorn/prefer-import-meta-properties'),
      ).toBe(2);
    });

    it('disables the rule if does not support `import.meta`', async () => {
      mockUserPackageJsonPath(FIXTURES.packageJsonWithEnginesNodeFrom14);

      const configResult = await computeEslintConfig('node');

      expect(
        configResult.getRuleEntrySeverity('node', 'unicorn/prefer-import-meta-properties'),
      ).toBe(0);
    });

    it('disables the rule if `engines.node` is not set in package.json', async () => {
      mockUserPackageJsonPath(FIXTURES.packageJsonWithoutEnginesNode);

      const configResult = await computeEslintConfig('node');

      expect(
        configResult.getRuleEntrySeverity('node', 'unicorn/prefer-import-meta-properties'),
      ).toBe(0);
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `node` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({node: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('node')?.files).toStrictEqual(FILES);
    });

    it('disables `node` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({node: {files: []}});

      expect(configResult.getConfigByUnPostfix('node')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `node` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({node: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('node')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `node` eslint config', async () => {
    const configResult = await computeEslintConfig({
      node: {overrides: {'node/no-sync': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('node', 'node/no-sync')).toBe(0);
    expect(configResult.getRuleEntrySeverity('node', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set plugin settings on `node` eslint config by default', async () => {
      const configResult = await computeEslintConfig('node');

      expect(configResult.getConfigByUnPostfix('node')?.settings?.['node']).toBeUndefined();
    });

    it('sets plugin settings on `node` eslint config when set', async () => {
      const PLUGIN_SETTINGS = {tsconfigPath: 'foo/tsconfig.json'};
      const configResult = await computeEslintConfig({node: {settings: PLUGIN_SETTINGS}});

      expect(configResult.getConfigByUnPostfix('node')?.settings?.['node']).toStrictEqual(
        PLUGIN_SETTINGS,
      );
    });
  });

  describe('option: `noUnsupportedFeaturesIgnores`', async () => {
    const configResult = await computeEslintConfig({
      node: {noUnsupportedFeaturesIgnores: {esBuiltins: ['Promise'], nodeBuiltins: []}},
    });

    it('adds ignored unsupported features to `node/no-unsupported-features/<group>` rule if `noUnsupportedFeaturesIgnores.<group>` is non-empty array', () => {
      expect(
        configResult.getRuleEntry('node', 'node/no-unsupported-features/es-builtins'),
      ).toMatchInlineSnapshot('[2, {"ignores": ["Promise"]}]');
    });

    it('does not add ignored unsupported features to `node/no-unsupported-features/<group>` rule if `noUnsupportedFeaturesIgnores.<group>` is not set', () => {
      expect(
        configResult.getRuleEntry('node', 'node/no-unsupported-features/es-syntax'),
      ).toMatchInlineSnapshot('[2]');
    });

    it('does not add ignored unsupported features to `node/no-unsupported-features/<group>` rule if `noUnsupportedFeaturesIgnores.<group>` is empty array', () => {
      expect(
        configResult.getRuleEntry('node', 'node/no-unsupported-features/node-builtins'),
      ).toMatchInlineSnapshot('[2]');
    });

    it('adds ignored unsupported features to `node/no-unsupported-features/es-syntax` rule if `noUnsupportedFeaturesIgnores.esSyntax` is non-empty array', async () => {
      const SYNTAX = ['modules' as const];

      const result = await computeEslintConfig({
        node: {noUnsupportedFeaturesIgnores: {esSyntax: SYNTAX}},
      });

      expect(
        result.getRuleEntryOptions('node', 'node/no-unsupported-features/es-syntax'),
      ).toStrictEqual([{ignores: SYNTAX}]);
    });

    it('adds ignored unsupported features to `node/no-unsupported-features/node-builtins` rule if `noUnsupportedFeaturesIgnores.nodeBuiltins` is non-empty array', async () => {
      const NODE_BUILTINS = ['fs' as const];

      const result = await computeEslintConfig({
        node: {noUnsupportedFeaturesIgnores: {nodeBuiltins: NODE_BUILTINS}},
      });

      expect(
        result.getRuleEntryOptions('node', 'node/no-unsupported-features/node-builtins'),
      ).toStrictEqual([{ignores: NODE_BUILTINS}]);
    });
  });

  describe('option: `preferGlobal`', async () => {
    const configResult = await computeEslintConfig({
      node: {preferGlobal: {buffer: false, console: true}},
    });

    it('sets `node/prefer-global/<feature>` to `never` if `preferGlobal.<feature>` is set to `false`', () => {
      expect(configResult.getRuleEntry('node', 'node/prefer-global/buffer')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
    });

    it('sets `node/prefer-global/<feature>` to `always` if `preferGlobal.<feature>` is set to `true`', () => {
      expect(configResult.getRuleEntry('node', 'node/prefer-global/console')).toMatchInlineSnapshot(
        '[2, "always"]',
      );
    });

    it('sets `node/prefer-global/console` to `never` if `preferGlobal.console` is `false`', async () => {
      const result = await computeEslintConfig({node: {preferGlobal: {console: false}}});

      expect(result.getRuleEntry('node', 'node/prefer-global/console')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
    });

    it('sets `node/prefer-global/<feature>` to `always` if `preferGlobal.<feature>` is not set', () => {
      expect(configResult.getRuleEntry('node', 'node/prefer-global/process')).toMatchInlineSnapshot(
        '[2, "always"]',
      );
    });

    it('sets remaining `node/prefer-global/<feature>` rules to `never` when set to `false`', async () => {
      const result = await computeEslintConfig({
        node: {
          preferGlobal: {
            crypto: false,
            process: false,
            textDecoder: false,
            textEncoder: false,
            timers: false,
            url: false,
            urlSearchParams: false,
          },
        },
      });

      expect(result.getRuleEntry('node', 'node/prefer-global/crypto')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
      expect(result.getRuleEntry('node', 'node/prefer-global/process')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
      expect(result.getRuleEntry('node', 'node/prefer-global/text-decoder')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
      expect(result.getRuleEntry('node', 'node/prefer-global/text-encoder')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
      expect(result.getRuleEntry('node', 'node/prefer-global/timers')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
      expect(result.getRuleEntry('node', 'node/prefer-global/url')).toMatchInlineSnapshot(
        '[2, "never"]',
      );
      expect(
        result.getRuleEntry('node', 'node/prefer-global/url-search-params'),
      ).toMatchInlineSnapshot('[2, "never"]');
    });
  });
});
