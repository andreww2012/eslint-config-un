import {GLOB_HTM_HTML} from '../../../src/constants';
import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  nestedIfWithoutElse: 'nested-if-without-else.js',
  combinedCondition: 'combined-condition.js',
  textEncodingWithDash: 'text-encoding-with-dash.js',
  textEncodingWithoutDash: 'text-encoding-without-dash.js',
  booleanWithoutPrefix: 'boolean-without-prefix.js',
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

  it('has default `ignores` in `unicorn` eslint config (ignores HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('unicorn')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).toIncludeAllMembers([GLOB_HTM_HTML]);
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

  describe('option: `compoundWordsSuggestedReplacements`', () => {
    it('enables `unicorn/consistent-compound-words` without options by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/consistent-compound-words'),
      ).toMatchInlineSnapshot('2');
    });

    it('enables `unicorn/consistent-compound-words` without options when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {compoundWordsSuggestedReplacements: true},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/consistent-compound-words'),
      ).toMatchInlineSnapshot('2');
    });

    it('disables `unicorn/consistent-compound-words` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {compoundWordsSuggestedReplacements: false},
      });

      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/consistent-compound-words'),
      ).toBe(0);
    });

    it('splits a record into `replacements` and `allowList` rule options', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {
          compoundWordsSuggestedReplacements: {
            passWord: 'password',
            spellLevel: '',
            userName: false,
          },
        },
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/consistent-compound-words'),
      ).toStrictEqual([
        {
          replacements: {passWord: 'password', spellLevel: false},
          allowList: {userName: true},
        },
      ]);
    });

    it('passes the array form directly as rule options', async () => {
      const OPTIONS = [{replacements: {fooBar: 'foobar'}} as const] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({
        unicorn: {compoundWordsSuggestedReplacements: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/consistent-compound-words'),
      ).toStrictEqual(OPTIONS);
    });
  });

  describe('option: `domDataAttributesStyle`', () => {
    it('enforces the `.dataset` API by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/dom-node-dataset'),
      ).toMatchInlineSnapshot('[2, {"preferAttributes": false}]');
    });

    it('enforces `{get,set,remove,has}Attribute` when set to `attributes`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {domDataAttributesStyle: 'attributes'},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/dom-node-dataset'),
      ).toMatchInlineSnapshot('[2, {"preferAttributes": true}]');
    });

    it('disables `unicorn/dom-node-dataset` when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {domDataAttributesStyle: false}});

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/dom-node-dataset')).toBe(0);
    });
  });

  describe('option: `minComparisonsToPreferArrayIncludes`', () => {
    it('enables `unicorn/prefer-includes-over-repeated-comparisons` with `minimumComparisons: 3` by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-includes-over-repeated-comparisons'),
      ).toMatchInlineSnapshot('[2, {"minimumComparisons": 3}]');
    });

    it('passes the provided value as `minimumComparisons` when set to `2`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {minComparisonsToPreferArrayIncludes: 2},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-includes-over-repeated-comparisons'),
      ).toMatchInlineSnapshot('[2, {"minimumComparisons": 2}]');
    });

    it('disables `unicorn/prefer-includes-over-repeated-comparisons` when set to `1`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {minComparisonsToPreferArrayIncludes: 1},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'unicorn',
          'unicorn/prefer-includes-over-repeated-comparisons',
        ),
      ).toBe(0);
    });
  });

  describe('option: `minWhitespaceRepetitionsToPreferStringRepeat`', () => {
    it('enables `unicorn/prefer-string-repeat` with `minimumRepetitions: 3` by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-string-repeat'),
      ).toMatchInlineSnapshot('[2, {"minimumRepetitions": 3}]');
    });

    it('passes the provided value as `minimumRepetitions` when set to `2`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {minWhitespaceRepetitionsToPreferStringRepeat: 2},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-string-repeat'),
      ).toMatchInlineSnapshot('[2, {"minimumRepetitions": 2}]');
    });

    it('disables `unicorn/prefer-string-repeat` when set to `1`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {minWhitespaceRepetitionsToPreferStringRepeat: 1},
      });

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/prefer-string-repeat')).toBe(0);
    });
  });

  describe('option: `classReferenceInStaticMethodsStyle`', () => {
    it('enforces `this` and `super` by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/class-reference-in-static-methods'),
      ).toMatchInlineSnapshot('[2, {"preferSuper": true, "preferThis": true}]');
    });

    it('enforces `this` and `super` when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {classReferenceInStaticMethodsStyle: true},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/class-reference-in-static-methods'),
      ).toMatchInlineSnapshot('[2, {"preferSuper": true, "preferThis": true}]');
    });

    it('enforces identifiers when set to `identifiers`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {classReferenceInStaticMethodsStyle: 'identifiers'},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/class-reference-in-static-methods'),
      ).toMatchInlineSnapshot('[2, {"preferSuper": false, "preferThis": false}]');
    });

    it('passes the object form directly as rule options', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {classReferenceInStaticMethodsStyle: {preferThis: false, preferSuper: true}},
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/class-reference-in-static-methods'),
      ).toStrictEqual([{preferThis: false, preferSuper: true}]);
    });

    it('disables `unicorn/class-reference-in-static-methods` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {classReferenceInStaticMethodsStyle: false},
      });

      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/class-reference-in-static-methods'),
      ).toBe(0);
    });
  });

  describe('option: `enforcePrefixForBooleanNames`', () => {
    it('enables `unicorn/consistent-boolean-name` with the default prefixes by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/consistent-boolean-name'),
      ).toMatchInlineSnapshot(
        '[2, {"prefixes": {"allows": true, "are": true, "can": true, "contains": true, "did": true, "do": true, "does": true, "had": true, "has": true, "includes": true, "is": true, "may": true, "must": true, "needs": true, "requires": true, "should": true, "supports": true, "was": true, "were": true, "will": true}}]',
      );
    });

    it('enables `unicorn/consistent-boolean-name` with the default prefixes when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {enforcePrefixForBooleanNames: true},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/consistent-boolean-name'),
      ).toMatchInlineSnapshot(
        '[2, {"prefixes": {"allows": true, "are": true, "can": true, "contains": true, "did": true, "do": true, "does": true, "had": true, "has": true, "includes": true, "is": true, "may": true, "must": true, "needs": true, "requires": true, "should": true, "supports": true, "was": true, "were": true, "will": true}}]',
      );
    });

    it('disables `unicorn/consistent-boolean-name` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {enforcePrefixForBooleanNames: false},
      });

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/consistent-boolean-name')).toBe(
        0,
      );
    });

    it('merges the object form with the default prefixes', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {enforcePrefixForBooleanNames: {shows: true, is: false}},
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/consistent-boolean-name')[0],
      ).toMatchObject({prefixes: {shows: true, is: false, has: true}});
    });

    it('replaces the default prefixes with the array form', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {enforcePrefixForBooleanNames: ['shows']},
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/consistent-boolean-name'),
      ).toStrictEqual([
        {
          prefixes: {
            is: false,
            has: false,
            can: false,
            should: false,
            was: false,
            did: false,
            will: false,
            shows: true,
          },
        },
      ]);
    });

    it('triggers for a boolean variable without an allowed prefix by default', async () => {
      const results = await testEslintConfig(
        'unicorn',
        FIXTURES.booleanWithoutPrefix,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.booleanWithoutPrefix,
        'unicorn/consistent-boolean-name',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Boolean name `ready` should start with `is`, `are`, `has`, `have`, `can`, `should`, `was`, `were`, `did`, `will`, `requires`, `had`, `must`, `may`, `does`, `do`, `needs`, `allows`, `supports`, `contains`, `includes`."',
      );
    });

    it('does not trigger for a boolean variable without a prefix when set to `false`', async () => {
      const results = await testEslintConfig(
        {unicorn: {enforcePrefixForBooleanNames: false}},
        FIXTURES.booleanWithoutPrefix,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.booleanWithoutPrefix,
        'unicorn/consistent-boolean-name',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('option: `functionPrefixesToDisallowForCallables`', () => {
    it('enables `unicorn/no-non-function-verb-prefix` with the default verbs by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/no-non-function-verb-prefix'),
      ).toMatchInlineSnapshot(
        '[2, {"verbs": ["get", "set", "unset", "delete", "add", "remove", "destroy", "create"]}]',
      );
    });

    it('enables `unicorn/no-non-function-verb-prefix` with the default verbs when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {functionPrefixesToDisallowForCallables: true},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/no-non-function-verb-prefix'),
      ).toMatchInlineSnapshot(
        '[2, {"verbs": ["get", "set", "unset", "delete", "add", "remove", "destroy", "create"]}]',
      );
    });

    it('disables `unicorn/no-non-function-verb-prefix` when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {functionPrefixesToDisallowForCallables: false},
      });

      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/no-non-function-verb-prefix'),
      ).toBe(0);
    });

    it('merges the object form with the default verbs and drops verbs set to `false`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {functionPrefixesToDisallowForCallables: {fetch: true, get: false}},
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/no-non-function-verb-prefix'),
      ).toStrictEqual([
        {verbs: ['set', 'unset', 'delete', 'add', 'remove', 'destroy', 'create', 'fetch']},
      ]);
    });

    it('replaces the default verbs with the array form', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {functionPrefixesToDisallowForCallables: ['fetch']},
      });

      expect(
        configResult.getRuleEntryOptions('unicorn', 'unicorn/no-non-function-verb-prefix'),
      ).toStrictEqual([{verbs: ['fetch']}]);
    });

    it('disables `unicorn/no-non-function-verb-prefix` when set to an empty array', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {functionPrefixesToDisallowForCallables: []},
      });

      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/no-non-function-verb-prefix'),
      ).toBe(0);
    });
  });

  describe('option: `explicitTimersDelay`', () => {
    it('enforces an explicit `always` delay by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/explicit-timer-delay'),
      ).toMatchInlineSnapshot('[2, "always"]');
    });

    it('enforces an explicit `always` delay when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {explicitTimersDelay: true}});

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/explicit-timer-delay'),
      ).toMatchInlineSnapshot('[2, "always"]');
    });

    it('enforces an explicit `always` delay when set to `always`', async () => {
      const configResult = await computeEslintConfig({unicorn: {explicitTimersDelay: 'always'}});

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/explicit-timer-delay'),
      ).toMatchInlineSnapshot('[2, "always"]');
    });

    it('enforces `never` when set to `never`', async () => {
      const configResult = await computeEslintConfig({unicorn: {explicitTimersDelay: 'never'}});

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/explicit-timer-delay'),
      ).toMatchInlineSnapshot('[2, "never"]');
    });

    it('disables `unicorn/explicit-timer-delay` when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {explicitTimersDelay: false}});

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/explicit-timer-delay')).toBe(0);
    });
  });

  describe('option: `maxNestedCalls`', () => {
    it('disables `unicorn/max-nested-calls` by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/max-nested-calls')).toBe(0);
    });

    it('disables `unicorn/max-nested-calls` when set to `0`', async () => {
      const configResult = await computeEslintConfig({unicorn: {maxNestedCalls: 0}});

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/max-nested-calls')).toBe(0);
    });

    it('enables `unicorn/max-nested-calls` with the provided `max` when set to `2`', async () => {
      const configResult = await computeEslintConfig({unicorn: {maxNestedCalls: 2}});

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/max-nested-calls'),
      ).toMatchInlineSnapshot('[2, {"max": 2}]');
    });
  });

  describe('option: `numberProperties`', () => {
    it('enforces the `namespace` style for constants and methods by default', async () => {
      const configResult = await computeEslintConfig('unicorn');

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {"checkInfinity": true, "checkNaN": true}]');
      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/prefer-global-number-constants'),
      ).toBe(0);
    });

    it('enforces the `namespace` style when set to `true`', async () => {
      const configResult = await computeEslintConfig({unicorn: {numberProperties: true}});

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {"checkInfinity": true, "checkNaN": true}]');
    });

    it('enforces the `namespace` style when set to `namespace`', async () => {
      const configResult = await computeEslintConfig({unicorn: {numberProperties: 'namespace'}});

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {"checkInfinity": true, "checkNaN": true}]');
    });

    it('disables both affected rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({unicorn: {numberProperties: false}});

      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/prefer-number-properties')).toBe(
        0,
      );
      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/prefer-global-number-constants'),
      ).toBe(0);
    });

    it('enforces the `global` constants style via `unicorn/prefer-global-number-constants`', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {numberProperties: {constants: 'global'}},
      });

      expect(
        configResult.getRuleEntrySeverity('unicorn', 'unicorn/prefer-global-number-constants'),
      ).toBe(2);
      expect(configResult.getRuleEntrySeverity('unicorn', 'unicorn/prefer-number-properties')).toBe(
        0,
      );
    });

    it('enforces the `namespace` constants style for both `NaN` and infinities', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {numberProperties: {constants: 'namespace'}},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {"checkInfinity": true, "checkNaN": true}]');
    });

    it('enforces the `namespace` style for methods only', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {numberProperties: {methods: 'namespace'}},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {}]');
    });

    it('enforces the `namespace` style for `NaN` only', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {numberProperties: {constants: {nan: 'namespace'}}},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {"checkNaN": true}]');
    });

    it('enforces the `namespace` style for infinities only', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {numberProperties: {constants: {positiveAndNegativeInfinity: 'namespace'}}},
      });

      expect(
        configResult.getRuleEntry('unicorn', 'unicorn/prefer-number-properties'),
      ).toMatchInlineSnapshot('[2, {"checkInfinity": true}]');
    });
  });
});
