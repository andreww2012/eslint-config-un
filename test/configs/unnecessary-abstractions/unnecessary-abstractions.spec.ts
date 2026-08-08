const FIXTURES = {
  ternaryOfParameters: 'ternary-of-parameters.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('unnecessaryAbstractions');

  it('loads `unnecessary-abstractions` plugin if used', () => {
    expect(configResult.getLoadedPlugin('unnecessary-abstractions')).toBeDefined();
  });

  it('creates `unnecessary-abstractions` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('unnecessary-abstractions')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `unnecessary-abstractions` eslint config', async () => {
      await expectConfigState({}, 'unnecessary-abstractions', false);
    });

    it('creates `unnecessary-abstractions` eslint config if explicitly enabled', async () => {
      await expectConfigState('unnecessaryAbstractions', 'unnecessary-abstractions', true);
    });

    it('does not create `unnecessary-abstractions` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({unnecessaryAbstractions: false}, 'unnecessary-abstractions', [
        'unnecessaryAbstractions',
        false,
      ]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `unnecessary-abstractions` eslint config', async () => {
      await expectConfigState({}, 'unnecessary-abstractions', true, 'default');
    });

    it('creates `unnecessary-abstractions` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'unnecessaryAbstractions',
        'unnecessary-abstractions',
        ['unnecessaryAbstractions', true],
        'default',
      );
    });

    it('does not create `unnecessary-abstractions` eslint config if explicitly disabled', async () => {
      await expectConfigState(
        {unnecessaryAbstractions: false},
        'unnecessary-abstractions',
        false,
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `unnecessary-abstractions` eslint config', async () => {
      await expectConfigState({}, 'unnecessary-abstractions', true, 'misc-enabled');
    });

    it('creates `unnecessary-abstractions` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'unnecessaryAbstractions',
        'unnecessary-abstractions',
        ['unnecessaryAbstractions', true],
        'misc-enabled',
      );
    });

    it('does not create `unnecessary-abstractions` eslint config if explicitly disabled', async () => {
      await expectConfigState(
        {unnecessaryAbstractions: false},
        'unnecessary-abstractions',
        false,
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `unnecessary-abstractions` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('unnecessary-abstractions')?.files).toBeUndefined();
  });

  it('has default `ignores` in `unnecessary-abstractions` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('unnecessary-abstractions')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('unnecessaryAbstractions');

  it('enables `unnecessary-abstractions/no-ternary-wrappers` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'unnecessary-abstractions',
        'unnecessary-abstractions/no-ternary-wrappers',
      ),
    ).toBe(2);
  });

  it('`unnecessary-abstractions/no-ternary-wrappers` rule fires on a function returning a ternary of its own parameters', async () => {
    const results = await testEslintConfig(
      'unnecessaryAbstractions',
      FIXTURES.ternaryOfParameters,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.ternaryOfParameters,
      'unnecessary-abstractions/no-ternary-wrappers',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unnecessary abstraction: Use the ternary expression directly instead of wrapping it in a function."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `unnecessary-abstractions` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({unnecessaryAbstractions: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('unnecessary-abstractions')?.files).toStrictEqual(
        FILES,
      );
    });

    it('disables `unnecessary-abstractions` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({unnecessaryAbstractions: {files: []}});

      expect(configResult.getConfigByUnPostfix('unnecessary-abstractions')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `unnecessary-abstractions` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({unnecessaryAbstractions: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('unnecessary-abstractions')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `unnecessary-abstractions` eslint config', async () => {
    const configResult = await computeEslintConfig({
      unnecessaryAbstractions: {
        overrides: {'unnecessary-abstractions/no-ternary-wrappers': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('unnecessary-abstractions')).toMatchObject({
      'unnecessary-abstractions/no-ternary-wrappers': 0,
      'no-console': 0,
    });
  });
});
