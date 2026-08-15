import {ERROR, GLOB_JS_TS_EXTENSION, OFF, WARNING} from '../constants';
import {RULE_CATEGORIES_PER_PLUGIN} from '../eslint-rule-categories.gen';
import type {ConditionalKeys} from '../types';
import {allUnionMembers, arrayIncludes, getKeysOfTruthyValues} from '../utils';
import {generateDefaultTestFiles} from './shared';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

const ESLINT_PLUGIN_TESTING_RELATED_RULES = RULE_CATEGORIES_PER_PLUGIN['eslint-plugin'].tests;

type SchemaCompletenessCheck = keyof (GetRuleOptions<
  'eslint-plugin',
  'no-incomplete-meta-schema'
>['checks'] & {});

const SCHEMA_COMPLETENESS_CHECKS = allUnionMembers<SchemaCompletenessCheck>()([
  'boundedTuples',
  'explicitAdditionalProperties',
  'explicitItems',
  'typedItems',
]);

// ⚠️ DO NOT FORGET to sync this list with the corresponding option's jsdoc
const DEFAULT_SCHEMA_COMPLETENESS_CHECKS = {
  explicitAdditionalProperties: true,
} satisfies Partial<Record<SchemaCompletenessCheck, boolean>>;

/**
 * An ESLint plugin for linting ESLint plugins.
 *
 * 📁 Default `files`: all files
 */
export interface EslintPluginEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'eslint-plugin'> {
  /**
   * Includes rules for ESLint rule test files.
   * @default false
   */
  configRuleTests?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<
          UnRulesConfigPartial<'eslint-plugin'>,
          `eslint-plugin/${(typeof ESLINT_PLUGIN_TESTING_RELATED_RULES)[number]}`
        >
      >;

  /**
   * Enforce or disallow certain `meta` object properties.
   * Will be merged with the default value.
   *
   * Used rules:
   * - `replacedBy`: [`eslint-plugin/no-meta-replaced-by`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/no-meta-replaced-by.md)
   * - `schemaDefaultProperties`: [`eslint-plugin/no-meta-schema-default`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/no-meta-schema-default.md)
   * - `defaultOptions`: [`eslint-plugin/require-meta-default-options`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-default-options.md)
   * - `docsDescription`: [`eslint-plugin/require-meta-docs-description`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-docs-description.md)
   * - `docsRecommended`: [`eslint-plugin/require-meta-docs-recommended`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-docs-recommended.md)
   * - `docsUrl`: [`eslint-plugin/require-meta-docs-url`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-docs-url.md)
   * - `fixable`: [`eslint-plugin/require-meta-fixable`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-fixable.md)
   * - `hasSuggestions`: [`eslint-plugin/require-meta-has-suggestions`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-has-suggestions.md)
   * - `languages`: [`eslint-plugin/require-meta-languages`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-languages.md)
   * - `schema`: [`eslint-plugin/require-meta-schema`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-schema.md)
   * - `schemaDescriptions`: [`eslint-plugin/require-meta-schema-description`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-schema-description.md)
   * - `type`: [`eslint-plugin/require-meta-type`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-type.md)
   * @default {fixable: 'enforce', hasSuggestions: 'enforce', schema: 'enforce', type: 'enforce'}
   */
  metaProperties?: Partial<
    Record<'replacedBy' | 'schemaDefaultProperties', 'disallow' | 'not-disallow'> &
      Record<
        | 'defaultOptions'
        | 'docsDescription'
        | 'docsRecommended'
        | 'docsUrl'
        | 'fixable'
        | 'hasSuggestions'
        | 'languages'
        | 'schema'
        | 'schemaDescriptions'
        | 'type',
        'enforce' | 'not-enforce'
      >
  >;

