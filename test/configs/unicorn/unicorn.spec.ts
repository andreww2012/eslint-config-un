import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  nestedIfWithoutElse: 'nested-if-without-else.js',
  combinedCondition: 'combined-condition.js',
  textEncodingWithDash: 'text-encoding-with-dash.js',
  textEncodingWithoutDash: 'text-encoding-without-dash.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('unicorn');

  it('loads `unicorn` plugin if used', () => {
    expect(configResult.getLoadedPlugin('unicorn')).toBeDefined();
  });

  it('creates `unicorn` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('unicorn')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `unicorn` eslint config', async () => {
      await expectConfigState({}, 'unicorn', false);
    });

    it('creates `unicorn` eslint config if explicitly enabled', async () => {
      await expectConfigState('unicorn', 'unicorn', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `unicorn` eslint config', async () => {
      await expectConfigState({}, 'unicorn', true, 'default');
    });

    it('creates `unicorn` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('unicorn', 'unicorn', ['unicorn', true], 'default');
    });

    it('does not create `unicorn` eslint config if explicitly disabled', async () => {
      await expectConfigState({unicorn: false}, 'unicorn', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `unicorn` eslint config', async () => {
      await expectConfigState({}, 'unicorn', true, 'misc-enabled');
    });

    it('creates `unicorn` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('unicorn', 'unicorn', ['unicorn', true], 'misc-enabled');
    });

    it('does not create `unicorn` eslint config if explicitly disabled', async () => {
      await expectConfigState({unicorn: false}, 'unicorn', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `unicorn` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('unicorn')?.files).toBeUndefined();
  });

  it('has default `ignores` in `unicorn` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('unicorn')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('unicorn');

  it('enables `unicorn/no-lonely-if` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/no-lonely-if')).toBe(2);
  });

  it('does not enable `unicorn/no-nested-ternary` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/no-nested-ternary')).toBe(0);
  });

  it('triggers unicorn/no-lonely-if for a lonely if inside another if', async () => {
    const results = await testEslintConfig(
      'unicorn',
      FIXTURES.nestedIfWithoutElse,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nestedIfWithoutElse,
      'unicorn/no-lonely-if',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Unexpected `if` as the only statement in a `if` block without `else`."',
    );
  });

  it('does not trigger unicorn/no-lonely-if for a combined condition', async () => {
    const results = await testEslintConfig(
      'unicorn',
      FIXTURES.combinedCondition,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.combinedCondition,
      'unicorn/no-lonely-if',
    );

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `unicorn` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({unicorn: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('unicorn')?.files).toStrictEqual(FILES);
    });

    it('disables `unicorn` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({unicorn: {files: []}});

      expect(configResult.getConfigByUnPostfix('unicorn')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `unicorn` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({unicorn: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('unicorn')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `unicorn` eslint config', async () => {
    const configResult = await computeEslintConfig({
      unicorn: {overrides: {'unicorn/no-lonely-if': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/no-lonely-if')).toBe(0);
    expect(configResult.getRuleEntrySeverity('unicorn', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `enforceTextEncodingCaseAndNotation`', () => {
    it('triggers for dashed encoding by default', async () => {
      const results = await testEslintConfig(
        'unicorn',
        FIXTURES.textEncodingWithDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithDash,
        'unicorn/text-encoding-identifier-case',
      );

      expect(error?.message).toMatchInlineSnapshot('"Prefer `utf8` over `utf-8`."');
    });

    it('does not trigger for dash-less encoding by default', async () => {
      const results = await testEslintConfig(
        'unicorn',
        FIXTURES.textEncodingWithoutDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithoutDash,
        'unicorn/text-encoding-identifier-case',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for dash-less encoding when set to `dash`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: 'dash'}},
        FIXTURES.textEncodingWithoutDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithoutDash,
        'unicorn/text-encoding-identifier-case',
      );

      expect(error?.message).toMatchInlineSnapshot('"Prefer `utf-8` over `utf8`."');
    });

    it('does not trigger for dashed encoding when set to `dash`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: 'dash'}},
        FIXTURES.textEncodingWithDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithDash,
        'unicorn/text-encoding-identifier-case',
      );

      expect(error).toBeUndefined();
    });

    it('does not trigger for dashed encoding when set to `false`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: false}},
        FIXTURES.textEncodingWithDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithDash,
        'unicorn/text-encoding-identifier-case',
      );

      expect(error).toBeUndefined();
    });

    it('does not trigger for dash-less encoding when set to `false`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforceTextEncodingCaseAndNotation: false}},
        FIXTURES.textEncodingWithoutDash,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.textEncodingWithoutDash,
        'unicorn/text-encoding-identifier-case',
      );

      expect(error).toBeUndefined();
    });
  });
});
