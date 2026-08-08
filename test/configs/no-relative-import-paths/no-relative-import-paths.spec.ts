const FIXTURES = {
  relativeImport: 'relative-import.js',
} as const;

describe('basic tests', () => {
  it('creates `no-relative-import-paths` eslint config and loads plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('noRelativeImportPaths');

    const config = configResult.getConfigByUnPostfix('no-relative-import-paths');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('no-relative-import-paths')).toBeDefined();
  });

  it('does not create `no-relative-import-paths` eslint config if set to `false`', async () => {
    const configResult = await computeEslintConfig({noRelativeImportPaths: false});

    expect(configResult.getConfigByUnPostfix('no-relative-import-paths')).toBeUndefined();
    expect(configResult.getLoadedPlugin('no-relative-import-paths')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-relative-import-paths` eslint config', async () => {
      await expectConfigState({}, 'no-relative-import-paths', false);
    });

    it('creates `no-relative-import-paths` eslint config if explicitly enabled', async () => {
      await expectConfigState('noRelativeImportPaths', 'no-relative-import-paths', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `no-relative-import-paths` eslint config', async () => {
      await expectConfigState({}, 'no-relative-import-paths', false, 'default');
    });

    it('creates `no-relative-import-paths` eslint config if explicitly enabled', async () => {
      await expectConfigState('noRelativeImportPaths', 'no-relative-import-paths', true, 'default');
    });

    it('does not create `no-relative-import-paths` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {noRelativeImportPaths: false},
        'no-relative-import-paths',
        ['noRelativeImportPaths', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `no-relative-import-paths` eslint config', async () => {
      await expectConfigState({}, 'no-relative-import-paths', false, 'misc-enabled');
    });

    it('creates `no-relative-import-paths` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {noRelativeImportPaths: true},
        'no-relative-import-paths',
        true,
        'misc-enabled',
      );
    });

    it('does not create `no-relative-import-paths` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {noRelativeImportPaths: false},
        'no-relative-import-paths',
        ['noRelativeImportPaths', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', () => {
  it('enables `no-relative-import-paths/no-relative-import-paths` rule by default', async () => {
    const configResult = await computeEslintConfig('noRelativeImportPaths');

    expect(
      configResult.getRuleEntrySeverity(
        'no-relative-import-paths',
        'no-relative-import-paths/no-relative-import-paths',
      ),
    ).toBe(2);
  });

  it('`no-relative-import-paths/no-relative-import-paths` rule fires on a relative import', async () => {
    const results = await testEslintConfig(
      'noRelativeImportPaths',
      FIXTURES.relativeImport,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.relativeImport,
      'no-relative-import-paths/no-relative-import-paths',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"import statements should have an absolute path"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-relative-import-paths` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({noRelativeImportPaths: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('no-relative-import-paths')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `no-relative-import-paths` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({noRelativeImportPaths: {files: []}});

      expect(configResult.getConfigByUnPostfix('no-relative-import-paths')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-relative-import-paths` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({noRelativeImportPaths: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('no-relative-import-paths')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-relative-import-paths` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noRelativeImportPaths: {
        overrides: {'no-relative-import-paths/no-relative-import-paths': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('no-relative-import-paths')).toMatchObject({
      'no-relative-import-paths/no-relative-import-paths': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not set rule options by default', async () => {
      const configResult = await computeEslintConfig('noRelativeImportPaths');

      expect(
        configResult.getRuleEntryOptions(
          'no-relative-import-paths',
          'no-relative-import-paths/no-relative-import-paths',
        ),
      ).toStrictEqual([]);
    });

    it('sets rule options when set to provided', async () => {
      const OPTIONS = {allowSameFolder: true, prefix: '~'} as const;

      const configResult = await computeEslintConfig({
        noRelativeImportPaths: {options: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions(
          'no-relative-import-paths',
          'no-relative-import-paths/no-relative-import-paths',
        ),
      ).toStrictEqual([OPTIONS]);
    });
  });
});
