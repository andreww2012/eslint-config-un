import type {IGraphQLConfig} from '@graphql-eslint/eslint-plugin';
import {
  ERROR,
  GLOB_ASTRO,
  GLOB_EMBER_GLIMMER,
  GLOB_FLOW,
  GLOB_GRAPHQL,
  GLOB_JS_TS_X,
  GLOB_SVELTE,
  OFF,
  type RuleSeverity,
  WARNING,
} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {PrettifyShallow} from '../types';
import {assignDefaults, doesPackageExist, getKeysOfTruthyValues, pickBy} from '../utils';
import type {UnConfigFn} from './index';

export interface GraphqlEslintConfigOptions extends UnConfigOptions<'graphql'> {
  /**
   * Files for which GraphQL processor will be used.
   * "Under the hood, the processor extracts schema and operation files from these files
   * and treats them as virtual GraphQL documents with .graphql extensions"
   * - [plugin docs](https://the-guild.dev/graphql/eslint/docs/usage/js)
   *
   * By default, the processor will be used on **all** files.
   * @default true
   */
  configJsProcessor?: boolean | PrettifyShallow<Pick<UnConfigOptions, 'files' | 'ignores'>>;

  /**
   * Disable all the rules requiring GraphQL Operations specified in GraphQL config
   * (via `documents` option) in order to work:
   * [`known-fragment-names`](https://the-guild.dev/graphql/eslint/rules/known-fragment-names), [`no-one-place-fragments`](https://the-guild.dev/graphql/eslint/rules/no-one-place-fragments), [`no-undefined-variables`](https://the-guild.dev/graphql/eslint/rules/no-undefined-variables), [`no-unused-fields`](https://the-guild.dev/graphql/eslint/rules/no-unused-fields), [`no-unused-fragments`](https://the-guild.dev/graphql/eslint/rules/no-unused-fragments), [`no-unused-variables`](https://the-guild.dev/graphql/eslint/rules/no-unused-variables), [`require-import-fragment`](https://the-guild.dev/graphql/eslint/rules/require-import-fragment), [`require-selections`](https://the-guild.dev/graphql/eslint/rules/require-selections), [`selection-set-depth`](https://the-guild.dev/graphql/eslint/rules/selection-set-depth), [`unique-fragment-name`](https://the-guild.dev/graphql/eslint/rules/unique-fragment-name), [`unique-operation-name`](https://the-guild.dev/graphql/eslint/rules/unique-operation-name)
   * @default false
   */
  disableRulesRequiringOperations?: boolean;

  /**
   * Disable all the rules requiring GraphQL Schema specified in GraphQL config
   * (via `schema` option) in order to work:
   * [`no-deprecated`](https://the-guild.dev/graphql/eslint/rules/no-deprecated), [`no-root-type`](https://the-guild.dev/graphql/eslint/rules/no-root-type), [`no-scalar-result-type-on-mutation`](https://the-guild.dev/graphql/eslint/rules/no-scalar-result-type-on-mutation), [`no-unreachable-types`](https://the-guild.dev/graphql/eslint/rules/no-unreachable-types), [`no-unused-fields`](https://the-guild.dev/graphql/eslint/rules/no-unused-fields), [`relay-edge-types`](https://the-guild.dev/graphql/eslint/rules/relay-edge-types), [`relay-page-info`](https://the-guild.dev/graphql/eslint/rules/relay-page-info), [`require-field-of-type-query-in-mutation-result`](https://the-guild.dev/graphql/eslint/rules/require-field-of-type-query-in-mutation-result), [`require-nullable-result-in-root`](https://the-guild.dev/graphql/eslint/rules/require-nullable-result-in-root), [`require-selections`](https://the-guild.dev/graphql/eslint/rules/require-selections), [`strict-id-in-types`](https://the-guild.dev/graphql/eslint/rules/strict-id-in-types)
   * @default false
   */
  disableRulesRequiringSchema?: boolean;

  /**
   * Provides [GraphQL Config](https://npmjs.com/graphql-config). Normally is not required
   * as it should be automatically found by the plugin. Will be assigned to
   * `languageOptions.parserOptions.graphQLConfig`.
   */
  graphqlConfig?: IGraphQLConfig;

  /**
   * Require queries, mutations, subscriptions or fragments to be located in separate files.
   * By default, all of them are required to be in separate files.
   */
  requireSeparateFilesFor?: Partial<
    Record<'fragment' | 'query' | 'mutation' | 'subscription', boolean>
  >;
}

