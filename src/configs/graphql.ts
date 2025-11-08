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
import {generatePackageToLoadProperty, pluginsLoaders} from '../loaders';
import type {Prettify} from '../types';
import {doesPackageExist, getKeysOfTruthyValues, pickBy} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface GraphqlEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'graphql'> {
  /**
   * Files for which GraphQL processor will be used.
   * "Under the hood, the processor extracts schema and operation files from these files
   * and treats them as virtual GraphQL documents with .graphql extensions"
   * - [plugin docs](https://the-guild.dev/graphql/eslint/docs/usage/js)
   *
   * By default, the processor will be used on **all** files.
   * @default true
   */
  configJsProcessor?: boolean | Prettify<Pick<UnConfigOptions, 'files' | 'ignores'>>;

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

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configJsProcessor: true,
    disableRulesRequiringOperations: false,
    disableRulesRequiringSchema: false,
  } satisfies GraphqlEslintConfigOptions);

  const [eslintPluginGraphql, isRelayInstalled] = await Promise.all([
    pluginsLoaders.graphql(context, {throwIfNotFound: true}).then(({module}) => module),
    doesPackageExist('relay-runtime'),
  ]);

  context.usedPlugins.add('graphql');
  if (!eslintPluginGraphql) {
    return null;
  }

  const {
    configJsProcessor,
    graphqlConfig,
    requireSeparateFilesFor = {},
    disableRulesRequiringOperations,
    disableRulesRequiringSchema,
  } = optionsResolved;

  const configBuilderProcessor = context.createConfigBuilder(configJsProcessor, null);
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
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'.
    {
      ...generatePackageToLoadProperty('processor', 'eslintPluginGraphql', {
        valueTransformFn: {
          fn: (modules) => modules.eslintPluginGraphql.processor,
        },
      }),
    },
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'graphql');

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
          parser: 'graphql-eslint-parser',
        },
      ],
      {
        languageOptions: {
          ...(graphqlConfig && {
            parserOptions: {
              graphQLConfig: graphqlConfig,
            },
          }),
        },
      },
    )
    .addRule('alphabetize', OFF) /** @since 2.3.0 */
    .addRule('description-style', OFF) /** @since 0.2.0 */ // 🟢
    .addRule('executable-definitions', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('fields-on-correct-type', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('fragments-on-composite-type', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('input-name', OFF) /** @since 0.2.0 */
    .addRule('known-argument-names', ERROR) /** @since 0.6.0 */ // 🟢🔵📦
    .addRule('known-directives', ERROR) /** @since 0.6.0 */ // 🟢🔵📦
    .addRule('known-fragment-names', getRuleRequiresOperationsSeverity(ERROR)) /** @since 0.6.0 */ // 🔵📦🖥️
    .addRule('known-type-names', ERROR) /** @since 0.6.0 */ // 🟢🔵📦
    .addRule('lone-anonymous-operation', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('lone-executable-definition', ERROR, [
      {
        // @ts-expect-error too strict type
        ignore: getKeysOfTruthyValues(
          pickBy(requireSeparateFilesFor, (v) => !v),
          true,
        ),
      },
    ]) /** @since 3.14.0 */
    .addRule('lone-schema-definition', ERROR) /** @since 0.6.0 */ // 🟢📦
    .addRule('match-document-filename', OFF) /** @since 2.1.0 */
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
    ]) /** @since 0.0.1 */ // 🟢🔵
    .addRule('no-anonymous-operations', ERROR) /** @since 0.3.0 */ // 🔵
    .addRule('no-deprecated', getRuleRequiresSchemaSeverity(WARNING)) /** @since 0.7.0 */ // 🔵📃
    .addRule('no-duplicate-fields', ERROR) /** @since 3.0.0 */ // 🔵
    .addRule('no-fragment-cycles', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('no-hashtag-description', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule(
      'no-one-place-fragments',
      getRuleRequiresOperationsSeverity(ERROR),
    ) /** @since 3.14.0 */ // 🖥️
    .addRule('no-root-type', getRuleRequiresSchemaSeverity(OFF)) /** @since 2.5.0 */ // 📃
    .addRule(
      'no-scalar-result-type-on-mutation',
      getRuleRequiresSchemaSeverity(ERROR),
    ) /** @since 3.0.0 */ // 📃
    .addRule('no-typename-prefix', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('no-undefined-variables', getRuleRequiresOperationsSeverity(ERROR)) /** @since 0.6.0 */ // 🔵📦🖥️
    .addRule('no-unreachable-types', getRuleRequiresSchemaSeverity(ERROR)) /** @since 0.7.2 */ // 🟢📃
    .addRule(
      'no-unused-fields',
      getRuleRequiresOperationsSeverity(getRuleRequiresSchemaSeverity(WARNING)),
    ) /** @since 1.0.2 */ // 🖥️📃
    .addRule('no-unused-fragments', getRuleRequiresOperationsSeverity(ERROR)) /** @since 0.6.0 */ // 🔵📦🖥️
    .addRule('no-unused-variables', getRuleRequiresOperationsSeverity(ERROR)) /** @since 0.6.0 */ // 🔵📦🖥️
    .addRule('one-field-subscriptions', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('overlapping-fields-can-be-merged', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('possible-fragment-spread', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('possible-type-extension', ERROR) /** @since 0.6.0 */ // 🟢📦
    .addRule('provided-required-arguments', ERROR) /** @since 0.6.0 */ // 🟢🔵📦
    .addRule('relay-arguments', getRelaySeverity(ERROR)) /** @since 3.10.0 */
    .addRule('relay-connection-types', getRelaySeverity(ERROR)) /** @since 3.10.0 */
    .addRule(
      'relay-edge-types',
      getRuleRequiresSchemaSeverity(getRelaySeverity(ERROR)),
    ) /** @since 3.10.0 */ // 📃
    .addRule(
      'relay-page-info',
      getRuleRequiresSchemaSeverity(getRelaySeverity(ERROR)),
    ) /** @since 3.10.0 */ // 📃
    .addRule('require-deprecation-date', OFF) /** @since 2.2.0 */
    .addRule('require-deprecation-reason', WARNING) /** @since 0.0.1 */ // 🟢
    .addRule('require-description', OFF, [
      // Copied from `recommended` config
      {types: true, DirectiveDefinition: true, rootField: true},
    ]) /** @since 0.0.1 */ // 🟢
    .addRule(
      'require-field-of-type-query-in-mutation-result',
      getRuleRequiresSchemaSeverity(OFF),
    ) /** @since 2.3.0 */ // 📃
    .addRule(
      'require-import-fragment',
      getRuleRequiresOperationsSeverity(WARNING),
    ) /** @since 3.16.0 */ // 🖥️
    .addRule('require-nullable-fields-with-oneof', ERROR) /** @since 3.14.0 */
    .addRule(
      'require-nullable-result-in-root',
      getRuleRequiresSchemaSeverity(ERROR),
    ) /** @since 3.19.0 */ // 📃
    .addRule(
      'require-selections',
      getRuleRequiresOperationsSeverity(getRuleRequiresSchemaSeverity(ERROR)),
    ) /** @since 0.3.0 */ /** @aka require-id-when-available */ // 🔵🖥️📃
    .addRule('require-type-pattern-with-oneof', OFF) /** @since 3.14.0 */
    .addRule('scalar-leafs', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('selection-set-depth', getRuleRequiresOperationsSeverity(ERROR), [
      {maxDepth: 7},
    ]) /** @since 0.7.0 */ // 🔵🖥️
    .addRule('strict-id-in-types', getRuleRequiresSchemaSeverity(ERROR)) /** @since 0.9.0 */ // 🟢📃
    .addRule('unique-argument-names', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('unique-directive-names', ERROR) /** @since 0.6.0 */ // 🟢📦
    .addRule('unique-directive-names-per-location', ERROR) /** @since 0.6.0 */ // 🟢🔵📦
    .addRule('unique-enum-value-names', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('unique-field-definition-names', ERROR) /** @since 0.6.0 */ // 🟢📦
    .addRule('unique-fragment-name', getRuleRequiresOperationsSeverity(ERROR)) /** @since 0.6.0 */ // 🔵🖥️
    .addRule('unique-input-field-names', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('unique-operation-name', getRuleRequiresOperationsSeverity(ERROR)) /** @since 0.6.0 */ // 🔵🖥️
    .addRule('unique-operation-types', ERROR) /** @since 0.6.0 */ // 🟢📦
    .addRule('unique-type-names', ERROR) /** @since 0.6.0 */ // 🟢📦
    .addRule('unique-variable-names', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('value-literals-of-correct-type', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('variables-are-input-types', ERROR) /** @since 0.6.0 */ // 🔵📦
    .addRule('variables-in-allowed-position', ERROR) /** @since 0.6.0 */ // 🔵📦
    .enableConfigTesterForPlugin('graphql')
    .addOverrides();

  return {
    configs: [configBuilderProcessor, configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'graphql'>;
