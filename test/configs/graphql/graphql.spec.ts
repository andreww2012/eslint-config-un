import type {IGraphQLConfig} from '@graphql-eslint/eslint-plugin';
import {GLOB_GRAPHQL} from '../../../src/constants';

const FIXTURES = {
  typeWithCommentDescription: 'type-with-comment-description.graphql',
} as const;

const GRAPHQL_JS_VALIDATION_RULES = [
  'executable-definitions',
  'fields-on-correct-type',
  'fragments-on-composite-type',
  'known-argument-names',
  'known-directives',
  'known-type-names',
  'lone-anonymous-operation',
  'lone-schema-definition',
  'no-fragment-cycles',
  'one-field-subscriptions',
  'overlapping-fields-can-be-merged',
  'possible-fragment-spread',
  'possible-type-extension',
  'provided-required-arguments',
  'scalar-leafs',
  'unique-argument-names',
  'unique-directive-names',
  'unique-directive-names-per-location',
  'unique-field-definition-names',
  'unique-input-field-names',
  'unique-operation-types',
  'unique-type-names',
  'unique-variable-names',
  'value-literals-of-correct-type',
  'variables-are-input-types',
  'variables-in-allowed-position',
] as const;

beforeEach(() => {
  addInstalledPackages({graphql: '16.11.0'});
});

