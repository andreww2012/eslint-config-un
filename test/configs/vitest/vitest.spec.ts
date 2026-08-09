const FIXTURES = {
  primitiveEqualityAssertion: 'primitive-equality-assertion/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({vitest: '2.0.0'});
});

describe('basic tests', () => {
  it('creates `vitest` eslint config and loads `vitest` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('vitest');

    const config = configResult.getConfigByUnPostfix('vitest');

    expect(config).toBeDefined();
    expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeUndefined();

    const eslintPluginVitest = await import('@vitest/eslint-plugin');

    expect(config?.languageOptions?.['globals']).toStrictEqual(
      eslintPluginVitest.default.environments.env.globals,
    );

    expect(configResult.getLoadedPlugin('vitest')).toBeDefined();
  });

  it('does not create `vitest` eslint config and does not load `vitest` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({vitest: false});

    expect(configResult.getConfigByUnPostfix('vitest')).toBeUndefined();
    expect(configResult.getLoadedPlugin('vitest')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `vitest` eslint config', async () => {
      await expectConfigState({}, 'vitest', false);
    });

    it('creates `vitest` eslint config if explicitly enabled', async () => {
      await expectConfigState('vitest', 'vitest', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `vitest` eslint config when `vitest` package is installed', async () => {
      await expectConfigState({}, 'vitest', true, 'default');
    });

    it('creates `vitest` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('vitest', 'vitest', ['vitest', true], 'default');
    });

    it('does not create `vitest` eslint config if explicitly disabled', async () => {
      await expectConfigState({vitest: false}, 'vitest', false, 'default');
    });

    describe('`vitest` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `vitest` eslint config', async () => {
        await expectConfigState({}, 'vitest', false, 'default');
      });

      it('creates `vitest` eslint config if explicitly enabled', async () => {
        await expectConfigState('vitest', 'vitest', true, 'default');
      });

      it('does not create `vitest` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({vitest: false}, 'vitest', ['vitest', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `vitest` eslint config when `vitest` package is installed', async () => {
      await expectConfigState({}, 'vitest', true, 'misc-enabled');
    });

    it('creates `vitest` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({vitest: true}, 'vitest', ['vitest', true], 'misc-enabled');
    });

    it('does not create `vitest` eslint config if explicitly disabled', async () => {
      await expectConfigState({vitest: false}, 'vitest', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('vitest');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('vitest')).toMatchObject({
      'vitest/prefer-to-be': 2,
      'vitest/no-commented-out-tests': 1,
      'vitest/no-hooks': 0,
    });
  });

  it('`vitest/prefer-to-be` rule fires on an equality assertion against a primitive', async () => {
    const results = await testEslintConfig(
      'vitest',
      FIXTURES.primitiveEqualityAssertion,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.primitiveEqualityAssertion,
      'vitest/prefer-to-be',
    );

    expect(error?.message).toMatchInlineSnapshot('"Use `toBe` instead"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `vitest` eslint config without affecting `vitest/ts`', async () => {
      const FILES = ['tests/**/*.vitest.ts'];

      const configResult = await computeEslintConfig({
        vitest: {files: FILES},
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('vitest')?.files).toStrictEqual(FILES);
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.files).toMatchInlineSnapshot(
        '["**/*[.-_]spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__test?(s)__/**/*.?([cm])ts?(x)", "**/*.{bench,benchmark}.?([cm])ts?(x)"]',
      );
    });

    it('disables `vitest` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          files: [],
        },
      });

      expect(configResult.getConfigByUnPostfix('vitest')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `vitest` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({vitest: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('vitest')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `vitest` eslint config', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {'vitest/prefer-to-be': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-to-be')).toBe(0);
    expect(configResult.getRuleEntrySeverity('ts/non-type-aware/rules', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('sets plugin settings on `vitest` and `vitest/ts` eslint configs', async () => {
      const PLUGIN_SETTINGS = {typecheck: true};

      const configResult = await computeEslintConfig({
        vitest: {
          settings: PLUGIN_SETTINGS,
        },
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('vitest')?.settings?.['vitest']).toStrictEqual(
        PLUGIN_SETTINGS,
      );
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.settings?.['vitest']).toStrictEqual(
        PLUGIN_SETTINGS,
      );
    });
  });

  describe('option: `enforceEachOrFor`', () => {
    it('uses `each` style by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/consistent-each-for')).toBe(2);
    });

    it('disables `consistent-each-for` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {enforceEachOrFor: false},
      });

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/consistent-each-for')).toBe(0);
    });

    it('uses per-function mapping when object value is provided', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          enforceEachOrFor: {default: 'for', test: 'each'},
        },
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/consistent-each-for'),
      ).toMatchInlineSnapshot(
        '[2, {"describe": "for", "it": "for", "suite": "for", "test": "each"}]',
      );
    });
  });

  describe('option: `enforceToBeCalledStyle`', () => {
    it('enforces `once` style by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-once')).toBe(2);
      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-times')).toBe(0);
    });

    it('enforces `times` style when set to `times`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {enforceToBeCalledStyle: 'times'},
      });

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-once')).toBe(0);
      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-times')).toBe(2);
    });

    it('disables both called-style rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {enforceToBeCalledStyle: false},
      });

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-once')).toBe(0);
      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-times')).toBe(0);
    });
  });

  describe('option: `vitestGlobalsImporting`', () => {
    it('disallows importing vitest globals by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/no-importing-vitest-globals'),
      ).toBe(2);
      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-importing-vitest-globals'),
      ).toBe(0);
    });

    it('enforces importing vitest globals when set to `enforce`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {vitestGlobalsImporting: 'enforce'},
      });

      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/no-importing-vitest-globals'),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-importing-vitest-globals'),
      ).toBe(2);
    });

    it('allows both styles when set to `any`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {vitestGlobalsImporting: 'any'},
      });

      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/no-importing-vitest-globals'),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-importing-vitest-globals'),
      ).toBe(0);
    });
  });

  describe('option: `maxAssertionCalls`', () => {
    it('disables `vitest/max-expects` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/max-expects')).toBe(0);
    });

    it('enables `vitest/max-expects` with provided max value', async () => {
      const configResult = await computeEslintConfig({
        vitest: {maxAssertionCalls: 3},
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/max-expects')).toMatchInlineSnapshot(
        '[2, {"max": 3}]',
      );
    });
  });

  describe('option: `maxNestedDescribes`', () => {
    it('disables `max-nested-describe` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/max-nested-describe')).toBe(0);
    });

    it('enables `max-nested-describe` with provided max value', async () => {
      const configResult = await computeEslintConfig({
        vitest: {maxNestedDescribes: 2},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/max-nested-describe'),
      ).toMatchInlineSnapshot('[2, {"max": 2}]');
    });
  });

  describe('option: `restrictedMethods`', () => {
    it('disables `no-restricted-vi-methods` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/no-restricted-vi-methods')).toBe(
        0,
      );
    });

    it('enables `no-restricted-vi-methods` with provided restrictions', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          restrictedMethods: {spyOn: 'Use explicit mocks'},
        },
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-restricted-vi-methods'),
      ).toMatchInlineSnapshot('[2, {"spyOn": "Use explicit mocks"}]');
    });
  });

  describe('option: `restrictedMatchers`', () => {
    it('disables `no-restricted-matchers` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/no-restricted-matchers')).toBe(0);
    });

    it('enables `no-restricted-matchers` with provided restrictions', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          restrictedMatchers: {toBeTruthy: 'Use strict equality matcher'},
        },
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-restricted-matchers'),
      ).toMatchInlineSnapshot('[2, {"toBeTruthy": "Use strict equality matcher"}]');
    });
  });

  describe('option: `testDefinitionKeyword`', () => {
    it('enables `consistent-test-it` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/consistent-test-it'),
      ).toMatchInlineSnapshot('[2, {"fn": "it", "withinDescribe": "it"}]');
    });

    it('disables `consistent-test-it` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {testDefinitionKeyword: false},
      });

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/consistent-test-it')).toBe(0);
    });
  });

  describe('option: `paddingAround`', () => {
    it('enables padding-around rules by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/padding-around-test-blocks')).toBe(
        2,
      );
    });

    it('disables all padding-around rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {paddingAround: false},
      });

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/padding-around-test-blocks')).toBe(
        0,
      );
      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/padding-around-describe-blocks'),
      ).toBe(0);
    });

    it('supports object form to disable only selected groups', async () => {
      const configResult = await computeEslintConfig({
        vitest: {paddingAround: {test: false}},
      });

      expect(configResult.getRuleEntrySeverity('vitest', 'vitest/padding-around-test-blocks')).toBe(
        0,
      );
      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/padding-around-describe-blocks'),
      ).toBe(2);
    });
  });

  describe('option: `additionalAssertions`', () => {
    it('does not pass options to `expect-expect` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntryOptions('vitest', 'vitest/expect-expect')).toStrictEqual([]);
    });

    it('sets `assertFunctionNames` preserving the rule defaults', async () => {
      const configResult = await computeEslintConfig({
        vitest: {additionalAssertions: ['assertThat', 'verify']},
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/expect-expect')).toMatchInlineSnapshot(
        '[2, {"assertFunctionNames": ["expect", "assert", "assertThat", "verify"]}]',
      );
    });

    it('does not pass options to `expect-expect` when set to an empty array', async () => {
      const configResult = await computeEslintConfig({
        vitest: {additionalAssertions: []},
      });

      expect(configResult.getRuleEntryOptions('vitest', 'vitest/expect-expect')).toStrictEqual([]);
    });
  });

  describe('vitest version', () => {
    it('disables `vitest/prefer-called-exactly-once-with` rule for vitest 2', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-exactly-once-with'),
      ).toBe(0);
    });

    it('enables `vitest/prefer-called-exactly-once-with` rule for vitest v3+', async () => {
      setInstalledPackages({vitest: '3.0.0'});

      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-called-exactly-once-with'),
      ).toBe(2);
    });
  });

  describe('option: `asyncMatchers` and `minAndMaxExpectArgs`', () => {
    it('uses default `vitest/valid-expect` rule options by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntry('vitest', 'vitest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true}]',
      );
    });

    it('passes `asyncMatchers` and min/max args to `vitest/valid-expect` rule', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          asyncMatchers: ['toResolveWith'],
          minAndMaxExpectArgs: [1, 2],
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true, "asyncMatchers": ["toResolveWith"], "maxArgs": 2, "minArgs": 1}]',
      );
    });
  });
});
