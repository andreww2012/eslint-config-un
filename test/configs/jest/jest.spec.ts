const FIXTURES = {
  noFocusedTests: 'focused-test/test.spec.js',
} as const;

beforeEach(() => {
  addInstalledPackages({jest: '29.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('jest');

  it('loads `jest` plugin if used', () => {
    expect(configResult.getLoadedPlugin('jest')).toBeDefined();
  });

  it('creates `jest` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jest')).toBeDefined();
  });

  it('does not create `jest/ts` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('jest/ts')).toBeUndefined();
  });

  it('`jest` eslint config includes jest globals', async () => {
    const eslintPluginJest = await import('eslint-plugin-jest');

    expect(configResult.getConfigByUnPostfix('jest')?.languageOptions?.['globals']).toStrictEqual(
      eslintPluginJest.default.environments.globals.globals,
    );
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `jest` eslint config', async () => {
      await expectConfigState({}, 'jest', false);
    });

    it('creates `jest` eslint config if explicitly enabled', async () => {
      await expectConfigState('jest', 'jest', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `jest` eslint config when `jest` package is installed', async () => {
      await expectConfigState({}, 'jest', true, 'default');
    });

    it('creates `jest` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('jest', 'jest', ['jest', true], 'default');
    });

    it('does not create `jest` eslint config if explicitly disabled', async () => {
      await expectConfigState({jest: false}, 'jest', false, 'default');
    });

    describe('`jest` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `jest` eslint config', async () => {
        await expectConfigState({}, 'jest', false, 'default');
      });

      it('creates `jest` eslint config if explicitly enabled', async () => {
        await expectConfigState('jest', 'jest', true, 'default');
      });

      it('does not create `jest` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({jest: false}, 'jest', ['jest', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `jest` eslint config when `jest` package is installed', async () => {
      await expectConfigState({}, 'jest', true, 'misc-enabled');
    });

    it('creates `jest` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({jest: true}, 'jest', ['jest', true], 'misc-enabled');
    });

    it('does not create `jest` eslint config if explicitly disabled', async () => {
      await expectConfigState({jest: false}, 'jest', false, 'misc-enabled');
    });
  });

  it('has default `files` in `jest` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jest')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `jest` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('jest')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jest');

  it('enables `jest/no-focused-tests` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jest', 'jest/no-focused-tests')).toBe(2);
  });

  it('disables `jest/no-hooks` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('jest', 'jest/no-hooks')).toBe(0);
  });

  it('`jest/no-focused-tests` rule fires on a test with `.only` modifier', async () => {
    const results = await testEslintConfig(
      {jest: {settings: {version: 29}}},
      FIXTURES.noFocusedTests,
      {searchFixturesRelativeToPath: import.meta.dirname},
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.noFocusedTests,
      'jest/no-focused-tests',
    );

    expect(error?.message).toMatchInlineSnapshot('"Unexpected focused test"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `jest` eslint config', async () => {
      const FILES = ['tests/**/*.spec.ts'];

      const configResult = await computeEslintConfig({jest: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('jest')?.files).toStrictEqual(FILES);
    });

    it('disables `jest` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({jest: {files: []}});

      expect(configResult.getConfigByUnPostfix('jest')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `jest` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jest: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('jest')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `jest` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jest: {overrides: {'jest/no-focused-tests': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('jest', 'jest/no-focused-tests')).toBe(0);
    expect(configResult.getRuleEntrySeverity('jest', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set jest settings by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getConfigByUnPostfix('jest')?.settings?.['jest']).toBeUndefined();
    });

    it('sets jest settings when provided', async () => {
      const settings = {version: 29};
      const configResult = await computeEslintConfig({jest: {settings}});

      expect(configResult.getConfigByUnPostfix('jest')?.settings?.['jest']).toStrictEqual(settings);
    });
  });

  describe('option: `testDefinitionKeyword`', () => {
    it('enables `jest/consistent-test-it` with default options by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getRuleEntry('jest', 'jest/consistent-test-it')).toMatchInlineSnapshot(
        '[2, {"fn": "it", "withinDescribe": "it"}]',
      );
    });

    it('disables `jest/consistent-test-it` when set to `false`', async () => {
      const configResult = await computeEslintConfig({jest: {testDefinitionKeyword: false}});

      expect(configResult.getRuleEntrySeverity('jest', 'jest/consistent-test-it')).toBe(0);
    });

    it('uses provided string value for both `fn` and `withinDescribe`', async () => {
      const configResult = await computeEslintConfig({jest: {testDefinitionKeyword: 'test'}});

      expect(configResult.getRuleEntry('jest', 'jest/consistent-test-it')).toMatchInlineSnapshot(
        '[2, {"fn": "test", "withinDescribe": "test"}]',
      );
    });

    it('uses provided object value for `jest/consistent-test-it` options', async () => {
      const configResult = await computeEslintConfig({jest: {testDefinitionKeyword: {fn: 'test'}}});

      expect(configResult.getRuleEntry('jest', 'jest/consistent-test-it')).toMatchInlineSnapshot(
        '[2, {"fn": "test", "withinDescribe": "it"}]',
      );
    });
  });

  describe('option: `maxAssertionCalls`', () => {
    it('disables `jest/max-expects` by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getRuleEntry('jest', 'jest/max-expects')).toMatchInlineSnapshot(
        '[0, {"max": undefined}]',
      );
    });

    it('enables `jest/max-expects` with option is set to number', async () => {
      const configResult = await computeEslintConfig({jest: {maxAssertionCalls: 3}});

      expect(configResult.getRuleEntry('jest', 'jest/max-expects')).toMatchInlineSnapshot(
        '[2, {"max": 3}]',
      );
    });
  });

  describe('option: `maxNestedDescribes`', () => {
    it('disables `jest/max-nested-describe` by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getRuleEntry('jest', 'jest/max-nested-describe')).toMatchInlineSnapshot(
        '[0]',
      );
    });

    it('enables `jest/max-nested-describe` when set to number', async () => {
      const configResult = await computeEslintConfig({jest: {maxNestedDescribes: 2}});

      expect(configResult.getRuleEntry('jest', 'jest/max-nested-describe')).toMatchInlineSnapshot(
        '[2, {"max": 2}]',
      );
    });
  });

  describe('option: `restrictedMethods`', () => {
    it('disables `jest/no-restricted-jest-methods` by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(
        configResult.getRuleEntry('jest', 'jest/no-restricted-jest-methods'),
      ).toMatchInlineSnapshot('[0, {}]');
    });

    it('enables `jest/no-restricted-jest-methods` with provided restrictions', async () => {
      const configResult = await computeEslintConfig({
        jest: {restrictedMethods: {spyOn: 'Use explicit mocks'}},
      });

      expect(
        configResult.getRuleEntry('jest', 'jest/no-restricted-jest-methods'),
      ).toMatchInlineSnapshot('[2, {"spyOn": "Use explicit mocks"}]');
    });
  });

  describe('option: `restrictedMatchers`', () => {
    it('disables `jest/no-restricted-matchers` by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(
        configResult.getRuleEntry('jest', 'jest/no-restricted-matchers'),
      ).toMatchInlineSnapshot('[0, {}]');
    });

    it('enables `jest/no-restricted-matchers` with provided restrictions', async () => {
      const configResult = await computeEslintConfig({
        jest: {restrictedMatchers: {toBeTruthy: 'avoid'}},
      });

      expect(
        configResult.getRuleEntry('jest', 'jest/no-restricted-matchers'),
      ).toMatchInlineSnapshot('[2, {"toBeTruthy": "avoid"}]');
    });
  });

  describe('option: `paddingAround`', () => {
    const PADDING_RULES = [
      'padding-around-after-all-blocks',
      'padding-around-after-each-blocks',
      'padding-around-before-all-blocks',
      'padding-around-before-each-blocks',
      'padding-around-describe-blocks',
      'padding-around-expect-groups',
      'padding-around-test-blocks',
    ] as const;

    it('enables all `jest/padding-around-*` rules by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(
        PADDING_RULES.map((rule) => configResult.getRuleEntrySeverity('jest', `jest/${rule}`)),
      ).toMatchInlineSnapshot('[2, 2, 2, 2, 2, 2, 2]');
    });

    it('disables all `jest/padding-around-*` rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({jest: {paddingAround: false}});

      expect(
        PADDING_RULES.map((rule) => configResult.getRuleEntrySeverity('jest', `jest/${rule}`)),
      ).toMatchInlineSnapshot('[0, 0, 0, 0, 0, 0, 0]');
    });

    it('supports object form to disable only selected groups', async () => {
      const configResult = await computeEslintConfig({jest: {paddingAround: {test: false}}});

      expect(
        configResult.getRuleEntrySeverity('jest', 'jest/padding-around-test-blocks'),
      ).toMatchInlineSnapshot('0');
      expect(
        configResult.getRuleEntrySeverity('jest', 'jest/padding-around-describe-blocks'),
      ).toMatchInlineSnapshot('2');
    });
  });

  describe('option: `asyncMatchers`', () => {
    it('does not add `asyncMatchers` to `jest/valid-expect` options by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getRuleEntry('jest', 'jest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true}]',
      );
    });

    it('adds provided `asyncMatchers` to `jest/valid-expect` options', async () => {
      const ASYNC_MATCHERS = ['toResolve', 'toReject'];

      const configResult = await computeEslintConfig({
        jest: {asyncMatchers: ASYNC_MATCHERS},
      });

      expect(configResult.getRuleEntryOptions('jest', 'jest/valid-expect')).toStrictEqual([
        {alwaysAwait: true, asyncMatchers: ASYNC_MATCHERS},
      ]);
    });
  });

  describe('option: `minAndMaxExpectArgs`', () => {
    it('does not set `minArgs`/`maxArgs` in `jest/valid-expect` options by default', async () => {
      const configResult = await computeEslintConfig('jest');

      expect(configResult.getRuleEntry('jest', 'jest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true}]',
      );
    });

    it('sets `minArgs` in `jest/valid-expect` options when option only has min value', async () => {
      const configResult = await computeEslintConfig({
        jest: {minAndMaxExpectArgs: [2, undefined]},
      });

      expect(configResult.getRuleEntry('jest', 'jest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true, "minArgs": 2}]',
      );
    });

    it('sets `maxArgs` in `jest/valid-expect` options when option only has max value', async () => {
      const configResult = await computeEslintConfig({
        jest: {minAndMaxExpectArgs: [undefined, 5]},
      });

      expect(configResult.getRuleEntry('jest', 'jest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true, "maxArgs": 5}]',
      );
    });

    it('sets both `minArgs` and `maxArgs` in `jest/valid-expect` options when option has both values', async () => {
      const configResult = await computeEslintConfig({
        jest: {minAndMaxExpectArgs: [1, 3]},
      });

      expect(configResult.getRuleEntry('jest', 'jest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true, "maxArgs": 3, "minArgs": 1}]',
      );
    });

    it('ignores negative values', async () => {
      const configResult = await computeEslintConfig({
        jest: {minAndMaxExpectArgs: [-1, -1]},
      });

      expect(configResult.getRuleEntry('jest', 'jest/valid-expect')).toMatchInlineSnapshot(
        '[2, {"alwaysAwait": true}]',
      );
    });
  });
});
