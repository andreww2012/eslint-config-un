const FIXTURES = {
  fixture: 'fixture.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('math');

  it('loads `math` plugin if used', () => {
    expect(configResult.getLoadedPlugin('math')).toBeDefined();
  });

  it('creates `math` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('math')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `math` eslint config', async () => {
      await expectConfigState({}, 'math', false);
    });

    it('creates `math` eslint config if explicitly enabled', async () => {
      await expectConfigState('math', 'math', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `math` eslint config by default', async () => {
      await expectConfigState({}, 'math', true, 'default');
    });

    it('creates `math` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('math', 'math', ['math', true], 'default');
    });

    it('does not create `math` eslint config if explicitly disabled', async () => {
      await expectConfigState({math: false}, 'math', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `math` eslint config', async () => {
      await expectConfigState({}, 'math', true, 'misc-enabled');
    });

    it('creates `math` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('math', 'math', ['math', true], 'misc-enabled');
    });

    it('does not create `math` eslint config if explicitly disabled', async () => {
      await expectConfigState({math: false}, 'math', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `math` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('math')?.files).toBeUndefined();
  });

  it('has default `ignores` in `math` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('math')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('math');

  it('enables `math/prefer-math-cbrt` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('math', 'math/prefer-math-cbrt')).toBe(2);
  });

  it('disables `math/prefer-math-sum-precise` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('math', 'math/prefer-math-sum-precise')).toBe(0);
  });

  it('`math/no-static-nan-calculations` rule fires on a file with a static NaN calculation', async () => {
    const results = await testEslintConfig('math', FIXTURES.fixture, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.fixture,
      'math/no-static-nan-calculations',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"This calculation will always result in NaN, use explicit `NaN` or `Number.NaN` instead."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `math` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({
        math: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('math')?.files).toStrictEqual(FILES);
    });

    it('disables `math` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        math: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('math')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `math` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        math: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('math')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `math` eslint config', async () => {
    const configResult = await computeEslintConfig({
      math: {
        overrides: {'math/prefer-math-cbrt': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('math', 'math/prefer-math-cbrt')).toBe(0);
    expect(configResult.getRuleEntrySeverity('math', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `math` eslint config', async () => {
      const configResult = await computeEslintConfig({
        math: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('math'), (ruleName) =>
          ruleName.startsWith('math/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `math` eslint config', async () => {
      const configResult = await computeEslintConfig({
        math: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('math'), (ruleName) =>
          ruleName.startsWith('math/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `absoluteValuesConversionMethod`', () => {
    it('enables `math/abs` rule with `Math.abs` preference when `absoluteValuesConversionMethod` is `"Math.abs"` (default)', async () => {
      const configResult = await computeEslintConfig('math');

      expect(configResult.getRuleEntry('math', 'math/abs')).toMatchInlineSnapshot(
        '[2, {"prefer": "Math.abs"}]',
      );
    });

    it('enables `math/abs` rule with `expression` preference when `absoluteValuesConversionMethod` is `"expression"`', async () => {
      const configResult = await computeEslintConfig({
        math: {absoluteValuesConversionMethod: 'expression'},
      });

      expect(configResult.getRuleEntry('math', 'math/abs')).toMatchInlineSnapshot(
        '[2, {"prefer": "expression"}]',
      );
    });

    it('disables `math/abs` rule when `absoluteValuesConversionMethod` is `false`', async () => {
      const configResult = await computeEslintConfig({
        math: {absoluteValuesConversionMethod: false},
      });

      expect(configResult.getRuleEntrySeverity('math', 'math/abs')).toBe(0);
    });
  });
});
