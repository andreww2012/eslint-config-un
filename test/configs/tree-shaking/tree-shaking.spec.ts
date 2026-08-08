const FIXTURES = {
  sideEffects: 'side-effects/side-effects.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('treeShaking');

  it('loads `tree-shaking` plugin if used', () => {
    expect(configResult.getLoadedPlugin('tree-shaking')).toBeDefined();
  });

  it('creates `tree-shaking` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tree-shaking')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tree-shaking` eslint config', async () => {
      await expectConfigState({}, 'tree-shaking', false);
    });

    it('creates `tree-shaking` eslint config if explicitly enabled', async () => {
      await expectConfigState('treeShaking', 'tree-shaking', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `tree-shaking` eslint config', async () => {
      await expectConfigState({}, 'tree-shaking', false, 'default');
    });

    it('creates `tree-shaking` eslint config if explicitly enabled', async () => {
      await expectConfigState('treeShaking', 'tree-shaking', true, 'default');
    });

    it('does not create `tree-shaking` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {treeShaking: false},
        'tree-shaking',
        ['treeShaking', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `tree-shaking` eslint config', async () => {
      await expectConfigState({}, 'tree-shaking', false, 'misc-enabled');
    });

    it('creates `tree-shaking` eslint config if explicitly enabled', async () => {
      await expectConfigState({treeShaking: true}, 'tree-shaking', true, 'misc-enabled');
    });

    it('does not create `tree-shaking` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {treeShaking: false},
        'tree-shaking',
        ['treeShaking', false],
        'misc-enabled',
      );
    });
  });

  it('has default `files` in `tree-shaking` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tree-shaking')?.files).toMatchInlineSnapshot(
      '["**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `tree-shaking` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tree-shaking')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('treeShaking');

  it('enables `tree-shaking/no-side-effects-in-initialization` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'tree-shaking',
        'tree-shaking/no-side-effects-in-initialization',
      ),
    ).toBe(2);
  });

  it('`tree-shaking/no-side-effects-in-initialization` rule fires on a file with module-level side effects', async () => {
    const results = await testEslintConfig(
      'treeShaking',
      FIXTURES.sideEffects,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.sideEffects,
      'tree-shaking/no-side-effects-in-initialization',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Cannot determine side-effects of calling member function"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tree-shaking` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({treeShaking: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tree-shaking')?.files).toStrictEqual(FILES);
    });

    it('disables `tree-shaking` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({treeShaking: {files: []}});

      expect(configResult.getConfigByUnPostfix('tree-shaking')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tree-shaking` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({treeShaking: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tree-shaking')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tree-shaking` eslint config', async () => {
    const configResult = await computeEslintConfig({
      treeShaking: {
        overrides: {'tree-shaking/no-side-effects-in-initialization': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'tree-shaking',
        'tree-shaking/no-side-effects-in-initialization',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('tree-shaking', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not pass extra options to `tree-shaking/no-side-effects-in-initialization` rule by default', async () => {
      const configResult = await computeEslintConfig('treeShaking');

      expect(
        configResult.getRuleEntryOptions(
          'tree-shaking',
          'tree-shaking/no-side-effects-in-initialization',
        ),
      ).toStrictEqual([]);
    });

    it('passes provided options to `tree-shaking/no-side-effects-in-initialization` rule when `options` is set', async () => {
      const OPTIONS = {noSideEffectsWhenCalled: [{function: 'define'}]};

      const configResult = await computeEslintConfig({treeShaking: {options: OPTIONS}});

      expect(
        configResult.getRuleEntryOptions(
          'tree-shaking',
          'tree-shaking/no-side-effects-in-initialization',
        ),
      ).toStrictEqual([OPTIONS]);
    });
  });
});
