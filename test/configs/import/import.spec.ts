import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';
import {TESTS_CONFIG_DEFAULT_FILES} from '../../../src/configs/shared';
import {GLOB_CONFIG_FILES, GLOB_MARKDOWN_ALL_CODE_BLOCKS} from '../../../src/constants';

const FIXTURES = {
  defaultExport: 'default-export.js',
  tsImportValid: 'ts-import-valid.ts',
} as const;

// Keeps the real resolver, but lets us see the options it was built with.
vi.mock(import('eslint-import-resolver-typescript'), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    createTypeScriptImportResolver: vi.fn<typeof createTypeScriptImportResolver>(
      original.createTypeScriptImportResolver,
    ),
  };
});

describe('basic tests', () => {
  it('creates `import` eslint config and loads `import` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('import');

    const config = configResult.getConfigByUnPostfix('import');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(1);
    expect(ignores).toIncludeAllMembers([GLOB_MARKDOWN_ALL_CODE_BLOCKS]);

    expect(configResult.getLoadedPlugin('import')).toBeDefined();
  });

  it('does not create `import` eslint config and does not load `import` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({import: false});

    expect(configResult.getConfigByUnPostfix('import')).toBeUndefined();
    expect(configResult.getLoadedPlugin('import')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `import` eslint config', async () => {
      await expectConfigState({}, 'import', false);
    });

    it('creates `import` eslint config if explicitly enabled', async () => {
      await expectConfigState('import', 'import', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `import` eslint config by default', async () => {
      await expectConfigState({}, 'import', true, 'default');
    });

    it('creates `import` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('import', 'import', ['import', true], 'default');
    });

    it('does not create `import` eslint config if explicitly disabled', async () => {
      await expectConfigState({import: false}, 'import', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `import` eslint config', async () => {
      await expectConfigState({}, 'import', true, 'misc-enabled');
    });

    it('creates `import` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('import', 'import', ['import', true], 'misc-enabled');
    });

    it('does not create `import` eslint config if explicitly disabled', async () => {
      await expectConfigState({import: false}, 'import', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('import');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('import')).toMatchObject({
      'import/no-default-export': 2,
      'import/no-deprecated': 1,
      'import/no-amd': 0,
    });
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

    it('disables `import` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({import: {files: []}});

      expect(configResult.getConfigByUnPostfix('import')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `import` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({import: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('import')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', () => {
  describe('option: `extraneousDependenciesCheck`', () => {
    const IGNORE_PATTERNS = ['**/test/**', '**/spec/**'];
    const PACKAGE_DIRS = ['.', 'packages/my-package'];
    const WHITELIST = ['my-bundled-lib', 'another-lib'];

    it('enables `import/no-extraneous-dependencies` rule and allows dev dependencies by default', async () => {
      const configResult = await computeEslintConfig('import');

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('flags dev dependencies outside of the test and config files by default when `mode` is `lib`', async () => {
      const configResult = await computeEslintConfig('import', {un: {mode: 'lib'}});

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot(
        '[2, {"devDependencies": ["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.{bench,benchmark}.?([cm])[jt]s?(x)", "**/*.cy.?([cm])[jt]s?(x)", "**/*.{stories,story}.?([cm])[jt]s?(x)", "**/*.config.?([cm])[jt]s?(x)", "**/.*rc.?([cm])[jt]s?(x)"]}]',
      );
    });

    it('respects the `files` of `tests` config in the default ignore patterns when `mode` is `lib`', async () => {
      const configResult = await computeEslintConfig(
        {import: true, tests: {files: IGNORE_PATTERNS}},
        {un: {mode: 'lib'}},
      );

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: [...IGNORE_PATTERNS, ...GLOB_CONFIG_FILES]}]);
    });

    it('uses the default value when option is `true`', async () => {
      const configResult = await computeEslintConfig(
        {import: {extraneousDependenciesCheck: true}},
        {un: {mode: 'lib'}},
      );

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: [...TESTS_CONFIG_DEFAULT_FILES, ...GLOB_CONFIG_FILES]}]);
    });

    it('disables `import/no-extraneous-dependencies` rule when option is `false`', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: false},
      });

      expect(configResult.getRuleEntrySeverity('import', 'import/no-extraneous-dependencies')).toBe(
        0,
      );
    });

    it('allows dev dependencies when `checkDevDependencies` is not set', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {}},
      });

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('allows dev dependencies when `checkDevDependencies` is `false`', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {checkDevDependencies: false}},
      });

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('flags dev dependencies everywhere when `checkDevDependencies` is `true`', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {checkDevDependencies: true}},
      });

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": false}]');
    });

    it('exempts `ignorePatterns` from the dev dependencies check', async () => {
      const configResult = await computeEslintConfig({
        import: {
          extraneousDependenciesCheck: {
            checkDevDependencies: {ignorePatterns: IGNORE_PATTERNS},
          },
        },
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: IGNORE_PATTERNS}]);
    });

    it('does not merge `ignorePatterns` with the default ones when `mode` is `lib`', async () => {
      const configResult = await computeEslintConfig(
        {
          import: {
            extraneousDependenciesCheck: {
              checkDevDependencies: {ignorePatterns: IGNORE_PATTERNS},
            },
          },
        },
        {un: {mode: 'lib'}},
      );

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: IGNORE_PATTERNS}]);
    });

    it('allows dev dependencies when `checkDevDependencies` is `false` and `mode` is `lib`', async () => {
      const configResult = await computeEslintConfig(
        {import: {extraneousDependenciesCheck: {checkDevDependencies: false}}},
        {un: {mode: 'lib'}},
      );

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('never reports the whitelisted packages', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {whitelist: WHITELIST}},
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: true, whitelist: WHITELIST}]);
    });

    it('looks up the dependencies in the given directory when `packageDir` is a string', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {packageDir: PACKAGE_DIRS[0]}},
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: true, packageDir: [PACKAGE_DIRS[0]]}]);
    });

    it('looks up the dependencies in all the given directories when `packageDir` is an array', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {packageDir: PACKAGE_DIRS}},
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: true, packageDir: PACKAGE_DIRS}]);
    });

    it('does not set `packageDir` rule option when the option is an empty array', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: {packageDir: []}},
      });

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('[2, {"devDependencies": true}]');
    });

    it('merges the object form with the default value', async () => {
      const configResult = await computeEslintConfig(
        {import: {extraneousDependenciesCheck: {whitelist: WHITELIST}}},
        {un: {mode: 'lib'}},
      );

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([
        {
          devDependencies: [...TESTS_CONFIG_DEFAULT_FILES, ...GLOB_CONFIG_FILES],
          whitelist: WHITELIST,
        },
      ]);
    });

    it('passes the rule options as-is when an array is provided', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: [{includeTypes: true, whitelist: WHITELIST}]},
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{includeTypes: true, whitelist: WHITELIST}]);
    });

    it('does not pass any rule options when an empty array is provided', async () => {
      const configResult = await computeEslintConfig({
        import: {extraneousDependenciesCheck: []},
      });

      expect(
        configResult.getRuleEntry('import', 'import/no-extraneous-dependencies'),
      ).toMatchInlineSnapshot('2');
    });

    it('passes the default ignore patterns to the function form', async () => {
      const configResult = await computeEslintConfig({
        import: {
          extraneousDependenciesCheck: (defaultIgnorePatterns) => [
            {devDependencies: defaultIgnorePatterns},
          ],
        },
      });

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([{devDependencies: [...TESTS_CONFIG_DEFAULT_FILES, ...GLOB_CONFIG_FILES]}]);
    });

    it('merges the value returned by the function form with the default value', async () => {
      const configResult = await computeEslintConfig(
        {import: {extraneousDependenciesCheck: () => ({whitelist: WHITELIST})}},
        {un: {mode: 'lib'}},
      );

      expect(
        configResult.getRuleEntryOptions('import', 'import/no-extraneous-dependencies'),
      ).toStrictEqual([
        {
          devDependencies: [...TESTS_CONFIG_DEFAULT_FILES, ...GLOB_CONFIG_FILES],
          whitelist: WHITELIST,
        },
      ]);
    });
  });

  describe('option: `isTypescriptEnabled`', () => {
    it('enables `import/named` and `import/no-deprecated` rules by default', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntrySeverity('import', 'import/named')).toBe(2);
      expect(configResult.getRuleEntrySeverity('import', 'import/no-deprecated')).toBe(1);
    });

    it('disables `import/named` and `import/no-deprecated` rules when set to `true`', async () => {
      const configResult = await computeEslintConfig({import: {isTypescriptEnabled: true}});

      expect(configResult.getRuleEntrySeverity('import', 'import/named')).toBe(0);
      expect(configResult.getRuleEntrySeverity('import', 'import/no-deprecated')).toBe(0);
    });

    it('disables `import/named` and `import/no-deprecated` rules when set to implicitly `true` (`ts` config is enabled)', async () => {
      const configResult = await computeEslintConfig({import: true, ts: true});

      expect(configResult.getRuleEntrySeverity('import', 'import/named')).toBe(0);
      expect(configResult.getRuleEntrySeverity('import', 'import/no-deprecated')).toBe(0);
    });
  });

  describe('option: `importPatternsToIgnoreWhenTryingToResolve`', () => {
    it('does not add `ignore` to `import/no-unresolved` rule options by default', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntry('import', 'import/no-unresolved')).toMatchInlineSnapshot(
        '[2, {}]',
      );
    });

    it('adds `ignore` to `import/no-unresolved` rule when provided as string', async () => {
      const PATTERN = 'virtual:*';

      const configResult = await computeEslintConfig({
        import: {importPatternsToIgnoreWhenTryingToResolve: PATTERN},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/no-unresolved')).toStrictEqual([
        {ignore: [PATTERN]},
      ]);
    });

    it('adds `ignore` to `import/no-unresolved` rule when provided as array', async () => {
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
    it('disables `import/extensions` rule by default', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntrySeverity('import', 'import/extensions')).toBe(0);
    });

    it('enables `import/extensions` rule for all JS/TS extensions when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        import: {requireModuleExtensions: true},
      });

      expect(configResult.getRuleEntry('import', 'import/extensions')).toMatchInlineSnapshot(
        '[2, "ignorePackages", {"checkTypeImports": true, "cjs": "always", "cts": "always", "js": "always", "jsx": "always", "mjs": "always", "mts": "always", "ts": "always", "tsx": "always"}]',
      );
    });

    it('enables `import/extensions` with `*` key controlling default when `requireModuleExtensions` is object with `*`', async () => {
      const OPTIONS = {'*': 'always' as const, ts: 'never' as const};

      const configResult = await computeEslintConfig({
        import: {requireModuleExtensions: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/extensions')).toStrictEqual([
        'always',
        {...OPTIONS, checkTypeImports: true},
      ]);
    });

    it('enables `import/extensions` with `ignorePackages` default when `requireModuleExtensions` is object without `*`', async () => {
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
    it('uses default `import/no-duplicates` rule options by default', async () => {
      const configResult = await computeEslintConfig('import');

      expect(configResult.getRuleEntry('import', 'import/no-duplicates')).toMatchInlineSnapshot(
        '[2, {"prefer-inline": true}]',
      );
    });

    it('merges provided options into `import/no-duplicates` rule', async () => {
      const OPTIONS = {considerQueryString: true};

      const configResult = await computeEslintConfig({
        import: {noDuplicatesOptions: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/no-duplicates')).toStrictEqual([
        {...OPTIONS, 'prefer-inline': true},
      ]);
    });
  });

  describe('option: `tsResolverOptions`', () => {
    it('builds the typescript resolver without options when option is not set', async () => {
      await computeEslintConfig({import: true, ts: true});

      expect(vi.mocked(createTypeScriptImportResolver)).toHaveBeenLastCalledWith(undefined);
    });

    it('passes user-provided options to the typescript resolver', async () => {
      const TS_RESOLVER_OPTIONS = {alwaysTryTypes: false} as const;

      await computeEslintConfig({
        import: {tsResolverOptions: TS_RESOLVER_OPTIONS},
        ts: true,
      });

      expect(vi.mocked(createTypeScriptImportResolver)).toHaveBeenLastCalledWith(
        TS_RESOLVER_OPTIONS,
      );
    });

    it('does not build the typescript resolver when the `ts` config is disabled', async () => {
      await computeEslintConfig({import: true, ts: false});

      expect(vi.mocked(createTypeScriptImportResolver)).not.toHaveBeenCalled();
    });
  });

  describe('option: `settings`', () => {
    it('does not add user settings to `import` config by default', async () => {
      const configResult = await computeEslintConfig('import');
      const config = configResult.getConfigByUnPostfix('import');

      expect(config?.settings?.['import-x/extensions']).toBeUndefined();
    });

    it('adds user-provided settings to `import` config with `import-x/` prefix', async () => {
      const EXTENSIONS = ['.ts', '.tsx', '.js'] as const;

      const configResult = await computeEslintConfig('import', {
        un: {plugins: {import: {settings: {extensions: EXTENSIONS}}}},
      });

      expect(
        configResult.getConfigByUnPostfix('import')?.settings?.['import-x/extensions'],
      ).toStrictEqual(EXTENSIONS);
    });
  });
});
