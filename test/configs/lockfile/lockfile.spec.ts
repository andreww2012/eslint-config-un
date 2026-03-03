import type {NonEmptyTuple} from '../../../src/types';

// eslint-disable-next-line unicorn/no-array-sort
const ENABLED_PARSERS = ['json', 'yaml'].sort();
const PARSER_CONFIG_PREFIX = 'lockfile/parser/';

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('lockfile');

  it('loads `lockfile` plugin if used', () => {
    expect(configResult.getLoadedPlugin('lockfile')).toBeDefined();
  });

  it('creates `lockfile` and `lockfile/parser/<package manager>` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('lockfile')).toBeDefined();

    const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
      name.startsWith(PARSER_CONFIG_PREFIX),
    );

    expect(
      // eslint-disable-next-line unicorn/no-array-sort
      allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
    ).toStrictEqual(ENABLED_PARSERS);
  });

  it('does not create `lockfile` by default', async () => {
    const configResult = await computeEslintConfig({}, {reset: true});

    expect(configResult.getConfigByUnPostfix('lockfile')).toBeUndefined();
  });

  it('creates `lockfile` eslint config if explicitly enabled', async () => {
    const configResult = await computeEslintConfig({lockfile: true}, {reset: true});

    expect(configResult.getConfigByUnPostfix('lockfile')).toBeDefined();
  });

  it('does not create `lockfile` eslint config and prints a warning that there is no need to do that if explicitly disabled', async () => {
    using stderrSpy = vi.spyOn(process.stderr, 'write');

    const configResult = await computeEslintConfig({lockfile: false}, {reset: true});

    expect(configResult.getConfigByUnPostfix('lockfile')).toBeUndefined();

    expect(
      String(stderrSpy.mock.calls[0]?.[0]).startsWith(
        `[warn] [eslint-config-un] There is no need to disable \`lockfile\` config because this is the default`,
      ),
    ).toBe(true);
  });

  it('has default `files` in `lockfile` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('lockfile')?.files).toMatchInlineSnapshot(
      `["**/package-lock.json", "**/npm-shrinkwrap.json", "**/yarn.lock", "**/pnpm-lock.yaml", "**/bun.lock", "**/bun.lockb", "**/vlt-lock.json"]`,
    );
  });

  it('has default `ignores` in `lockfile` eslint config (does not ignore YAML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('lockfile')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members(['**/*.yaml']);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('lockfile');

  it('enables `lockfile/integrity` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('lockfile', 'lockfile/integrity'),
      ),
    ).toBe(2);
  });

  it('disables `lockfile/registry` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('lockfile', 'lockfile/registry'),
      ),
    ).toBe(0);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `lockfile` eslint config', async () => {
      const FILES = ['package-lock.json'];
      const configResult = await computeEslintConfig({
        lockfile: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('lockfile')?.files).toStrictEqual(FILES);
    });

    it('disables `lockfile` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('lockfile')).toBeUndefined();
    });

    it('only enables `json` parser config when `files` only match package-lock.json', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: ['**/package-lock.json']},
      });

      const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
        name.startsWith(PARSER_CONFIG_PREFIX),
      );

      expect(
        // eslint-disable-next-line unicorn/no-array-sort
        allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
      ).toStrictEqual(['json']);
    });

    it('only enables `json` parser config when `files` only match npm-shrinkwrap.json', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: ['**/npm-shrinkwrap.json']},
      });

      const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
        name.startsWith(PARSER_CONFIG_PREFIX),
      );

      expect(
        // eslint-disable-next-line unicorn/no-array-sort
        allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
      ).toStrictEqual(['json']);
    });

    it('only enables `yaml` parser config when `files` only match yarn.lock', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: ['**/yarn.lock']},
      });

      const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
        name.startsWith(PARSER_CONFIG_PREFIX),
      );

      expect(
        // eslint-disable-next-line unicorn/no-array-sort
        allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
      ).toStrictEqual(['yaml']);
    });

    it('only enables `yaml` parser config when `files` only match pnpm-lock.yaml', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: ['**/pnpm-lock.yaml']},
      });

      const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
        name.startsWith(PARSER_CONFIG_PREFIX),
      );

      expect(
        // eslint-disable-next-line unicorn/no-array-sort
        allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
      ).toStrictEqual(['yaml']);
    });

    it('only enables `json` parser config when `files` only match bun.lock', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: ['**/bun.lock']},
      });

      const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
        name.startsWith(PARSER_CONFIG_PREFIX),
      );

      expect(
        // eslint-disable-next-line unicorn/no-array-sort
        allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
      ).toStrictEqual(['json']);
    });

    it('only enables `json` parser config when `files` only match vlt-lock.json', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {files: ['**/vlt-lock.json']},
      });

      const allParserConfigs = configResult.getConfigsByUnPostfix((name) =>
        name.startsWith(PARSER_CONFIG_PREFIX),
      );

      expect(
        // eslint-disable-next-line unicorn/no-array-sort
        allParserConfigs.map(({name}) => name.slice(PARSER_CONFIG_PREFIX.length)).sort(),
      ).toStrictEqual(['json']);
    });

    it('prints a warning if some glob pattern does not match a known lockfile', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const FILES = ['pkg-lock.json', 'yarn.lock', 'bun.json'] satisfies NonEmptyTuple;
      await computeEslintConfig({
        lockfile: {files: FILES},
      });

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] The following file globs in the \`lockfile\` config could not be associated with a known package manager and may not be parsed correctly: ${FILES[0]}, ${FILES[2]}`,
        ),
      ).toBe(true);
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `lockfile` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        lockfile: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('lockfile')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `lockfile` eslint config', async () => {
    const configResult = await computeEslintConfig({
      lockfile: {overrides: {'lockfile/binary-conflicts': 0}, overridesAny: {'no-console': 0}},
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('lockfile', 'lockfile/binary-conflicts'),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('lockfile', 'no-console')),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `lockfile` eslint config', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('lockfile'), (ruleName) =>
          ruleName.startsWith('lockfile/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `lockfile` eslint config', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('lockfile'), (ruleName) =>
          ruleName.startsWith('lockfile/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `enforceAllowedRegistries`', () => {
    it('disables `lockfile/registry` rule when `enforceAllowedRegistries` is `false` (default)', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {enforceAllowedRegistries: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('lockfile', 'lockfile/registry'),
        ),
      ).toBe(0);
    });

    it('enables `lockfile/registry` rule when `enforceAllowedRegistries` is `true`', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {enforceAllowedRegistries: true},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('lockfile', 'lockfile/registry'),
        ),
      ).toBe(2);
    });

    it('enables `lockfile/registry` rule with options when `enforceAllowedRegistries` is an object', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {enforceAllowedRegistries: {'https://registry.npmjs.org': true}},
      });

      expect(configResult.getRuleEntry('lockfile', 'lockfile/registry')).toMatchInlineSnapshot(
        `[2, {"https://registry.npmjs.org": true}]`,
      );
    });
  });

  describe('option: `enforceLockfileVersion`', () => {
    it('disables `lockfile/version` rule when `enforceLockfileVersion` is not set (default)', async () => {
      const configResult = await computeEslintConfig('lockfile');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('lockfile', 'lockfile/version'),
        ),
      ).toBe(0);
    });

    it('enables `lockfile/version` rule when `enforceLockfileVersion` is set to an object', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {enforceLockfileVersion: {npm: 3}},
      });

      expect(configResult.getRuleEntry('lockfile', 'lockfile/version')).toMatchInlineSnapshot(
        `[2, {"npm": 3}]`,
      );
    });
  });

  describe('option: `enforcePackageManager`', () => {
    it('disables `lockfile/flavor` rule when `enforcePackageManager` is not set (default)', async () => {
      const configResult = await computeEslintConfig('lockfile');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('lockfile', 'lockfile/flavor'),
        ),
      ).toBe(0);
    });

    it('enables `lockfile/flavor` rule when `enforcePackageManager` is set', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {enforcePackageManager: 'pnpm'},
      });

      expect(configResult.getRuleEntry('lockfile', 'lockfile/flavor')).toMatchInlineSnapshot(
        `[2, "pnpm"]`,
      );
    });
  });

  describe('option: `noNonRegistryDependencySpecifiers`', () => {
    it('enables `lockfile/non-registry-specifiers` rule when `noNonRegistryDependencySpecifiers` is `true` (default)', async () => {
      const configResult = await computeEslintConfig('lockfile');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('lockfile', 'lockfile/non-registry-specifiers'),
        ),
      ).toBe(2);
    });

    it('disables `lockfile/non-registry-specifiers` rule when `noNonRegistryDependencySpecifiers` is `false`', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {noNonRegistryDependencySpecifiers: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('lockfile', 'lockfile/non-registry-specifiers'),
        ),
      ).toBe(0);
    });

    it('enables `lockfile/non-registry-specifiers` rule with options when `noNonRegistryDependencySpecifiers` is an object', async () => {
      const IGNORE_ENTRY = {specifier: 'github:my-org/some-private-pkg', explanation: 'internal'};
      const configResult = await computeEslintConfig({
        lockfile: {noNonRegistryDependencySpecifiers: {ignore: [IGNORE_ENTRY]}},
      });

      expect(
        configResult.getRuleEntry('lockfile', 'lockfile/non-registry-specifiers'),
      ).toMatchInlineSnapshot(
        `[2, {"ignore": [{"explanation": "internal", "specifier": "github:my-org/some-private-pkg"}]}]`,
      );
    });
  });

  describe('option: `packageSpecifiersToAllowLockfilesFor`', () => {
    it('enables `lockfile/shrinkwrap` with empty allowed list when `packageSpecifiersToAllowLockfilesFor` is not set (default)', async () => {
      const configResult = await computeEslintConfig('lockfile');

      expect(configResult.getRuleEntry('lockfile', 'lockfile/shrinkwrap')).toMatchInlineSnapshot(
        `[2, []]`,
      );
    });

    it('enables `lockfile/shrinkwrap` with specified packages when `packageSpecifiersToAllowLockfilesFor` is set', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {
          packageSpecifiersToAllowLockfilesFor: {'some-package': true, 'other-pkg': false},
        },
      });

      expect(configResult.getRuleEntry('lockfile', 'lockfile/shrinkwrap')).toMatchInlineSnapshot(
        `[2, ["some-package"]]`,
      );
    });
  });
});

