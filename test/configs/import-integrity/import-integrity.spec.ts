const FIXTURES = {
  nodeImportWithoutNodeProtocolPrefix: 'node-import-without-node-protocol-prefix.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('importIntegrity');

  it('loads `import-integrity` plugin if used', () => {
    expect(configResult.getLoadedPlugin('import-integrity')).toBeDefined();
  });

  it('creates `import-integrity` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('import-integrity')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `import-integrity` eslint config', async () => {
      await expectConfigState({}, 'import-integrity', false);
    });

    it('creates `import-integrity` eslint config if explicitly enabled', async () => {
      await expectConfigState('importIntegrity', 'import-integrity', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `import-integrity` eslint config', async () => {
      await expectConfigState({}, 'import-integrity', false, 'default');
    });

    it('creates `import-integrity` eslint config if explicitly enabled', async () => {
      await expectConfigState('importIntegrity', 'import-integrity', true, 'default');
    });

    it('does not create `import-integrity` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {importIntegrity: false},
        'import-integrity',
        ['importIntegrity', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `import-integrity` eslint config', async () => {
      await expectConfigState({}, 'import-integrity', false, 'misc-enabled');
    });

    it('creates `import-integrity` eslint config if explicitly enabled', async () => {
      await expectConfigState({importIntegrity: true}, 'import-integrity', true, 'misc-enabled');
    });

    it('does not create `import-integrity` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {importIntegrity: false},
        'import-integrity',
        ['importIntegrity', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `import-integrity` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('import-integrity')?.files).toBeUndefined();
  });

  it('has default `ignores` in `import-integrity` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('import-integrity')?.ignores?.length).toBeGreaterThan(
      0,
    );
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('importIntegrity');

  it('enables `import-integrity/no-cycle` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('import-integrity', 'import-integrity/no-cycle')).toBe(
      2,
    );
  });

  it('disables `import-integrity/no-unused-package-exports` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'import-integrity',
        'import-integrity/no-unused-package-exports',
      ),
    ).toBe(0);
  });

  it('`import-integrity/require-node-prefix` rule fires on a file that imports a Node.js built-in without the `node:` prefix', async () => {
    const results = await testEslintConfig(
      {
        importIntegrity: {
          settings: {packageRootDir: import.meta.dirname},
        },
      },
      FIXTURES.nodeImportWithoutNodeProtocolPrefix,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nodeImportWithoutNodeProtocolPrefix,
      'import-integrity/require-node-prefix',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Import of Node.js built-in modules must use the `node:` prefix"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `import-integrity` eslint config', async () => {
      const FILES = ['src/**/*.{js,ts}'];

      const configResult = await computeEslintConfig({importIntegrity: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('import-integrity')?.files).toStrictEqual(FILES);
    });

    it('disables `import-integrity` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({importIntegrity: {files: []}});

      expect(configResult.getConfigByUnPostfix('import-integrity')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `import-integrity` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({importIntegrity: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('import-integrity')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `import-integrity` eslint config', async () => {
    const configResult = await computeEslintConfig({
      importIntegrity: {
        overrides: {'import-integrity/no-cycle': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('import-integrity', 'import-integrity/no-cycle')).toBe(
      0,
    );
    expect(configResult.getRuleEntrySeverity('import-integrity', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('sets default `packageRootDir` by default', async () => {
      const configResult = await computeEslintConfig('importIntegrity');

      const settings =
        configResult.getConfigByUnPostfix('import-integrity')?.settings?.['import-integrity'];

      expect(settings).toMatchObject({
        packageRootDir: expect.stringMatching(/[/\\]configs$/) as unknown,
      });
    });

    it('merges user-provided `settings` into `import-integrity` settings (e.g. overrides `packageRootDir`)', async () => {
      const SETTINGS = {packageRootDir: 'custom-root', mode: 'fix' as const};

      const configResult = await computeEslintConfig({importIntegrity: {settings: SETTINGS}});

      expect(
        configResult.getConfigByUnPostfix('import-integrity')?.settings?.['import-integrity'],
      ).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `restrictImports`', () => {
    it('disables `import-integrity/no-restricted-imports` rule by default', async () => {
      const configResult = await computeEslintConfig('importIntegrity');

      expect(
        configResult.getRuleEntrySeverity(
          'import-integrity',
          'import-integrity/no-restricted-imports',
        ),
      ).toBe(0);
    });

    it('enables `import-integrity/no-restricted-imports` rule when `restrictImports` is provided', async () => {
      const OPTIONS = {
        rules: [{type: 'built-in' as const, moduleSpecifier: 'fs', denied: ['*']}],
      };
      const configResult = await computeEslintConfig({
        importIntegrity: {restrictImports: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions(
          'import-integrity',
          'import-integrity/no-restricted-imports',
        ),
      ).toStrictEqual([OPTIONS]);
    });
  });
});