describe('basic tests', () => {
  it('creates `graphql/processor` and `graphql` eslint configs and loads `graphql` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('graphql');

    expect(configResult.getConfigByUnPostfix('graphql/processor')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('graphql')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('graphql')?.files).toMatchInlineSnapshot(
      '["**/*.{graphql,gql}"]',
    );

    const ignores = configResult.getConfigByUnPostfix('graphql')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_GRAPHQL]);

    expect(configResult.getLoadedPlugin('graphql')).toBeDefined();
  });

  it('does not create `graphql/processor` and `graphql` eslint configs and does not load `graphql` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({graphql: false});

    expect(configResult.getConfigByUnPostfix('graphql/processor')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('graphql')).toBeUndefined();
    expect(configResult.getLoadedPlugin('graphql')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `graphql` eslint config', async () => {
      await expectConfigState({}, 'graphql', false);
    });

    it('creates `graphql` eslint config if explicitly enabled', async () => {
      await expectConfigState('graphql', 'graphql', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `graphql` eslint config when `graphql` package is installed', async () => {
      await expectConfigState({}, 'graphql', true, 'default');
    });

    it('does not create `graphql` eslint config if explicitly disabled', async () => {
      await expectConfigState({graphql: false}, 'graphql', false, 'default');
    });

    it('creates `graphql` eslint config and prints a warning if explicitly enabled (already the default)', async () => {
      await expectConfigState('graphql', 'graphql', ['graphql', true], 'default');
    });

    describe('`graphql` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `graphql` eslint config', async () => {
        await expectConfigState({}, 'graphql', false, 'default');
      });

      it('creates `graphql` eslint config if explicitly enabled', async () => {
        await expectConfigState('graphql', 'graphql', true, 'default');
      });

      it('does not create `graphql` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({graphql: false}, 'graphql', ['graphql', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `graphql` eslint config (graphql package is installed)', async () => {
      await expectConfigState({}, 'graphql', true, 'misc-enabled');
    });

    it('creates `graphql` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('graphql', 'graphql', ['graphql', true], 'misc-enabled');
    });

    it('does not create `graphql` eslint config if explicitly disabled', async () => {
      await expectConfigState({graphql: false}, 'graphql', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('graphql');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('graphql')).toMatchObject({
      'graphql/no-anonymous-operations': 2,
      'graphql/no-deprecated': 1,
      'graphql/alphabetize': 0,
    });
  });

  it('`graphql/no-hashtag-description` rule fires on a type with hashtag description', async () => {
    // TODO possible to test without these constraints?
    const results = await testEslintConfig(
      {
        graphql: {
          disableRulesRequiringSchema: true,
          disableRulesRequiringOperations: true,
          // All 📦 (graphql-js validation wrapper) rules call `requireGraphQLSchema` and crash without schema
          overrides: Object.fromEntries(
            GRAPHQL_JS_VALIDATION_RULES.map((rule) => [`graphql/${rule}`, 0]),
          ),
        },
      },
      FIXTURES.typeWithCommentDescription,
      {searchFixturesRelativeToPath: import.meta.dirname},
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.typeWithCommentDescription,
      'graphql/no-hashtag-description',
    );

    expect(error?.message).toMatchInlineSnapshot(`
      "Unexpected GraphQL descriptions as hashtag \`#\` for type "User".
      Prefer using \`"""\` for multiline, or \`"\` for a single line description."
    `);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `graphql` eslint config', async () => {
      const FILES = ['src/**/*.graphql'];

      const configResult = await computeEslintConfig({graphql: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('graphql')?.files).toStrictEqual(FILES);
    });

    it('disables `graphql` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({graphql: {files: []}});

      expect(configResult.getConfigByUnPostfix('graphql')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `graphql` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({graphql: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('graphql')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `graphql` eslint config', async () => {
    const configResult = await computeEslintConfig({
      graphql: {
        overrides: {'graphql/no-anonymous-operations': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-anonymous-operations')).toBe(0);
    expect(configResult.getRuleEntrySeverity('graphql', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `disableRulesRequiringOperations`', () => {
    it('enables rules requiring operations by default', async () => {
      const configResult = await computeEslintConfig('graphql');

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/known-fragment-names')).toBe(2);
    });

    it('enables rules requiring operations when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {disableRulesRequiringOperations: false},
      });

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/known-fragment-names')).toBe(2);
    });

    it('disables rules requiring operations when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {disableRulesRequiringOperations: true},
      });

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/known-fragment-names')).toBe(0);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-undefined-variables')).toBe(
        0,
      );
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/unique-operation-name')).toBe(0);
    });
  });

  describe('option: `disableRulesRequiringSchema`', () => {
    it('enables rules requiring schema by default', async () => {
      const configResult = await computeEslintConfig('graphql');

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-unreachable-types')).toBe(2);
    });

    it('enables rules requiring schema when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {disableRulesRequiringSchema: false},
      });

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-unreachable-types')).toBe(2);
    });

    it('disables rules requiring schema when set to `true`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {disableRulesRequiringSchema: true},
      });

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-unreachable-types')).toBe(0);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/strict-id-in-types')).toBe(0);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-deprecated')).toBe(0);
    });
  });

  describe('option: `graphqlConfig`', () => {
    it('does not set `parserOptions.graphQLConfig` by default', async () => {
      const configResult = await computeEslintConfig('graphql');

      expect(
        (
          configResult.getConfigByUnPostfix('graphql')?.languageOptions?.['parserOptions'] as
            | {
                graphQLConfig?: IGraphQLConfig;
              }
            | undefined
        )?.graphQLConfig,
      ).toBeUndefined();
    });

    it('sets `parserOptions.graphQLConfig` when `graphqlConfig` is provided', async () => {
      const GRAPHQL_CONFIG: IGraphQLConfig = {schema: './schema.graphql'};

      const configResult = await computeEslintConfig({
        graphql: {graphqlConfig: GRAPHQL_CONFIG},
      });

      expect(
        (
          configResult.getConfigByUnPostfix('graphql')?.languageOptions?.['parserOptions'] as
            | {
                graphQLConfig?: IGraphQLConfig;
              }
            | undefined
        )?.graphQLConfig,
      ).toStrictEqual(GRAPHQL_CONFIG);
    });
  });

  describe('option: `requireSeparateFilesFor`', () => {
    it('does not set `ignore` in `graphql/lone-executable-definition` rule options by default', async () => {
      const configResult = await computeEslintConfig('graphql');

      expect(
        configResult.getRuleEntryOptions('graphql', 'graphql/lone-executable-definition'),
      ).toStrictEqual([]);
    });

    it('adds a definition kind to `ignore` in `graphql/lone-executable-definition` rule options when it is set to `false`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {requireSeparateFilesFor: {mutation: false}},
      });

      expect(
        configResult.getRuleEntryOptions('graphql', 'graphql/lone-executable-definition'),
      ).toStrictEqual([{ignore: ['mutation']}]);
    });

    it('adds every definition kind set to `false` to `ignore` in `graphql/lone-executable-definition` rule options', async () => {
      const IGNORED_DEFINITION_KINDS = ['fragment', 'mutation'] as const;

      const configResult = await computeEslintConfig({
        graphql: {
          requireSeparateFilesFor: {
            ...Object.fromEntries(IGNORED_DEFINITION_KINDS.map((kind) => [kind, false] as const)),
            query: true,
          },
        },
      });

      expect(
        configResult.getRuleEntryOptions('graphql', 'graphql/lone-executable-definition'),
      ).toStrictEqual([{ignore: IGNORED_DEFINITION_KINDS}]);
    });

    it('does not add a definition kind to `ignore` in `graphql/lone-executable-definition` rule options when it is set to `true`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {requireSeparateFilesFor: {mutation: true}},
      });

      expect(
        configResult.getRuleEntryOptions('graphql', 'graphql/lone-executable-definition'),
      ).toStrictEqual([]);
    });
  });

  describe('relay rules', () => {
    it('disables relay rules when `relay-runtime` is not installed', async () => {
      const configResult = await computeEslintConfig('graphql');

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-arguments')).toBe(0);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-connection-types')).toBe(
        0,
      );
    });

    it('enables relay rules when `relay-runtime` is installed', async () => {
      addInstalledPackages({'relay-runtime': '18.0.0'});

      const configResult = await computeEslintConfig('graphql');

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-arguments')).toBe(2);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-connection-types')).toBe(
        2,
      );
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-edge-types')).toBe(2);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-page-info')).toBe(2);
    });

    it('disables `graphql/relay-edge-types` and `graphql/relay-page-info` when schema rules are disabled even if `relay-runtime` is installed', async () => {
      addInstalledPackages({'relay-runtime': '18.0.0'});

      const configResult = await computeEslintConfig({
        graphql: {disableRulesRequiringSchema: true},
      });

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-edge-types')).toBe(0);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-page-info')).toBe(0);
    });
  });
});
