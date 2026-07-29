const FIXTURES = {
  throwingFunctionCalledAtTopLevel: 'throwing-function-called-at-top-level.js',
} as const;

describe('basic tests', () => {
  it('creates `exception-handling` eslint config and loads `exception-handling` plugin', async () => {
    const configResult = await computeEslintConfig('exceptionHandling');
    const config = configResult.getConfigByUnPostfix('exception-handling');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('exception-handling')).toBeDefined();
  });

  it('does not create `exception-handling` eslint config and does not load `exception-handling` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({exceptionHandling: false});

    expect(configResult.getConfigByUnPostfix('exception-handling')).toBeUndefined();
    expect(configResult.getLoadedPlugin('exception-handling')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `exception-handling` eslint config', async () => {
      await expectConfigState({}, 'exception-handling', false);
    });

    it('creates `exception-handling` eslint config if explicitly enabled', async () => {
      await expectConfigState('exceptionHandling', 'exception-handling', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `exception-handling` eslint config', async () => {
      await expectConfigState({}, 'exception-handling', false, 'default');
    });

    it('creates `exception-handling` eslint config if explicitly enabled', async () => {
      await expectConfigState('exceptionHandling', 'exception-handling', true, 'default');
    });

    it('does not create `exception-handling` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {exceptionHandling: false},
        'exception-handling',
        ['exceptionHandling', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `exception-handling` eslint config', async () => {
      await expectConfigState({}, 'exception-handling', false, 'misc-enabled');
    });

    it('creates `exception-handling` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {exceptionHandling: true},
        'exception-handling',
        true,
        'misc-enabled',
      );
    });

    it('does not create `exception-handling` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {exceptionHandling: false},
        'exception-handling',
        ['exceptionHandling', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('exceptionHandling');

    expect(configResult.getRuleSeverities('exception-handling')).toMatchObject({
      'exception-handling/might-throw': 0,
      'exception-handling/use-error-cause': 2,
    });
  });

  it('`exception-handling/no-unhandled` rule fires on a top level call of a throwing function', async () => {
    const results = await testEslintConfig(
      'exceptionHandling',
      FIXTURES.throwingFunctionCalledAtTopLevel,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.throwingFunctionCalledAtTopLevel,
      'exception-handling/no-unhandled',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"'parseConfig' might throw an exception and is not handled."`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `exception-handling` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({exceptionHandling: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('exception-handling')?.files).toStrictEqual(FILES);
    });

    it('disables `exception-handling` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({exceptionHandling: {files: []}});

      expect(configResult.getConfigByUnPostfix('exception-handling')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `exception-handling` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({exceptionHandling: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('exception-handling')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `exception-handling` eslint config', async () => {
    const configResult = await computeEslintConfig({
      exceptionHandling: {
        overrides: {'exception-handling/no-unhandled': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('exception-handling')).toMatchObject({
      'exception-handling/no-unhandled': 0,
      'no-console': 0,
    });
  });
});
