const FIXTURES = {
  reExportAll: 're-export-all.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('barrelFiles');

  it('loads `barrel-files` plugin if used', () => {
    expect(configResult.getLoadedPlugin('barrel-files')).toBeDefined();
  });

  it('creates `barrel-files` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('barrel-files')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `barrel-files` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();
    });

    it('creates `barrel-files` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('barrelFiles');

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `barrel-files` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();
    });

    it('creates `barrel-files` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('barrelFiles', {reset: true});

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeDefined();
    });

    it('does not create `barrel-files` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({barrelFiles: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] There is no need to disable `barrelFiles` config because this is the default',
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `barrel-files` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();
    });
  });

  it('has no explicit `files` restriction in `barrel-files` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('barrel-files')?.files).toBeUndefined();
  });

  it('has default `ignores` in `barrel-files` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('barrel-files')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('barrelFiles');

  it('enables `barrel-files/avoid-re-export-all` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('barrel-files', 'barrel-files/avoid-re-export-all'),
    ).toBe(2);
  });

  it('disables `barrel-files/avoid-barrel-files` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('barrel-files', 'barrel-files/avoid-barrel-files'),
    ).toBe(0);
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

    it('disables `barrel-files` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({barrelFiles: {files: []}});

      expect(configResult.getConfigByUnPostfix('barrel-files')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `barrel-files` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({barrelFiles: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('barrel-files')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `barrel-files` eslint config', async () => {
      const configResult = await computeEslintConfig({
        barrelFiles: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('barrel-files'), (ruleName) =>
          ruleName.startsWith('barrel-files/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `barrel-files` eslint config', async () => {
      const configResult = await computeEslintConfig({
        barrelFiles: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('barrel-files'), (ruleName) =>
          ruleName.startsWith('barrel-files/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});
