const FIXTURES = {
  nodeImportWithoutNodeProtocolPrefix: 'node-import-without-node-protocol-prefix.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('fastImport');

  it('loads `fast-import` plugin if used', () => {
    expect(configResult.getLoadedPlugin('fast-import')).toBeDefined();
  });

  it('creates `fast-import` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('fast-import')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `fast-import` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeUndefined();
    });

    it('creates `fast-import` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('fastImport');

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `fast-import` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeUndefined();
    });

    it('creates `fast-import` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('fastImport', {reset: true});

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeDefined();
    });

    it('does not create `fast-import` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({fastImport: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `fastImport` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `fast-import` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeUndefined();
    });
  });

  it('has no explicit `files` restriction in `fast-import` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('fast-import')?.files).toBeUndefined();
  });

  it('has default `ignores` in `fast-import` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('fast-import')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('fastImport');

  it('enables `fast-import/no-cycle` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('fast-import', 'fast-import/no-cycle')).toBe(2);
  });

  it('disables `fast-import/consistent-file-extensions` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('fast-import', 'fast-import/consistent-file-extensions'),
    ).toBe(0);
  });

  it('`fast-import/require-node-prefix` rule fires on a file that imports a Node.js built-in without the `node:` prefix', async () => {
    const results = await testEslintConfig(
      {
        fastImport: {
          settings: {rootDir: import.meta.dirname},
        },
      },
      FIXTURES.nodeImportWithoutNodeProtocolPrefix,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nodeImportWithoutNodeProtocolPrefix,
      'fast-import/require-node-prefix',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Import of Node.js built-in modules must use the `node:` prefix"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `fast-import` eslint config', async () => {
      const FILES = ['src/**/*.{js,ts}'];
      const configResult = await computeEslintConfig({
        fastImport: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('fast-import')?.files).toStrictEqual(FILES);
    });

    it('disables `fast-import` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        fastImport: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('fast-import')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `fast-import` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        fastImport: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('fast-import')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `fast-import` eslint config', async () => {
    const configResult = await computeEslintConfig({
      fastImport: {overrides: {'fast-import/no-cycle': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('fast-import', 'fast-import/no-cycle')).toBe(0);

    expect(configResult.getRuleEntrySeverity('fast-import', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `fast-import` eslint config', async () => {
      const configResult = await computeEslintConfig({
        fastImport: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('fast-import'), (ruleName) =>
          ruleName.startsWith('fast-import/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `fast-import` eslint config', async () => {
      const configResult = await computeEslintConfig({
        fastImport: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('fast-import'), (ruleName) =>
          ruleName.startsWith('fast-import/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('sets default `rootDir` when `settings` is not provided', async () => {
      const configResult = await computeEslintConfig('fastImport');

      const settings = configResult.getConfigByUnPostfix('fast-import')?.settings?.['fast-import'];

      expect(settings).toMatchObject({rootDir: expect.stringMatching(/[/\\]configs$/) as unknown});
    });

    it('merges user-provided `settings` into `fast-import` settings (e.g. overrides `rootDir`)', async () => {
      const SETTINGS = {rootDir: 'custom-root', mode: 'fix' as const};
      const configResult = await computeEslintConfig({fastImport: {settings: SETTINGS}});

      expect(
        configResult.getConfigByUnPostfix('fast-import')?.settings?.['fast-import'],
      ).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `enforceFileExtensions`', () => {
    it('disables `consistent-file-extensions` rule when `enforceFileExtensions` is not provided (default)', async () => {
      const configResult = await computeEslintConfig('fastImport');

      expect(
        configResult.getRuleEntrySeverity('fast-import', 'fast-import/consistent-file-extensions'),
      ).toBe(0);
    });

    it('enables `consistent-file-extensions` rule when `enforceFileExtensions` is provided', async () => {
      const configResult = await computeEslintConfig({
        fastImport: {enforceFileExtensions: {mode: 'always'}},
      });

      expect(
        configResult.getRuleEntry('fast-import', 'fast-import/consistent-file-extensions'),
      ).toMatchInlineSnapshot('[2, {"mode": "always"}]');
    });
  });

  describe('option: `restrictImports`', () => {
    it('disables `no-restricted-imports` rule when `restrictImports` is not provided (default)', async () => {
      const configResult = await computeEslintConfig('fastImport');

      expect(
        configResult.getRuleEntrySeverity('fast-import', 'fast-import/no-restricted-imports'),
      ).toBe(0);
    });

    it('enables `no-restricted-imports` rule when `restrictImports` is provided', async () => {
      const OPTIONS = {
        rules: [{type: 'built-in' as const, moduleSpecifier: 'fs', denied: ['*']}],
      };
      const configResult = await computeEslintConfig({
        fastImport: {restrictImports: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('fast-import', 'fast-import/no-restricted-imports'),
      ).toStrictEqual([OPTIONS]);
    });
  });
});