  /**
   * Which completeness checks to enforce for rule options schemas, i.e. which policies
   * a schema must state explicitly instead of relying on JSON Schema defaults.
   *
   * Possible values:
   * - `true`: enforce the default list of checks;
   * - `false`: do not enforce any check, effectively disabling the rule;
   * - `'all'`: enforce all the checks (the rule's own default);
   * - array form completely overrides the default list;
   * - object form will be merged with the default list.
   *
   * Affected rule:
   * - [`eslint-plugin/no-incomplete-meta-schema`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/no-incomplete-meta-schema.md)
   * @default {explicitAdditionalProperties: true}
   */
  schemaCompletenessChecks?: boolean | 'all' | ArrayOrBooleanRecord<SchemaCompletenessCheck>;
}

export default defineUnConfig<EslintPluginEslintConfigOptions>(
  'eslintPlugin',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configRuleTests: false,
    schemaCompletenessChecks: true,
  });

  const {configRuleTests, metaProperties = {}, schemaCompletenessChecks} = optionsResolved;

  const schemaCompletenessChecksEnabled = new Set<string>(
    schemaCompletenessChecks === 'all'
      ? SCHEMA_COMPLETENESS_CHECKS
      : schemaCompletenessChecks
        ? getKeysOfTruthyValues(
            Array.isArray(schemaCompletenessChecks)
              ? schemaCompletenessChecks
              : {
                  ...DEFAULT_SCHEMA_COMPLETENESS_CHECKS,
                  ...(schemaCompletenessChecks !== true && schemaCompletenessChecks),
                },
          )
        : [],
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'eslint-plugin');

  const getRuleDisallowingMetaPropertySeverity = (
    property: ConditionalKeys<
      EslintPluginEslintConfigOptions['metaProperties'] & {},
      'disallow' | 'not-disallow' | undefined
    >,
    defaultValue?: 'disallow' | 'not-disallow',
  ) => ((metaProperties[property] ?? defaultValue) === 'disallow' ? ERROR : OFF);
  const getRuleEnforcingMetaPropertySeverity = (
    property: ConditionalKeys<
      EslintPluginEslintConfigOptions['metaProperties'] & {},
      'enforce' | 'not-enforce' | undefined
    >,
    defaultValue?: 'enforce' | 'not-enforce',
  ) => ((metaProperties[property] ?? defaultValue) === 'enforce' ? ERROR : OFF);

  // Legend:
  // 🟢 - in recommended
  // 💭 - requires type information

  configBuilder
    ?.addConfig('eslint-plugin')
    .addRule('fixer-return', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('meta-property-ordering', ERROR) /** @since 2.1.0 */
    .addRule('no-deprecated-context-methods', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-deprecated-report-api', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule(
      'no-incomplete-meta-schema',
      schemaCompletenessChecksEnabled.size > 0 ? ERROR : OFF,
      schemaCompletenessChecksEnabled.size > 0
        ? [
            {
              checks: Object.fromEntries(
                SCHEMA_COMPLETENESS_CHECKS.map((check) => [
                  check,
                  schemaCompletenessChecksEnabled.has(check),
                ]),
              ),
            },
          ]
        : [],
    ) /** @since 7.6.0 */
    .addRule('no-incorrect-meta-schema', ERROR) /** @since 7.6.0 */
    .addRule('no-matching-violation-suggest-message-ids', ERROR) /** @since 7.3.0 */
    // `meta.deprecated` supported since ESLint 9.21.0
    .addRule(
      'no-meta-replaced-by',
      getRuleDisallowingMetaPropertySeverity('replacedBy'),
    ) /** @since 6.5.0 */ // 🟢(since 7.0.0)
    // `meta.defaultOptions` supported since ESLint 9.15.0
    .addRule(
      'no-meta-schema-default',
      getRuleDisallowingMetaPropertySeverity('schemaDefaultProperties'),
    ) /** @since 6.4.0 */ // 🟢(since 7.0.0)
    .addRule('no-missing-message-ids', ERROR) /** @since 4.4.0 */ // 🟢
    .addRule('no-missing-placeholders', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-property-in-node', ERROR) /** @since 5.3.0 */ // 💭
    .addRule('no-unused-message-ids', ERROR) /** @since 4.4.0 */ // 🟢
    .addRule('no-unused-placeholders', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('no-useless-token-range', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('prefer-message-ids', ERROR) /** @since 3.5.0 */ // 🟢
    .addRule('prefer-object-rule', ERROR) /** @since 2.3.0 */ // 🟢
    .addRule('prefer-placeholders', ERROR) /** @since 0.5.0 */
    .addRule('prefer-replace-text', ERROR) /** @since 1.3.0 */
    .addRule('report-message-format', ERROR, [`^[A-Z'"\`{]`]) /** @since 0.2.0 */
    // ESLint >=9.15.0
    .addRule(
      'require-meta-default-options',
      getRuleEnforcingMetaPropertySeverity('defaultOptions'),
    ) /** @since 6.4.0 */ // 🟢(since 7.0.0)
    .addRule(
      'require-meta-docs-description',
      getRuleEnforcingMetaPropertySeverity('docsDescription'),
    ) /** @since 2.2.0 */
    .addRule(
      'require-meta-docs-recommended',
      getRuleEnforcingMetaPropertySeverity('docsRecommended'),
    ) /** @since 6.1.0 */
    .addRule(
      'require-meta-docs-url',
      getRuleEnforcingMetaPropertySeverity('docsUrl'),
    ) /** @since 1.4.0 */
    .addRule(
      'require-meta-fixable',
      getRuleEnforcingMetaPropertySeverity('fixable', 'enforce'),
    ) /** @since 0.2.0 */ // 🟢
    .addRule(
      'require-meta-has-suggestions',
      getRuleEnforcingMetaPropertySeverity('hasSuggestions', 'enforce'),
    ) /** @since 3.1.0 */ // 🟢
    .addRule(
      'require-meta-languages',
      getRuleEnforcingMetaPropertySeverity('languages', 'not-enforce'),
    ) /** @since 7.5.0 */
    .addRule(
      'require-meta-schema',
      getRuleEnforcingMetaPropertySeverity('schema', 'enforce'),
    ) /** @since 2.2.0 */ // 🟢
    .addRule(
      'require-meta-schema-description',
      getRuleEnforcingMetaPropertySeverity('schemaDescriptions'),
    ) /** @since 6.3.0 */ // 🟢(since 7.0.0)
    .addRule(
      'require-meta-type',
      getRuleEnforcingMetaPropertySeverity('type', 'enforce'),
    ) /** @since 2.0.0 */ // 🟢
    .enableConfigTesterForPlugin('eslint-plugin', {
      /* v8 ignore start */
      rulesToSkipInConfig: (ruleName) =>
        arrayIncludes(ESLINT_PLUGIN_TESTING_RELATED_RULES, ruleName),
      /* v8 ignore stop */
    })
    .addOverrides();

  const configBuilderRuleTests = context.createConfigBuilder(configRuleTests, 'eslint-plugin');

  configBuilderRuleTests
    ?.addConfig([
      'eslint-plugin/rule-tests',
      {
        filesDefault: generateDefaultTestFiles(GLOB_JS_TS_EXTENSION),
      },
    ])
    .addRule('consistent-output', ERROR) /** @since 0.7.0 */
    .addRule('no-identical-tests', ERROR) /** @since 0.7.4 */ // 🟢
    .addRule('no-only-tests', ERROR) /** @since 3.3.0 */ // 🟢
    .addRule('prefer-output-null', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('require-test-case-name', ERROR, [
      {require: 'objects-with-config'} /** Default: objects-with-config */,
    ]) /** @since 7.1.0 */
    .addRule('require-test-error-positions', WARNING) /** @since 7.4.0 */
    .addRule('test-case-property-ordering', ERROR) /** @since 0.8.0 */
    .addRule('test-case-shorthand-strings', ERROR) /** @since 0.4.0 */
    .addRule('unique-test-case-names', ERROR) /** @since 7.2.0 */
    .enableConfigTesterForPlugin('eslint-plugin', {
      /* v8 ignore start */
      rulesToSkipInConfig: (ruleName) =>
        !arrayIncludes(ESLINT_PLUGIN_TESTING_RELATED_RULES, ruleName),
      /* v8 ignore stop */
    })
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderRuleTests],
    optionsResolved,
  };
});
