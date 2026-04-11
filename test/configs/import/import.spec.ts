import {GLOB_MARKDOWN_ALL_CODE_BLOCKS} from '../../../src/constants';

const FIXTURES = {
  defaultExport: 'default-export.js',
  tsImportValid: 'ts-import-valid.ts',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('import');

  it('loads `import` plugin', () => {
    expect(configResult.getLoadedPlugin('import')).toBeDefined();
  });

  it('creates `import` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('import')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `import` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('import')).toBeUndefined();
    });

    it('creates `import` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig({import: true});

      expect(configResult.getConfigByUnPostfix('import')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `import` eslint config by default', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('import')).toBeDefined();
    });

    it('creates `import` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig('import', {reset: true});

      expect(configResult.getConfigByUnPostfix('import')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to enable `import` config because this is the default',
        ),
      ).toBe(true);
    });

    it('does not create `import` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({import: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('import')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `import` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('import')).toBeDefined();
    });
  });

  it('has no explicit `files` restriction in `import` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('import')?.files).toBeUndefined();
  });

  it('has default `ignores` in `import` eslint config (includes markdown code blocks)', () => {
    const ignores = configResult.getConfigByUnPostfix('import')?.ignores;

    expect(ignores?.length).toBeGreaterThan(1);
    expect(ignores).to.include.members([GLOB_MARKDOWN_ALL_CODE_BLOCKS]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('import');

  it('enables `import/no-default-export` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('import', 'import/no-default-export')).toBe(2);
  });

  it('disables `import/no-amd` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('import', 'import/no-amd')).toBe(0);
  });

  it('`import/no-default-export` rule fires on a file with a default export', async () => {
    const results = await testEslintConfig('import', FIXTURES.defaultExport, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.defaultExport,
      'import/no-default-export',
    );

    expect(error?.message).toMatchInlineSnapshot('"Prefer named exports."');
  });

  describe('typescript resolver', () => {
    it('does not report `import/no-unresolved` for a valid `.ts` import when typescript is enabled', async () => {
      const results = await testEslintConfig(
        {import: true, ts: true},
        FIXTURES.tsImportValid,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.tsImportValid,
        'import/no-unresolved',
      );

      expect(error).toBeUndefined();
    });

    it('includes `eslint-import-resolver-typescript` in `resolver-next` settings when typescript is enabled', async () => {
      const configResult = await computeEslintConfig({import: true, ts: true});

      const resolvers = configResult.getConfigByUnPostfix('import')?.settings?.[
        'import-x/resolver-next'
      ] as {name: string}[] | undefined;

      expect(resolvers).toIncludeAllMembers([
        expect.objectContaining({name: 'eslint-import-resolver-typescript'}),
      ]);
      expect(resolvers?.length).toBeGreaterThan(1); // Should still include node resolver
    });

    it('does not include typescript resolver in `resolver-next` settings when typescript is disabled', async () => {
      const configResult = await computeEslintConfig('import');

      const resolvers = configResult.getConfigByUnPostfix('import')?.settings?.[
        'import-x/resolver-next'
      ] as {name: string}[] | undefined;

      expect(resolvers).not.toIncludeAnyMembers([
        expect.objectContaining({name: 'eslint-import-resolver-typescript'}),
      ]);
      expect(resolvers?.length).toBeGreaterThan(0); // Should still include node resolver
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `import` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({import: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('import')?.files).toStrictEqual(FILES);
    });

    it('disables `import` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({import: {files: []}});

      expect(configResult.getConfigByUnPostfix('import')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `import` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({import: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('import')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `import` eslint config', async () => {
    const configResult = await computeEslintConfig({
      import: {
        overrides: {'import/no-default-export': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('import', 'import/no-default-export')).toBe(0);
    expect(configResult.getRuleEntrySeverity('import', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `import` eslint config', async () => {
      const configResult = await computeEslintConfig({import: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('import'), (ruleName) =>
          ruleName.startsWith('import/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `import` eslint config', async () => {
      const configResult = await computeEslintConfig({import: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('import'), (ruleName) =>
          ruleName.startsWith('import/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `allowDevDependencies`', () => {
    it('allows devDependencies by default when mode is not `lib`', async () => {
      const configResult = await computeEslintConfig('import');

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('disallows devDependencies by default when mode is `lib`', async () => {
      const configResult = await computeEslintConfig({import: true}, {un: {mode: 'lib'}});

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": false}]');
    });

    it('allows devDependencies for specific glob patterns', async () => {
      const PATTERNS = ['**/test/**', '**/spec/**'];

      const configResult = await computeEslintConfig({
        import: {allowDevDependencies: PATTERNS},
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: PATTERNS}]);
    });
  });

  describe('option: `extraneousDependenciesWhitelist`', () => {
    it('does not add whitelist to `no-extraneous-dependencies` rule when not provided', async () => {
      const configResult = await computeEslintConfig('import');

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('adds whitelist to `no-extraneous-dependencies` rule when provided', async () => {
      const WHITELIST = ['my-bundled-lib', 'another-lib'];

      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesWhitelist: WHITELIST},
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: true, whitelist: WHITELIST}]);
    });
  });

  describe('option: `isTypescriptEnabled`', () => {
    it('enables `import/named` and `import/no-deprecated` rules when `isTypescriptEnabled` is `false` (default)', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntrySeverity('import', 'import/named')).toBe(2);
      expect(configResult.getRuleEntrySeverity('import', 'import/no-deprecated')).toBe(1);
    });

    it('disables `import/named` and `import/no-deprecated` rules when `isTypescriptEnabled` is `true`', async () => {
      const configResult = await computeEslintConfig({import: {isTypescriptEnabled: true}});

      expect(configResult.getRuleEntrySeverity('import', 'import/named')).toBe(0);
      expect(configResult.getRuleEntrySeverity('import', 'import/no-deprecated')).toBe(0);
    });

    it('disables `import/named` and `import/no-deprecated` rules when `isTypescriptEnabled` is implicitly `true` (`ts` config is enabled)', async () => {
      const configResult = await computeEslintConfig({import: true, ts: true});

      expect(configResult.getRuleEntrySeverity('import', 'import/named')).toBe(0);
      expect(configResult.getRuleEntrySeverity('import', 'import/no-deprecated')).toBe(0);
    });
  });

  describe('option: `importPatternsToIgnoreWhenTryingToResolve`', () => {
    it('does not add `ignore` to `no-unresolved` rule options when not provided', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntry('import', 'import/no-unresolved')).toMatchInlineSnapshot(
        '[2, {}]',
      );
    });

    it('adds `ignore` to `no-unresolved` rule when provided as a string', async () => {
      const PATTERN = 'virtual:*';

      const configResult = await computeEslintConfig({
        import: {importPatternsToIgnoreWhenTryingToResolve: PATTERN},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/no-unresolved')).toStrictEqual([
        {ignore: [PATTERN]},
      ]);
    });

    it('adds `ignore` to `no-unresolved` rule when provided as an array', async () => {
      const PATTERNS = ['virtual:*', 'bun:*'];

      const configResult = await computeEslintConfig({
        import: {importPatternsToIgnoreWhenTryingToResolve: PATTERNS},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/no-unresolved')).toStrictEqual([
        {ignore: PATTERNS},
      ]);
    });
  });

  describe('option: `requireModuleExtensions`', () => {
    it('disables `import/extensions` rule when `requireModuleExtensions` is `false` (default)', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntrySeverity('import', 'import/extensions')).toBe(0);
    });

    it('enables `import/extensions` rule for all JS/TS extensions when `requireModuleExtensions` is `true`', async () => {
      const configResult = await computeEslintConfig({
        import: {requireModuleExtensions: true},
      });

      expect(configResult.getRuleEntry('import', 'import/extensions')).toMatchInlineSnapshot(
        '[2, "ignorePackages", {"checkTypeImports": true, "cjs": "always", "cts": "always", "js": "always", "jsx": "always", "mjs": "always", "mts": "always", "ts": "always", "tsx": "always"}]',
      );
    });

    it('enables `import/extensions` with `*` key controlling default when `requireModuleExtensions` is an object with `*`', async () => {
      const OPTIONS = {'*': 'always' as const, ts: 'never' as const};

      const configResult = await computeEslintConfig({
        import: {requireModuleExtensions: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/extensions')).toStrictEqual([
        'always',
        {...OPTIONS, checkTypeImports: true},
      ]);
    });

    it('enables `import/extensions` with `ignorePackages` default when `requireModuleExtensions` is an object without `*`', async () => {
      const configResult = await computeEslintConfig({
        import: {requireModuleExtensions: {ts: 'never'}},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/extensions')).toStrictEqual([
        'ignorePackages',
        {checkTypeImports: true, ts: 'never'},
      ]);
    });
  });

  describe('option: `noDuplicatesOptions`', () => {
    it('uses default `no-duplicates` rule options when not provided', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntry('import', 'import/no-duplicates')).toMatchInlineSnapshot(
        '[2, {"prefer-inline": true}]',
      );
    });

    it('merges provided options into `no-duplicates` rule', async () => {
      const OPTIONS = {considerQueryString: true};

      const configResult = await computeEslintConfig({
        import: {noDuplicatesOptions: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/no-duplicates')).toStrictEqual([
        {...OPTIONS, 'prefer-inline': true},
      ]);
    });
  });

  describe('option: `settings`', () => {
    it('does not add user settings to `import` config when not provided', async () => {
      const configResult = await computeEslintConfig('import');
      const config = configResult.getConfigByUnPostfix('import');

      expect(config?.settings?.['import-x/extensions']).toBeUndefined();
    });

    it('adds user-provided settings to `import` config with `import-x/` prefix', async () => {
      const EXTENSIONS = ['.ts', '.tsx', '.js'] as const;

      const configResult = await computeEslintConfig({
        import: {settings: {extensions: EXTENSIONS}},
      });

      expect(
        configResult.getConfigByUnPostfix('import')?.settings?.['import-x/extensions'],
      ).toStrictEqual(EXTENSIONS);
    });
  });
});
