const FIXTURES = {
  incorrectCasing: 'incorrect-casing.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('casePolice');

  it('loads `case-police` plugin if used', () => {
    expect(configResult.getLoadedPlugin('case-police')).toBeDefined();
  });

  it('creates `case-police` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('case-police')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `case-police` eslint config', async () => {
      await expectConfigState({}, 'case-police', false);
    });

    it('creates `case-police` eslint config if explicitly enabled', async () => {
      await expectConfigState('casePolice', 'case-police', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `case-police` eslint config', async () => {
      await expectConfigState({}, 'case-police', false, 'default');
    });

    it('creates `case-police` eslint config if explicitly enabled', async () => {
      await expectConfigState('casePolice', 'case-police', true, 'default');
    });

    it('does not create `case-police` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({casePolice: false}, 'case-police', ['casePolice', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `case-police` eslint config', async () => {
      await expectConfigState({}, 'case-police', false, 'misc-enabled');
    });

    it('creates `case-police` eslint config if explicitly enabled', async () => {
      await expectConfigState({casePolice: true}, 'case-police', true, 'misc-enabled');
    });

    it('does not create `case-police` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {casePolice: false},
        'case-police',
        ['casePolice', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `case-police` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('case-police')?.files).toBeUndefined();
  });

  it('has no default `ignores` in `case-police` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('case-police')?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('casePolice');

  it('enables `case-police/string-check` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('case-police', 'case-police/string-check')).toBe(2);
  });

  it('`case-police/string-check` rule fires on a file with incorrect casing of a well-known term', async () => {
    const results = await testEslintConfig(
      'casePolice',
      FIXTURES.incorrectCasing,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.incorrectCasing,
      'case-police/string-check',
    );

    // eslint-disable-next-line case-police/string-check
    expect(error?.message).toMatchInlineSnapshot(`"'Github' should be 'GitHub'."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `case-police` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({casePolice: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('case-police')?.files).toStrictEqual(FILES);
    });

    it('disables `case-police` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({casePolice: {files: []}});

      expect(configResult.getConfigByUnPostfix('case-police')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `case-police` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({casePolice: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('case-police')?.ignores;

      expect(ignores).toStrictEqual(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `case-police` eslint config', async () => {
    const configResult = await computeEslintConfig({
      casePolice: {overrides: {'case-police/string-check': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('case-police', 'case-police/string-check')).toBe(0);
    expect(configResult.getRuleEntrySeverity('case-police', 'no-console')).toBe(0);
  });
});
