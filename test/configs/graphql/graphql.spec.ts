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

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('graphql');

  it('loads `graphql` plugin if used', () => {
    expect(configResult.getLoadedPlugin('graphql')).toBeDefined();
  });

  it('creates `graphql/processor` and `graphql` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('graphql/processor')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('graphql')).toBeDefined();
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

  it('has default `files` in `graphql` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('graphql')?.files).toMatchInlineSnapshot(
      '["**/*.{graphql,gql}"]',
    );
  });

  it('has default `ignores` in `graphql` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('graphql')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_GRAPHQL]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('graphql');

  it('enables `graphql/no-anonymous-operations` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('graphql', 'graphql/no-anonymous-operations')).toBe(2);
  });

  it('disables `graphql/alphabetize` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('graphql', 'graphql/alphabetize')).toBe(0);
  });

  it.skipIf(isEslint10OrLater)(
    '`graphql/no-hashtag-description` rule fires on a type with hashtag description',
    async () => {
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
    },
  );
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
    it('uses default `graphql/lone-executable-definition` rule settings by default', async () => {
      const configResult = await computeEslintConfig('graphql');

      expect(
        configResult.getRuleEntry('graphql', 'graphql/lone-executable-definition'),
      ).toMatchInlineSnapshot('[2, {"ignore": undefined}]');
    });

    it('sets `ignore` for `graphql/lone-executable-definition` rule when operation type is set to `false`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {requireSeparateFilesFor: {mutation: false}},
      });

      expect(
        configResult.getRuleEntry('graphql', 'graphql/lone-executable-definition'),
      ).toMatchInlineSnapshot('[2, {"ignore": undefined}]');
    });

    it('does not add to `ignore` list when operation type is set to `true`', async () => {
      const configResult = await computeEslintConfig({
        graphql: {requireSeparateFilesFor: {mutation: true}},
      });

      expect(
        configResult.getRuleEntry('graphql', 'graphql/lone-executable-definition'),
      ).toMatchInlineSnapshot('[2, {"ignore": undefined}]');
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

    it('disables relay-edge-types and relay-page-info when schema rules are disabled even if `relay-runtime` is installed', async () => {
      addInstalledPackages({'relay-runtime': '18.0.0'});
      const configResult = await computeEslintConfig({
        graphql: {disableRulesRequiringSchema: true},
      });

      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-edge-types')).toBe(0);
      expect(configResult.getRuleEntrySeverity('graphql', 'graphql/relay-page-info')).toBe(0);
    });
  });
});
