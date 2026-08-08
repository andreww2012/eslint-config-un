const FIXTURES = {
  withMisspelling: 'with-misspelling.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('cspell');

  it('loads `cspell` plugin if used', () => {
    expect(configResult.getLoadedPlugin('cspell')).toBeDefined();
  });

  it('creates `cspell` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('cspell')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `cspell` eslint config', async () => {
      await expectConfigState({}, 'cspell', false);
    });

    it('creates `cspell` eslint config if explicitly enabled', async () => {
      await expectConfigState('cspell', 'cspell', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `cspell` eslint config', async () => {
      await expectConfigState({}, 'cspell', false, 'default');
    });

    it('creates `cspell` eslint config if explicitly enabled', async () => {
      await expectConfigState('cspell', 'cspell', true, 'default');
    });

    it('does not create `cspell` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({cspell: false}, 'cspell', ['cspell', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `cspell` eslint config', async () => {
      await expectConfigState({}, 'cspell', false, 'misc-enabled');
    });

    it('creates `cspell` eslint config if explicitly enabled', async () => {
      await expectConfigState({cspell: true}, 'cspell', true, 'misc-enabled');
    });

    it('does not create `cspell` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({cspell: false}, 'cspell', ['cspell', false], 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `cspell` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('cspell')?.files).toBeUndefined();
  });

  it('has no `ignores` in `cspell` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('cspell')?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('cspell');

  it('enables `cspell/spellchecker` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('cspell', 'cspell/spellchecker')).toBe(2);
  });

  it('`cspell/spellchecker` rule fires on a file with a misspelled word', async () => {
    const results = await testEslintConfig('cspell', FIXTURES.withMisspelling, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.withMisspelling,
      'cspell/spellchecker',
    );

    expect(error?.message).toMatchInlineSnapshot('"Misspelled word: "reccomend" (recommend)"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `cspell` eslint config', async () => {
      const FILES = ['**/*.ts'];

      const configResult = await computeEslintConfig({cspell: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('cspell')?.files).toStrictEqual(FILES);
    });

    it('disables `cspell` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({cspell: {files: []}});

      expect(configResult.getConfigByUnPostfix('cspell')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `cspell` eslint config without adding defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({cspell: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('cspell')?.ignores;

      expect(ignores).toStrictEqual(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `cspell` eslint config', async () => {
    const configResult = await computeEslintConfig({
      cspell: {overrides: {'cspell/spellchecker': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('cspell', 'cspell/spellchecker')).toBe(0);
    expect(configResult.getRuleEntrySeverity('cspell', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not set rule options by default', async () => {
      const configResult = await computeEslintConfig('cspell');

      expect(configResult.getRuleEntryOptions('cspell', 'cspell/spellchecker')).toStrictEqual([]);
    });

    it('sets rule options when set to provided', async () => {
      const OPTIONS = {autoFix: false, numSuggestions: 5, checkComments: false} as const;

      const configResult = await computeEslintConfig({
        cspell: {options: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('cspell', 'cspell/spellchecker')).toStrictEqual([
        OPTIONS,
      ]);
    });
  });
});
