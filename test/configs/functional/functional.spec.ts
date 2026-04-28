const FIXTURES = {
  letDeclaration: 'let-declaration.ts',
} as const;

describe('basic tests', () => {
  it('creates `functional` eslint config and loads `functional` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('functional');

    expect(configResult.getLoadedPlugin('functional')).toBeDefined();

    const config = configResult.getConfigByUnPostfix('functional');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);
  });

  it('does not create `functional` eslint config and does not load `functional` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({functional: false});

    expect(configResult.getConfigByUnPostfix('functional')).toBeUndefined();
    expect(configResult.getLoadedPlugin('functional')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `functional` eslint config', async () => {
      await expectConfigState({}, 'functional', false);
    });

    it('creates `functional` eslint config if explicitly enabled', async () => {
      await expectConfigState('functional', 'functional', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `functional` eslint config', async () => {
      await expectConfigState({}, 'functional', false, 'default');
    });

    it('creates `functional` eslint config if explicitly enabled', async () => {
      await expectConfigState('functional', 'functional', true, 'default');
    });

    it('does not create `functional` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({functional: false}, 'functional', ['functional', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `functional` eslint config', async () => {
      await expectConfigState({}, 'functional', false, 'misc-enabled');
    });

    it('creates `functional` eslint config if explicitly enabled', async () => {
      await expectConfigState({functional: true}, 'functional', true, 'misc-enabled');
    });

    it('does not create `functional` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {functional: false},
        'functional',
        ['functional', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('functional');

    expect(configResult.getRuleSeverities('functional')).toMatchObject({
      'functional/no-let': 2,
      'functional/no-try-statements': 0,
    });
  });

  it('`functional/no-let` rule fires on a `let` declaration', async () => {
    const results = await testEslintConfig(
      {
        functional: {files: ['**/*.ts']},
        ts: {files: []}, // Required for rules requiring type info to work
      },
      FIXTURES.letDeclaration,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.letDeclaration,
      'functional/no-let',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unexpected let, use const instead."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `functional` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({functional: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('functional')?.files).toStrictEqual(FILES);
    });

    it('disables `functional` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({functional: {files: []}});

      expect(configResult.getConfigByUnPostfix('functional')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `functional` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({functional: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('functional')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `functional` eslint config', async () => {
    const configResult = await computeEslintConfig({
      functional: {
        overrides: {'functional/no-let': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('functional')).toMatchObject({
      'functional/no-let': 0,
      'no-console': 0,
    });
  });
});
