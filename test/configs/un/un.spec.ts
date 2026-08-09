const FIXTURES = {
  consecutiveSpaces: 'consecutive-spaces.js',
  typeofComparisons: 'typeof-comparisons.js',
} as const;

describe('basic tests', () => {
  it('creates `un` eslint config and loads `un` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('un');

    const config = configResult.getConfigByUnPostfix('un');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('un')).toBeDefined();
  });

  it('does not create `un` eslint config and does not load `un` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({un: false});

    expect(configResult.getConfigByUnPostfix('un')).toBeUndefined();
    expect(configResult.getLoadedPlugin('un')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `un` eslint config', async () => {
      await expectConfigState({}, 'un', false);
    });

    it('creates `un` eslint config if explicitly enabled', async () => {
      await expectConfigState('un', 'un', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `un` eslint config by default', async () => {
      await expectConfigState({}, 'un', true, 'default');
    });

    it('creates `un` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('un', 'un', ['un', true], 'default');
    });

    it('does not create `un` eslint config if explicitly disabled', async () => {
      await expectConfigState({un: false}, 'un', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `un` eslint config', async () => {
      await expectConfigState({}, 'un', true, 'misc-enabled');
    });

    it('creates `un` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('un', 'un', ['un', true], 'misc-enabled');
    });

    it('does not create `un` eslint config if explicitly disabled', async () => {
      await expectConfigState({un: false}, 'un', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('un');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('un')).toMatchObject({
      'un/no-multiple-consecutive-spaces': 2,
      'un/no-typeof-like-comparisons': 1,
    });
  });

  it('`un/no-multiple-consecutive-spaces` fires on a file with consecutive spaces in a string', async () => {
    const results = await testEslintConfig('un', FIXTURES.consecutiveSpaces, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.consecutiveSpaces,
      'un/no-multiple-consecutive-spaces',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Multiple consecutive spaces in string literal are not allowed."',
    );
  });

  it('`un/no-typeof-like-comparisons` only fires on operands not holding a `typeof` result', async () => {
    const results = await testEslintConfig('un', FIXTURES.typeofComparisons, import.meta.dirname);

    const errors = findLintMessageFromLintResults(
      results,
      FIXTURES.typeofComparisons,
      'un/no-typeof-like-comparisons',
      {all: true},
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toMatchInlineSnapshot(
      '"This comparison is likely missing `typeof` operator before the left operand and therefore is forbidden. If this is intentional, you may need to suppress this report."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `un` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({un: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('un')?.files).toStrictEqual(FILES);
    });

    it('disables `un` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({un: {files: []}});

      expect(configResult.getConfigByUnPostfix('un')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `un` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({un: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('un')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `un` eslint config', async () => {
    const configResult = await computeEslintConfig({
      un: {
        overrides: {'un/no-multiple-consecutive-spaces': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('un', 'un/no-multiple-consecutive-spaces')).toBe(0);
    expect(configResult.getRuleEntrySeverity('un', 'no-console')).toBe(0);
  });
});
