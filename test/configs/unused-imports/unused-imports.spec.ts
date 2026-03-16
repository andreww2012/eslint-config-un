const FIXTURES = {
  unusedImport: 'unused-import.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('unusedImports');

  it('loads `unused-imports` plugin if used', () => {
    expect(configResult.getLoadedPlugin('unused-imports')).toBeDefined();
  });

  it('creates `unused-imports/no-unused-imports` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('unused-imports/no-unused-imports')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `unused-imports/no-unused-imports` eslint config', async () => {
      await expectConfigState({}, 'unused-imports/no-unused-imports', false);
    });

    it('creates `unused-imports/no-unused-imports` eslint config if explicitly enabled', async () => {
      await expectConfigState('unusedImports', 'unused-imports/no-unused-imports', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `unused-imports/no-unused-imports` eslint config', async () => {
      await expectConfigState({}, 'unused-imports/no-unused-imports', false, 'default');
    });

    it('creates `unused-imports/no-unused-imports` eslint config if explicitly enabled', async () => {
      await expectConfigState('unusedImports', 'unused-imports/no-unused-imports', true, 'default');
    });

    it('does not create `unused-imports/no-unused-imports` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {unusedImports: false},
        'unused-imports/no-unused-imports',
        ['unusedImports', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `unused-imports/no-unused-imports` eslint config', async () => {
      await expectConfigState({}, 'unused-imports/no-unused-imports', false, 'misc-enabled');
    });

    it('creates `unused-imports/no-unused-imports` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {unusedImports: true},
        'unused-imports/no-unused-imports',
        true,
        'misc-enabled',
      );
    });

    it('does not create `unused-imports/no-unused-imports` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {unusedImports: false},
        'unused-imports/no-unused-imports',
        ['unusedImports', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `unused-imports/no-unused-imports` eslint config by default', () => {
    expect(
      configResult.getConfigByUnPostfix('unused-imports/no-unused-imports')?.files,
    ).toBeUndefined();
  });

  it('has default `ignores` in `unused-imports/no-unused-imports` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('unused-imports/no-unused-imports')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('unusedImports');

  it('enables `unused-imports/no-unused-imports` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'unused-imports/no-unused-imports',
        'unused-imports/no-unused-imports',
      ),
    ).toBe(2);
  });

  it('`unused-imports/no-unused-imports` rule fires on a file with an unused import', async () => {
    const results = await testEslintConfig(
      'unusedImports',
      FIXTURES.unusedImport,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unusedImport,
      'unused-imports/no-unused-imports',
    );

    expect(error?.message).toMatchInlineSnapshot(`"'join' is defined but never used."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `unused-imports/no-unused-imports` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({
        unusedImports: {files: FILES},
      });

      expect(
        configResult.getConfigByUnPostfix('unused-imports/no-unused-imports')?.files,
      ).toStrictEqual(FILES);
    });

    it('disables `unused-imports/no-unused-imports` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        unusedImports: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('unused-imports/no-unused-imports')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `unused-imports/no-unused-imports` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        unusedImports: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix(
        'unused-imports/no-unused-imports',
      )?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `unused-imports/no-unused-imports` eslint config', async () => {
    const configResult = await computeEslintConfig({
      unusedImports: {
        overrides: {'unused-imports/no-unused-imports': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'unused-imports/no-unused-imports',
        'unused-imports/no-unused-imports',
      ),
    ).toBe(0);
    expect(
      configResult.getRuleEntrySeverity('unused-imports/no-unused-imports', 'no-console'),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `unused-imports/no-unused-imports` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unusedImports: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('unused-imports/no-unused-imports'),
          (ruleName) => ruleName.startsWith('unused-imports/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `unused-imports/no-unused-imports` eslint config', async () => {
      const configResult = await computeEslintConfig({
        unusedImports: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('unused-imports/no-unused-imports'),
          (ruleName) => ruleName.startsWith('unused-imports/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});