export const graphqlUnConfig: UnConfigFn<'graphql'> = async (context) => {
  const optionsRaw = context.rootOptions.configs?.graphql;
  const optionsResolved = assignDefaults(optionsRaw, {
    configJsProcessor: true,
    disableRulesRequiringOperations: false,
    disableRulesRequiringSchema: false,
  } satisfies GraphqlEslintConfigOptions);

  const [eslintPluginGraphql, isRelayInstalled] = await Promise.all([
    pluginsLoaders.graphql(),
    doesPackageExist('relay-runtime'),
  ]);

  const {
    configJsProcessor,
    graphqlConfig,
    requireSeparateFilesFor = {},
    disableRulesRequiringOperations,
    disableRulesRequiringSchema,
  } = optionsResolved;

  const configBuilderProcessor = createConfigBuilder(context, configJsProcessor, null);
  configBuilderProcessor?.addConfig(
    [
      'graphql/processor',
      {
        includeDefaultFilesAndIgnores: true,
        // "Provided file type must be one of .js, .mjs, .cjs, .jsx, .ts, .mts, .cts, .tsx, .flow, .flow.js, .flow.jsx, .vue, .svelte, .astro, .gts, .gjs"
        // "Preprocessing error: Processing of `.vue` files is no longer supported, follow the new official vue example for ESLint's flat config https://github.com/dimaMachina/graphql-eslint/tree/master/examples/vue-code-file"
        filesFallback: [GLOB_JS_TS_X, GLOB_FLOW, GLOB_SVELTE, GLOB_ASTRO, GLOB_EMBER_GLIMMER],
      },
    ],
    {
      processor: eslintPluginGraphql.processor,
    },
  );

  const configBuilder = createConfigBuilder(context, optionsResolved, 'graphql');

  const getRelaySeverity = (severity: RuleSeverity) => (isRelayInstalled ? severity : OFF);
  const getRuleRequiresOperationsSeverity = (severity: RuleSeverity) =>
    disableRulesRequiringOperations ? OFF : severity;
  const getRuleRequiresSchemaSeverity = (severity: RuleSeverity) =>
    disableRulesRequiringSchema ? OFF : severity;

  // Legend:
  // 🟢 - in recommended (schema)
  // 🔵 - in recommended (operations)
  // 📦 - wrapper around `graphql-js` validation function (see https://github.com/graphql/graphql-js/tree/HEAD/src/validation)
  // 🖥️ - requires GraphQL Operations
  // 📃 - requires GraphQL Schema

  configBuilder
    ?.addConfig(
      [
        'graphql',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_GRAPHQL],
          doNotIgnoreMarkdown: true,
        },
      ],
      {
        languageOptions: {
          parser: eslintPluginGraphql.parser,
          ...(graphqlConfig && {
            parserOptions: {
              graphQLConfig: graphqlConfig,
            },
          }),
        },
      },
    )
    .addRule('alphabetize', OFF)
    .addRule('description-style', OFF) // 🟢
    .addRule('executable-definitions', ERROR) // 🔵📦
    .addRule('fields-on-correct-type', ERROR) // 🔵📦
    .addRule('fragments-on-composite-type', ERROR) // 🔵📦
    .addRule('input-name', OFF)
    .addRule('known-argument-names', ERROR) // 🟢🔵📦
    .addRule('known-directives', ERROR) // 🟢🔵📦
    .addRule('known-fragment-names', getRuleRequiresOperationsSeverity(ERROR)) // 🔵📦🖥️
    .addRule('known-type-names', ERROR) // 🟢🔵📦
    .addRule('lone-anonymous-operation', ERROR) // 🔵📦
    .addRule('lone-executable-definition', ERROR, [
      {
        // @ts-expect-error too strict type
        ignore: getKeysOfTruthyValues(
          pickBy(requireSeparateFilesFor, (v) => !v),
          true,
        ),
      },
    ])
    .addRule('lone-schema-definition', ERROR) // 🟢📦
    .addRule('match-document-filename', OFF)
    .addRule('naming-convention', ERROR, [
      // Copied from `recommended` config:
      {
        types: 'PascalCase',
        FieldDefinition: 'camelCase',
        InputValueDefinition: 'camelCase',
        Argument: 'camelCase',
        DirectiveDefinition: 'camelCase',
        EnumValueDefinition: 'UPPER_CASE',
        'FieldDefinition[parent.name.value=Query]': {
          forbiddenPrefixes: ['query', 'get'],
          forbiddenSuffixes: ['Query'],
        },
        'FieldDefinition[parent.name.value=Mutation]': {
          forbiddenPrefixes: ['mutation'],
          forbiddenSuffixes: ['Mutation'],
        },
        'FieldDefinition[parent.name.value=Subscription]': {
          forbiddenPrefixes: ['subscription'],
          forbiddenSuffixes: ['Subscription'],
        },
        'EnumTypeDefinition,EnumTypeExtension': {
          forbiddenPrefixes: ['Enum'],
          forbiddenSuffixes: ['Enum'],
        },
        'InterfaceTypeDefinition,InterfaceTypeExtension': {
          forbiddenPrefixes: ['Interface'],
          forbiddenSuffixes: ['Interface'],
        },
        'UnionTypeDefinition,UnionTypeExtension': {
          forbiddenPrefixes: ['Union'],
          forbiddenSuffixes: ['Union'],
        },
        'ObjectTypeDefinition,ObjectTypeExtension': {
          forbiddenPrefixes: ['Type'],
          forbiddenSuffixes: ['Type'],
        },

        VariableDefinition: 'camelCase',
        OperationDefinition: {
          style: 'PascalCase',
          forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
          forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
        },
        FragmentDefinition: {
          style: 'PascalCase',
          forbiddenPrefixes: ['Fragment'],
          forbiddenSuffixes: ['Fragment'],
        },
      },
    ]) // 🟢🔵
    .addRule('no-anonymous-operations', ERROR) // 🔵
    .addRule('no-deprecated', getRuleRequiresSchemaSeverity(WARNING)) // 🔵📃
    .addRule('no-duplicate-fields', ERROR) // 🔵
    .addRule('no-fragment-cycles', ERROR) // 🔵📦
    .addRule('no-hashtag-description', ERROR) // 🟢
    .addRule('no-one-place-fragments', getRuleRequiresOperationsSeverity(ERROR)) // 🖥️
    .addRule('no-root-type', getRuleRequiresSchemaSeverity(OFF)) // 📃
    .addRule('no-scalar-result-type-on-mutation', getRuleRequiresSchemaSeverity(ERROR)) // 📃
    .addRule('no-typename-prefix', ERROR) // 🟢
    .addRule('no-undefined-variables', getRuleRequiresOperationsSeverity(ERROR)) // 🔵📦🖥️
    .addRule('no-unreachable-types', getRuleRequiresSchemaSeverity(ERROR)) // 🟢📃
    .addRule(
      'no-unused-fields',
      getRuleRequiresOperationsSeverity(getRuleRequiresSchemaSeverity(WARNING)),
    ) // 🖥️📃
    .addRule('no-unused-fragments', getRuleRequiresOperationsSeverity(ERROR)) // 🔵📦🖥️
    .addRule('no-unused-variables', getRuleRequiresOperationsSeverity(ERROR)) // 🔵📦🖥️
    .addRule('one-field-subscriptions', ERROR) // 🔵📦
    .addRule('overlapping-fields-can-be-merged', ERROR) // 🔵📦
    .addRule('possible-fragment-spread', ERROR) // 🔵📦
    .addRule('possible-type-extension', ERROR) // 🟢📦
    .addRule('provided-required-arguments', ERROR) // 🟢🔵📦
    .addRule('relay-arguments', getRelaySeverity(ERROR))
    .addRule('relay-connection-types', getRelaySeverity(ERROR))
    .addRule('relay-edge-types', getRuleRequiresSchemaSeverity(getRelaySeverity(ERROR))) // 📃
    .addRule('relay-page-info', getRuleRequiresSchemaSeverity(getRelaySeverity(ERROR))) // 📃
    .addRule('require-deprecation-date', OFF)
    .addRule('require-deprecation-reason', WARNING) // 🟢
    .addRule('require-description', OFF, [
      // Copied from `recommended` config
      {types: true, DirectiveDefinition: true, rootField: true},
    ]) // 🟢
    .addRule('require-field-of-type-query-in-mutation-result', getRuleRequiresSchemaSeverity(OFF)) // 📃
    .addRule('require-import-fragment', getRuleRequiresOperationsSeverity(WARNING)) // 🖥️
    .addRule('require-nullable-fields-with-oneof', ERROR)
    .addRule('require-nullable-result-in-root', getRuleRequiresSchemaSeverity(ERROR)) // 📃
    .addRule(
      'require-selections',
      getRuleRequiresOperationsSeverity(getRuleRequiresSchemaSeverity(ERROR)),
    ) // 🔵🖥️📃
    .addRule('require-type-pattern-with-oneof', OFF)
    .addRule('scalar-leafs', ERROR) // 🔵📦
    .addRule('selection-set-depth', getRuleRequiresOperationsSeverity(ERROR), [{maxDepth: 7}]) // 🔵🖥️
    .addRule('strict-id-in-types', getRuleRequiresSchemaSeverity(ERROR)) // 🟢📃
    .addRule('unique-argument-names', ERROR) // 🔵📦
    .addRule('unique-directive-names-per-location', ERROR) // 🟢🔵📦
    .addRule('unique-directive-names', ERROR) // 🟢📦
    .addRule('unique-enum-value-names', ERROR) // 🟢
    .addRule('unique-field-definition-names', ERROR) // 🟢📦
    .addRule('unique-fragment-name', getRuleRequiresOperationsSeverity(ERROR)) // 🔵🖥️
    .addRule('unique-input-field-names', ERROR) // 🔵📦
    .addRule('unique-operation-name', getRuleRequiresOperationsSeverity(ERROR)) // 🔵🖥️
    .addRule('unique-operation-types', ERROR) // 🟢📦
    .addRule('unique-type-names', ERROR) // 🟢📦
    .addRule('unique-variable-names', ERROR) // 🔵📦
    .addRule('value-literals-of-correct-type', ERROR) // 🔵📦
    .addRule('variables-are-input-types', ERROR) // 🔵📦
    .addRule('variables-in-allowed-position', ERROR) // 🔵📦
    .addOverrides();

  return {
    configs: [configBuilderProcessor, configBuilder],
    optionsResolved,
  };
};