describe('linting lockfiles', () => {
  const FIXTURES = {
    packageLockJson: 'npm/package-lock.json',
    yarnLock: 'yarn/yarn.lock',
    pnpmLockYaml: 'pnpm/pnpm-lock.yaml',
    bunLock: 'bun/bun.lock',
    vltLockJson: 'vlt/vlt-lock.json',
  } as const;

  it('does not crash when linting `package-lock.json`', async () => {
    const results = await testEslintConfig(
      'lockfile',
      FIXTURES.packageLockJson,
      import.meta.dirname,
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.fatalErrorCount).toBe(0);
  });

  it('does not crash when linting `yarn.lock`', async () => {
    const results = await testEslintConfig('lockfile', FIXTURES.yarnLock, import.meta.dirname);

    expect(results).toHaveLength(1);
    expect(results[0]?.fatalErrorCount).toBe(0);
  });

  it('does not crash when linting `pnpm-lock.yaml`', async () => {
    const results = await testEslintConfig('lockfile', FIXTURES.pnpmLockYaml, import.meta.dirname);

    expect(results).toHaveLength(1);
    expect(results[0]?.fatalErrorCount).toBe(0);
  });

  it('does not crash when linting `bun.lock`', async () => {
    const results = await testEslintConfig('lockfile', FIXTURES.bunLock, import.meta.dirname);

    expect(results).toHaveLength(1);
    expect(results[0]?.fatalErrorCount).toBe(0);
  });

  it('does not crash when linting `vlt-lock.json`', async () => {
    const results = await testEslintConfig('lockfile', FIXTURES.vltLockJson, import.meta.dirname);

    expect(results).toHaveLength(1);
    expect(results[0]?.fatalErrorCount).toBe(0);
  });

  describe('`lockfile/flavor` rule fires on disallowed lockfiles in the project', () => {
    it('does not report a violation when pnpm is configured as the package manager and workspace has pnpm-lock.yaml', async () => {
      const results = await testEslintConfig(
        {lockfile: {enforcePackageManager: 'pnpm'}},
        FIXTURES.pnpmLockYaml,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.pnpmLockYaml, 'lockfile/flavor'),
      ).toBeUndefined();
    });

    it('reports a violation when npm is enforced but workspace contains pnpm-lock.yaml', async () => {
      const results = await testEslintConfig(
        {lockfile: {enforcePackageManager: 'npm'}},
        FIXTURES.pnpmLockYaml,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.pnpmLockYaml, 'lockfile/flavor')?.message,
      ).toMatchInlineSnapshot(
        `"Lockfile \`pnpm-lock.yaml\` is not allowed. Allowed lockfiles: \`package-lock.json\`"`,
      );
    });
  });
});
