const FIXTURES = {
  stringConcatenation: 'string-concatenation.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('noStylisticRules');

  it('creates `no-stylistic-rules` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-stylistic-rules')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-stylistic-rules` eslint config', async () => {
      await expectConfigState({}, 'no-stylistic-rules', false);
    });

    it('creates `no-stylistic-rules` eslint config if explicitly enabled', async () => {
      await expectConfigState('noStylisticRules', 'no-stylistic-rules', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `no-stylistic-rules` eslint config', async () => {
      await expectConfigState({}, 'no-stylistic-rules', false, 'default');
    });

    it('creates `no-stylistic-rules` eslint config if explicitly enabled', async () => {
      await expectConfigState('noStylisticRules', 'no-stylistic-rules', true, 'default');
    });

    it('does not create `no-stylistic-rules` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {noStylisticRules: false},
        'no-stylistic-rules',
        ['noStylisticRules', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `no-stylistic-rules` eslint config', async () => {
      await expectConfigState({}, 'no-stylistic-rules', false, 'misc-enabled');
    });

    it('creates `no-stylistic-rules` eslint config if explicitly enabled', async () => {
      await expectConfigState({noStylisticRules: true}, 'no-stylistic-rules', true, 'misc-enabled');
    });

    it('does not create `no-stylistic-rules` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {noStylisticRules: false},
        'no-stylistic-rules',
        ['noStylisticRules', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `no-stylistic-rules` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('no-stylistic-rules')?.files).toBeUndefined();
  });

  it('has no default `ignores` in `no-stylistic-rules` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-stylistic-rules')?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noStylisticRules');

  it('sets `prefer-template` rule to `off` in `no-stylistic-rules` eslint config', () => {
    expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'prefer-template')).toBe(0);
  });

  it('does not set `no-console` rule in `no-stylistic-rules` eslint config (not a stylistic rule)', () => {
    expect(configResult.getRuleEntry('no-stylistic-rules', 'no-console')).toBeUndefined();
  });

  it('`prefer-template` rule fires on a file with string concatenation when linted without `noStylisticRules`', async () => {
    const results = await testEslintConfig(
      {js: true},
      FIXTURES.stringConcatenation,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.stringConcatenation,
      'prefer-template',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unexpected string concatenation."');
  });

  it('`prefer-template` rule is silenced when linted with `noStylisticRules`', async () => {
    const results = await testEslintConfig(
      {js: true, noStylisticRules: true},
      FIXTURES.stringConcatenation,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.stringConcatenation,
      'prefer-template',
    );

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-stylistic-rules` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({
        noStylisticRules: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('no-stylistic-rules')?.files).toStrictEqual(FILES);
    });

    it('disables `no-stylistic-rules` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('no-stylistic-rules')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-stylistic-rules` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        noStylisticRules: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('no-stylistic-rules')?.ignores;

      expect(ignores).toStrictEqual(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-stylistic-rules` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noStylisticRules: {overrides: {'prefer-template': 2}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'prefer-template')).toBe(2);
    expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('`forceSeverity: "error"` does not change rules disabled via `disableBulkRules` in `no-stylistic-rules` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {forceSeverity: 'error'},
      });

      expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'prefer-template')).toBe(0);
    });

    it('`forceSeverity: "warn"` does not change rules disabled via `disableBulkRules` in `no-stylistic-rules` eslint config', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {forceSeverity: 'warn'},
      });

      expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'prefer-template')).toBe(0);
    });
  });
});

describe('options', () => {
  describe('option: `enableRules.rules`', () => {
    it('disables `prefer-template` rule when option is not set', async () => {
      const configResult = await computeEslintConfig('noStylisticRules');

      expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'prefer-template')).toBe(0);
    });

    it('does not disable any stylistic rules when `enableRules.rules` is `true`', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {enableRules: {rules: true}},
      });

      expect(configResult.getRuleEntry('no-stylistic-rules', 'prefer-template')).toBeUndefined();
    });

    it('does not disable the specified rule when it is set to `true` in `enableRules.rules` object', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {enableRules: {rules: {'prefer-template': true}}},
      });

      expect(configResult.getRuleEntry('no-stylistic-rules', 'prefer-template')).toBeUndefined();
    });

    it('still disables other stylistic rules when a specific rule is enabled in `enableRules.rules`', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {enableRules: {rules: {'prefer-template': true}}},
      });

      expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'sort-keys')).toBe(0);
    });
  });

  describe('option: `enableRules.disableAllOtherRules`', () => {
    it('does not create `no-stylistic-rules/disable-all-non-stylistic-rules` eslint config by default', async () => {
      const configResult = await computeEslintConfig('noStylisticRules');

      expect(
        configResult.getConfigByUnPostfix('no-stylistic-rules/disable-all-non-stylistic-rules'),
      ).toBeUndefined();
    });

    it('creates `no-stylistic-rules/disable-all-non-stylistic-rules` eslint config when `disableAllOtherRules` is `true`', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {enableRules: {rules: false, disableAllOtherRules: true}},
      });

      expect(
        configResult.getConfigByUnPostfix('no-stylistic-rules/disable-all-non-stylistic-rules'),
      ).toBeDefined();
    });

    it('disables a non-stylistic rule in `no-stylistic-rules/disable-all-non-stylistic-rules` config', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {enableRules: {rules: false, disableAllOtherRules: true}},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'no-stylistic-rules/disable-all-non-stylistic-rules',
          'no-console',
        ),
      ).toBe(0);
    });

    it('still disables a stylistic rule in `no-stylistic-rules/disable-all-non-stylistic-rules` config even it is provided in `additionalRules` as `true`', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {
          enableRules: {rules: false, disableAllOtherRules: true},
          additionalRules: {
            // @ts-expect-error testing runtime path: providing already "stylistic" rule
            'prefer-template': true,
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity(
          'no-stylistic-rules/disable-all-non-stylistic-rules',
          'prefer-template',
        ),
      ).toBe(0);
    });
  });

  describe('option: `additionalRules`', () => {
    it('adds rule to disabled list when `additionalRules[rule]` is `true`', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {additionalRules: {'no-console': true}},
      });

      expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'no-console')).toBe(0);
    });

    it('does not add rule to disabled list when `additionalRules[rule]` is `false`', async () => {
      const configResult = await computeEslintConfig({
        noStylisticRules: {additionalRules: {'no-console': false}},
      });

      expect(configResult.getRuleEntry('no-stylistic-rules', 'no-console')).toBeUndefined();
    });
  });
});
