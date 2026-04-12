const FIXTURES = {
  consecutiveSpaces: 'consecutive-spaces.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('un');

  it('loads `un` plugin if used', () => {
    expect(configResult.getLoadedPlugin('un')).toBeDefined();
  });

  it('creates `un` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('un')).toBeDefined();
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

  it('has no explicit `files` restriction in `un` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('un')?.files).toBeUndefined();
  });

  it('has default `ignores` in `un` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('un')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('un');

  it('enables `un/no-multiple-consecutive-spaces` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('un', 'un/no-multiple-consecutive-spaces')).toBe(2);
  });

  it('enables `un/no-typeof-like-comparisons` rule at warning severity by default', () => {
    expect(configResult.getRuleEntrySeverity('un', 'un/no-typeof-like-comparisons')).toBe(1);
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
