const FIXTURES = {
  invalidTsdoc: 'invalid-tsdoc.ts',
} as const;

describe('basic tests', () => {
  it('creates `tsdoc` eslint config and loads `tsdoc` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('tsdoc');

    const config = configResult.getConfigByUnPostfix('tsdoc');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('tsdoc')).toBeDefined();
  });

  it('does not create `tsdoc` eslint config and does not load `tsdoc` plugin by default', async () => {
    const configResult = await computeEslintConfig({});

    expect(configResult.getConfigByUnPostfix('tsdoc')).toBeUndefined();
    expect(configResult.getLoadedPlugin('tsdoc')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tsdoc` eslint config', async () => {
      await expectConfigState({}, 'tsdoc', false);
    });

    it('creates `tsdoc` eslint config if explicitly enabled', async () => {
      await expectConfigState('tsdoc', 'tsdoc', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `tsdoc` eslint config', async () => {
      await expectConfigState({}, 'tsdoc', false, 'default');
    });

    it('creates `tsdoc` eslint config if explicitly enabled', async () => {
      await expectConfigState('tsdoc', 'tsdoc', true, 'default');
    });

    it('does not create `tsdoc` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({tsdoc: false}, 'tsdoc', ['tsdoc', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `tsdoc` eslint config', async () => {
      await expectConfigState({}, 'tsdoc', false, 'misc-enabled');
    });

    it('creates `tsdoc` eslint config if explicitly enabled', async () => {
      await expectConfigState({tsdoc: true}, 'tsdoc', true, 'misc-enabled');
    });

    it('does not create `tsdoc` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({tsdoc: false}, 'tsdoc', ['tsdoc', false], 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('tsdoc');

    expect(configResult.getRuleSeverities('tsdoc')).toMatchObject({
      'tsdoc/syntax': 2,
    });
  });

  it('`tsdoc/syntax` rule fires on a file with an invalid TSDoc comment', async () => {
    const results = await testEslintConfig(
      {tsdoc: true, ts: true},
      FIXTURES.invalidTsdoc,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.invalidTsdoc, 'tsdoc/syntax');

    expect(error?.message).toMatchInlineSnapshot(
      '"tsdoc-undefined-tag: The TSDoc tag "@badTag" is not defined in this configuration"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tsdoc` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({tsdoc: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tsdoc')?.files).toStrictEqual(FILES);
    });

    it('disables `tsdoc` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tsdoc: {files: []}});

      expect(configResult.getConfigByUnPostfix('tsdoc')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tsdoc` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tsdoc: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tsdoc')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tsdoc` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tsdoc: {overrides: {'tsdoc/syntax': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleSeverities('tsdoc')).toMatchObject({
      'tsdoc/syntax': 0,
      'no-console': 0,
    });
  });
});
