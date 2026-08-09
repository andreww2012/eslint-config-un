const FIXTURES = {
  reExportAll: 're-export-all.js',
} as const;

describe('basic tests', () => {
  it('creates `barrel-files` eslint config and loads `barrel-files` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('barrelFiles');

    const config = configResult.getConfigByUnPostfix('barrel-files');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('barrel-files')).toBeDefined();
  });

  it('does not create `barrel-files` eslint config and does not load `barrel-files` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({barrelFiles: false});

    expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();
    expect(configResult.getLoadedPlugin('barrel-files')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `barrel-files` eslint config', async () => {
      await expectConfigState({}, 'barrel-files', false);
    });

    it('creates `barrel-files` eslint config if explicitly enabled', async () => {
      await expectConfigState('barrelFiles', 'barrel-files', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `barrel-files` eslint config', async () => {
      await expectConfigState({}, 'barrel-files', false, 'default');
    });

    it('creates `barrel-files` eslint config if explicitly enabled', async () => {
      await expectConfigState('barrelFiles', 'barrel-files', true, 'default');
    });

    it('does not create `barrel-files` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {barrelFiles: false},
        'barrel-files',
        ['barrelFiles', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `barrel-files` eslint config', async () => {
      await expectConfigState({}, 'barrel-files', false, 'misc-enabled');
    });

    it('creates `barrel-files` eslint config if explicitly enabled', async () => {
      await expectConfigState({barrelFiles: true}, 'barrel-files', true, 'misc-enabled');
    });

    it('does not create `barrel-files` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {barrelFiles: false},
        'barrel-files',
        ['barrelFiles', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('barrelFiles');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('barrel-files')).toMatchObject({
      'barrel-files/avoid-re-export-all': 2,
      'barrel-files/avoid-barrel-files': 0,
    });
  });

  it('`barrel-files/avoid-re-export-all` rule fires on a file with a wildcard re-export', async () => {
    const results = await testEslintConfig(
      'barrelFiles',
      FIXTURES.reExportAll,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.reExportAll,
      'barrel-files/avoid-re-export-all',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Avoid re-exporting * from a module, it leads to unused imports and prevents treeshaking."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `barrel-files` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({barrelFiles: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('barrel-files')?.files).toStrictEqual(FILES);
    });

    it('disables `barrel-files` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({barrelFiles: {files: []}});

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `barrel-files` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({barrelFiles: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('barrel-files')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `barrel-files` eslint config', async () => {
    const configResult = await computeEslintConfig({
      barrelFiles: {
        overrides: {'barrel-files/avoid-re-export-all': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('barrel-files', 'barrel-files/avoid-re-export-all'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('barrel-files', 'no-console')).toBe(0);
  });
});
