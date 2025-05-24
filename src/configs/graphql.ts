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
  } satisfies GraphqlEslintConfigOptions);

  const [eslintPluginGraphql, isRelayInstalled] = await Promise.all([
    pluginsLoaders.graphql(),
    doesPackageExist('relay-runtime'),
  ]);

  const {configJsProcessor, graphqlConfig, requireSeparateFilesFor = {}} = optionsResolved;

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

  // Legend:
  // 🟢 - in recommended (schema)
  // 🔵 - in recommended (operations)
  // 📦 - wrapper around `graphql-js` validation function (see https://github.com/graphql/graphql-js/tree/HEAD/src/validation)

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
    .addRule('known-fragment-names', ERROR) // 🔵📦
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
    .addRule('no-deprecated', WARNING) // 🔵
    .addRule('no-duplicate-fields', ERROR) // 🔵
    .addRule('no-fragment-cycles', ERROR) // 🔵📦
    .addRule('no-hashtag-description', ERROR) // 🟢
    .addRule('no-one-place-fragments', ERROR)
    .addRule('no-root-type', OFF)
    .addRule('no-scalar-result-type-on-mutation', ERROR)
    .addRule('no-typename-prefix', ERROR) // 🟢
    .addRule('no-undefined-variables', ERROR) // 🔵📦
    .addRule('no-unreachable-types', ERROR) // 🟢
    .addRule('no-unused-fields', WARNING)
    .addRule('no-unused-fragments', ERROR) // 🔵📦
    .addRule('no-unused-variables', ERROR) // 🔵📦
    .addRule('one-field-subscriptions', ERROR) // 🔵📦
    .addRule('overlapping-fields-can-be-merged', ERROR) // 🔵📦
    .addRule('possible-fragment-spread', ERROR) // 🔵📦
    .addRule('possible-type-extension', ERROR) // 🟢📦
    .addRule('provided-required-arguments', ERROR) // 🟢🔵📦
    .addRule('relay-arguments', isRelayInstalled ? ERROR : OFF)
    .addRule('relay-connection-types', isRelayInstalled ? ERROR : OFF)
    .addRule('relay-edge-types', isRelayInstalled ? ERROR : OFF)
    .addRule('relay-page-info', isRelayInstalled ? ERROR : OFF)
    .addRule('require-deprecation-date', OFF)
    .addRule('require-deprecation-reason', WARNING) // 🟢
    .addRule('require-description', OFF, [
      // Copied from `recommended` config
      {types: true, DirectiveDefinition: true, rootField: true},
    ]) // 🟢
    .addRule('require-field-of-type-query-in-mutation-result', OFF)
    .addRule('require-import-fragment', WARNING)
    .addRule('require-nullable-fields-with-oneof', ERROR)
    .addRule('require-nullable-result-in-root', ERROR)
    .addRule('require-selections', ERROR) // 🔵
    .addRule('require-type-pattern-with-oneof', OFF)
    .addRule('scalar-leafs', ERROR) // 🔵📦
    .addRule('selection-set-depth', ERROR, [{maxDepth: 7}]) // 🔵
    .addRule('strict-id-in-types', ERROR) // 🟢
    .addRule('unique-argument-names', ERROR) // 🔵📦
    .addRule('unique-directive-names-per-location', ERROR) // 🟢🔵📦
    .addRule('unique-directive-names', ERROR) // 🟢📦
    .addRule('unique-enum-value-names', ERROR) // 🟢
    .addRule('unique-field-definition-names', ERROR) // 🟢📦
    .addRule('unique-fragment-name', ERROR) // 🔵
    .addRule('unique-input-field-names', ERROR) // 🔵📦
    .addRule('unique-operation-name', ERROR) // 🔵
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
