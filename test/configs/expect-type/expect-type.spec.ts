const FIXTURES = {
  wrongTypeAssertion: 'wrong-type-assertion.ts',
} as const;

describe('basic tests', () => {
  it('creates `expect-type` eslint config and loads `expect-type` plugin by default', async () => {
    const configResult = await computeEslintConfig('expectType');

    const config = configResult.getConfigByUnPostfix('expect-type');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');

    expect(configResult.getLoadedPlugin('expect-type')).toBeDefined();
  });

  it('does not create `expect-type` eslint config and does not load `expect-type` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({expectType: false});

    expect(configResult.getConfigByUnPostfix('expect-type')).toBeUndefined();
    expect(configResult.getLoadedPlugin('expect-type')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `expect-type` eslint config', async () => {
      await expectConfigState({}, 'expect-type', false);
    });

    it('creates `expect-type` eslint config if explicitly enabled', async () => {
      await expectConfigState('expectType', 'expect-type', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `expect-type` eslint config', async () => {
      await expectConfigState({}, 'expect-type', false, 'default');
    });

    it('creates `expect-type` eslint config if explicitly enabled', async () => {
      await expectConfigState('expectType', 'expect-type', true, 'default');
    });

    it('does not create `expect-type` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({expectType: false}, 'expect-type', ['expectType', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `expect-type` eslint config', async () => {
      await expectConfigState({}, 'expect-type', false, 'misc-enabled');
    });

    it('creates `expect-type` eslint config if explicitly enabled', async () => {
      await expectConfigState({expectType: true}, 'expect-type', true, 'misc-enabled');
    });

    it('does not create `expect-type` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {expectType: false},
        'expect-type',
        ['expectType', false],
        'misc-enabled',
      );
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('expectType');

    expect(configResult.getRuleSeverities('expect-type')).toMatchObject({
      'expect-type/expect': 2,
    });
  });

  it('`expect-type/expect` rule fires on type mismatch', async () => {
    const results = await testEslintConfig(
      {ts: true, expectType: true},
      FIXTURES.wrongTypeAssertion,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.wrongTypeAssertion,
      'expect-type/expect',
    );

    expect(error?.message).toMatchInlineSnapshot('"Expected type to be: string, got: 1"');
  });
});

describe('un options', () => {
  describe('option: `options`', () => {
    it('passes rule options to `expect-type/expect` rule when provided', async () => {
      const OPTIONS = {disableExpectTypeSnapshotFix: true};

      const configResult = await computeEslintConfig({expectType: {options: OPTIONS}});

      expect(configResult.getRuleEntryOptions('expect-type', 'expect-type/expect')).toStrictEqual([
        OPTIONS,
      ]);
    });
  });

  describe('option: `files`', () => {
    it('uses user-provided `files` in `expect-type` eslint config', async () => {
      const FILES = ['tests/**/*.ts'];

      const configResult = await computeEslintConfig({expectType: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('expect-type')?.files).toStrictEqual(FILES);
    });

    it('disables `expect-type` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({expectType: {files: []}});

      expect(configResult.getConfigByUnPostfix('expect-type')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `expect-type` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({expectType: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('expect-type')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `expect-type` eslint config', async () => {
    const configResult = await computeEslintConfig({
      expectType: {overrides: {'expect-type/expect': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleSeverities('expect-type')).toMatchObject({
      'expect-type/expect': 0,
      'no-console': 0,
    });
  });
});
