import path from 'node:path';

const FIXTURES = {
  importBuiltinNodeModuleWithoutNodeProtocol: 'import-builtin-node-module-without-node-protocol.js',
  packageJsonWithEnginesNodeFrom14: 'package-json-engines-node-from-14',
  packageJsonWithEnginesNodeFrom20_11: 'package-json-engines-node-from-20-11',
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
});

describe('un options', () => {
  it('respects `overrides` and `overridesAny` in `node` eslint config', async () => {
    const configResult = await computeEslintConfig({
      node: {overrides: {'node/no-sync': 0}, overridesAny: {'no-console': 0}},
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('node', 'node/no-sync')),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('node', 'no-console')),
    ).toBe(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('node');

  it('enables `node/hashbang` rule by default', () => {
    const ruleEntry = configResult.getRuleEntry('node', 'node/hashbang');

    expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[2]"`);
  });

  it('does not enable `node/global-require` rule by default', () => {
    const ruleEntry = configResult.getRuleEntry('node', 'node/global-require');

    expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[0]"`);
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

    expect(error?.message).toMatchInlineSnapshot(`"Prefer \`node:fs\` over \`fs\`."`);
  });

  describe("`unicorn/prefer-import-meta-properties` rule based on `engines.node` in user's package.json", () => {
    afterEach(() => {
      vi.doUnmock(import('empathic/package'));
    });

    it('enables the rule if supports `import.meta`', async () => {
      mockUserPackageJsonPath(FIXTURES.packageJsonWithEnginesNodeFrom20_11);

      const configResult = await computeEslintConfig('node');
      const ruleEntry = configResult.getRuleEntry('node', 'unicorn/prefer-import-meta-properties');

      expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[2]"`);
    });

    it('disables the rule if does not support `import.meta`', async () => {
      mockUserPackageJsonPath(FIXTURES.packageJsonWithEnginesNodeFrom14);

      const configResult = await computeEslintConfig('node');
      const ruleEntry = configResult.getRuleEntry('node', 'unicorn/prefer-import-meta-properties');

      expect(JSON.stringify(ruleEntry)).toMatchInlineSnapshot(`"[0]"`);
    });
  });
});

describe('options', () => {
  describe('`settings`', async () => {
    const PLUGIN_SETTINGS = {tsconfigPath: 'foo/tsconfig.json'};

    const configResult = await computeEslintConfig({node: {settings: PLUGIN_SETTINGS}});

    it('sets plugin settings on `node` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('node')?.settings?.['node']).toStrictEqual(
        PLUGIN_SETTINGS,
      );
    });
  });

  describe('`noUnsupportedFeaturesIgnores`', async () => {
    const configResult = await computeEslintConfig({
      node: {noUnsupportedFeaturesIgnores: {esBuiltins: ['Promise'], nodeBuiltins: []}},
    });

    it('adds ignored unsupported features to `node/no-unsupported-features/<group>` rule if `noUnsupportedFeaturesIgnores.<group>` is non-empty array', () => {
      expect(
        JSON.stringify(
          configResult.getRuleEntry('node', 'node/no-unsupported-features/es-builtins'),
        ),
      ).toMatchInlineSnapshot(`"[2,{"ignores":["Promise"]}]"`);
    });

    it('does not add ignored unsupported features to `node/no-unsupported-features/<group>` rule if `noUnsupportedFeaturesIgnores.<group>` is not set', () => {
      expect(
        JSON.stringify(configResult.getRuleEntry('node', 'node/no-unsupported-features/es-syntax')),
      ).toMatchInlineSnapshot(`"[2]"`);
    });

    it('does not add ignored unsupported features to `node/no-unsupported-features/<group>` rule if `noUnsupportedFeaturesIgnores.<group>` is empty array', () => {
      expect(
        JSON.stringify(
          configResult.getRuleEntry('node', 'node/no-unsupported-features/node-builtins'),
        ),
      ).toMatchInlineSnapshot(`"[2]"`);
    });
  });

  describe('`preferGlobal`', async () => {
    const configResult = await computeEslintConfig({
      node: {preferGlobal: {buffer: false, console: true}},
    });

    it('sets `node/prefer-global/<feature>` to `never` if `preferGlobal.<feature>` is set to `false`', () => {
      expect(
        JSON.stringify(configResult.getRuleEntry('node', 'node/prefer-global/buffer')),
      ).toMatchInlineSnapshot(`"[2,"never"]"`);
    });

    it('sets `node/prefer-global/<feature>` to `always` if `preferGlobal.<feature>` is set to `true`', () => {
      expect(
        JSON.stringify(configResult.getRuleEntry('node', 'node/prefer-global/console')),
      ).toMatchInlineSnapshot(`"[2,"always"]"`);
    });

    it('sets `node/prefer-global/<feature>` to `always` if `preferGlobal.<feature>` is not set', () => {
      expect(
        JSON.stringify(configResult.getRuleEntry('node', 'node/prefer-global/process')),
      ).toMatchInlineSnapshot(`"[2,"always"]"`);
    });
  });
});
