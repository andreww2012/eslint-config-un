describe('basic tests', async () => {
  const configResult = await computeEslintConfig('vitest');

  it('loads `vitest` plugin if used', () => {
    expect(configResult.getLoadedPlugin('vitest')).toBeDefined();
  });

  it('creates `vitest` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('vitest')).toBeDefined();
  });

  it('does not create `vitest/ts` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeUndefined();
  });

  it('`vitest` eslint config includes vitest globals', async () => {
    const eslintPluginVitest = await import('@vitest/eslint-plugin');

    expect(configResult.getConfigByUnPostfix('vitest')?.languageOptions?.['globals']).toStrictEqual(
      eslintPluginVitest.default.environments.env.globals,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `vitest` and `vitest/ts` eslint configs', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          files: ['tests/**/*.vitest.ts'],
        },
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('vitest')?.files).toMatchInlineSnapshot(
        `["tests/**/*.vitest.ts"]`,
      );
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.files).toMatchInlineSnapshot(
        `["**/*.spec.?([cm])ts?(x)", "**/*-spec.?([cm])ts?(x)", "**/*_spec.?([cm])ts?(x)", "**/*.test.?([cm])ts?(x)", "**/__tests__/**/*.?([cm])ts?(x)", "**/__test__/**/*.?([cm])ts?(x)"]`,
      );
    });

    it('disables `vitest` eslint config when `files` is an empty array', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          files: [],
        },
      });

      expect(configResult.getConfigByUnPostfix('vitest')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `vitest` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          ignores: ['**/fixtures/**'],
        },
      });

      expect(configResult.getConfigByUnPostfix('vitest')?.ignores).toMatchInlineSnapshot(
        `["**/*.css", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.yaml", "**/fixtures/**"]`,
      );
    });
  });

  it('respects `overrides` and `overridesAny` in `vitest` eslint config', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {'vitest/prefer-to-be': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('vitest', 'vitest/prefer-to-be'),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('ts/non-type-aware/rules', 'no-console'),
      ),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `vitest` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          forceSeverity: 'error',
        },
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('vitest'), (ruleName) =>
          ruleName.startsWith('vitest/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `vitest` eslint config', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          forceSeverity: 'warn',
        },
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('vitest'), (ruleName) =>
          ruleName.startsWith('vitest/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('sets plugin settings on `vitest` and `vitest/ts` eslint configs', async () => {
      const pluginSettings = {typecheck: true};

      const configResult = await computeEslintConfig({
        vitest: {
          settings: pluginSettings,
        },
        ts: true,
      });

      expect(configResult.getConfigByUnPostfix('vitest')?.settings?.['vitest']).toStrictEqual(
        pluginSettings,
      );
      expect(configResult.getConfigByUnPostfix('vitest/ts')?.settings?.['vitest']).toStrictEqual(
        pluginSettings,
      );
    });
  });

  describe('option: `enforceEachOrFor`', () => {
    it('uses `each` style by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('vitest', 'vitest/consistent-each-for'),
        ),
      ).toMatchInlineSnapshot(`2`);
    });

    it('disables `consistent-each-for` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {enforceEachOrFor: false},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('vitest', 'vitest/consistent-each-for'),
        ),
      ).toMatchInlineSnapshot(`0`);
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
        `[2, {"describe": "for", "it": "for", "suite": "for", "test": "each"}]`,
      );
    });
  });

  describe('option: `enforceToBeCalledStyle`', () => {
    it('enforces `once` style by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-called-once'),
      ).toMatchInlineSnapshot(`[2]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-called-times'),
      ).toMatchInlineSnapshot(`[0]`);
    });

    it('enforces `times` style when set to `times`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {enforceToBeCalledStyle: 'times'},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-called-once'),
      ).toMatchInlineSnapshot(`[0]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-called-times'),
      ).toMatchInlineSnapshot(`[2]`);
    });

    it('disables both called-style rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {enforceToBeCalledStyle: false},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-called-once'),
      ).toMatchInlineSnapshot(`[0]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-called-times'),
      ).toMatchInlineSnapshot(`[0]`);
    });
  });

  describe('option: `vitestGlobalsImporting`', () => {
    it('disallows importing vitest globals by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-importing-vitest-globals'),
      ).toMatchInlineSnapshot(`[2]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-importing-vitest-globals'),
      ).toMatchInlineSnapshot(`[0]`);
    });

    it('enforces importing vitest globals when set to `enforce`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {vitestGlobalsImporting: 'enforce'},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-importing-vitest-globals'),
      ).toMatchInlineSnapshot(`[0]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-importing-vitest-globals'),
      ).toMatchInlineSnapshot(`[2]`);
    });

    it('allows both styles when set to `any`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {vitestGlobalsImporting: 'any'},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-importing-vitest-globals'),
      ).toMatchInlineSnapshot(`[0]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/prefer-importing-vitest-globals'),
      ).toMatchInlineSnapshot(`[0]`);
    });
  });

  describe('option: `maxAssertionCalls`', () => {
    it('disables `max-expects` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(configResult.getRuleEntry('vitest', 'vitest/max-expects')).toMatchInlineSnapshot(
        `[0, {"max": undefined}]`,
      );
    });

    it('enables `max-expects` with provided max value', async () => {
      const configResult = await computeEslintConfig({
        vitest: {maxAssertionCalls: 3},
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/max-expects')).toMatchInlineSnapshot(
        `[2, {"max": 3}]`,
      );
    });
  });

  describe('option: `maxNestedDescribes`', () => {
    it('disables `max-nested-describe` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/max-nested-describe'),
      ).toMatchInlineSnapshot(`[0]`);
    });

    it('enables `max-nested-describe` with provided max value', async () => {
      const configResult = await computeEslintConfig({
        vitest: {maxNestedDescribes: 2},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/max-nested-describe'),
      ).toMatchInlineSnapshot(`[2, {"max": 2}]`);
    });
  });

  describe('option: `restrictedMethods`', () => {
    it('disables `no-restricted-vi-methods` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-restricted-vi-methods'),
      ).toMatchInlineSnapshot(`[0]`);
    });

    it('enables `no-restricted-vi-methods` with provided restrictions', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          restrictedMethods: {spyOn: 'Use explicit mocks'},
        },
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-restricted-vi-methods'),
      ).toMatchInlineSnapshot(`[2, {"spyOn": "Use explicit mocks"}]`);
    });
  });

  describe('option: `restrictedMatchers`', () => {
    it('disables `no-restricted-matchers` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-restricted-matchers'),
      ).toMatchInlineSnapshot(`[0]`);
    });

    it('enables `no-restricted-matchers` with provided restrictions', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          restrictedMatchers: {toBeTruthy: 'Use strict equality matcher'},
        },
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/no-restricted-matchers'),
      ).toMatchInlineSnapshot(`[2, {"toBeTruthy": "Use strict equality matcher"}]`);
    });
  });

  describe('option: `testDefinitionKeyword`', () => {
    it('enables `consistent-test-it` by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/consistent-test-it'),
      ).toMatchInlineSnapshot(`[2, {"fn": "it", "withinDescribe": "it"}]`);
    });

    it('disables `consistent-test-it` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {testDefinitionKeyword: false},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/consistent-test-it'),
      ).toMatchInlineSnapshot(`[0]`);
    });
  });

  describe('option: `paddingAround`', () => {
    it('enables padding-around rules by default', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        configResult.getRuleEntry('vitest', 'vitest/padding-around-test-blocks'),
      ).toMatchInlineSnapshot(`[2]`);
    });

    it('disables all padding-around rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {paddingAround: false},
      });

      expect(
        configResult.getRuleEntry('vitest', 'vitest/padding-around-test-blocks'),
      ).toMatchInlineSnapshot(`[0]`);
      expect(
        configResult.getRuleEntry('vitest', 'vitest/padding-around-describe-blocks'),
      ).toMatchInlineSnapshot(`[0]`);
    });

    it('supports object form to disable only selected groups', async () => {
      const configResult = await computeEslintConfig({
        vitest: {paddingAround: {test: false}},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('vitest', 'vitest/padding-around-test-blocks'),
        ),
      ).toMatchInlineSnapshot(`0`);
      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('vitest', 'vitest/padding-around-describe-blocks'),
        ),
      ).toMatchInlineSnapshot(`2`);
    });
  });

  describe('option: `asyncMatchers` and `minAndMaxExpectArgs`', () => {
    it('uses default `valid-expect` options when not provided', async () => {
      const configResult = await computeEslintConfig('vitest');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry('vitest', 'vitest/valid-expect'),
        ),
      ).toMatchInlineSnapshot(`2`);
    });

    it('passes `asyncMatchers` and min/max args to `valid-expect`', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          asyncMatchers: ['toResolveWith'],
          minAndMaxExpectArgs: [1, 2],
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/valid-expect')).toMatchInlineSnapshot(
        `[2, {"alwaysAwait": true, "asyncMatchers": ["toResolveWith"], "maxArgs": 2, "minArgs": 1}]`,
      );
    });
  });
});
