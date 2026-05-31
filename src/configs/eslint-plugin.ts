import {ERROR, GLOB_JS_TS_EXTENSION, OFF} from '../constants';
import type {ConditionalKeys} from '../types';
import {generateDefaultTestFiles} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

const ESLINT_PLUGIN_TESTING_RELATED_RULES = [
  'consistent-output',
  'no-identical-tests',
  'no-only-tests',
  'prefer-output-null',
  'test-case-property-ordering',
  'test-case-shorthand-strings',
] satisfies GetRuleNamesInPlugin<'eslint-plugin'>[];
const ESLINT_PLUGIN_TESTING_RELATED_RULES_SET = new Set<string>(
  ESLINT_PLUGIN_TESTING_RELATED_RULES,
);

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
   * - `replacedBy`: [`no-meta-replaced-by`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/no-meta-replaced-by.md)
   * - `schemaDefaultProperties`: [`no-meta-schema-default`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/no-meta-schema-default.md)
   * - `defaultOptions`: [`require-meta-default-options`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-default-options.md)
   * - `docsDescription`: [`require-meta-docs-description`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-docs-description.md)
   * - `docsRecommended`: [`require-meta-docs-recommended`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-docs-recommended.md)
   * - `docsUrl`: [`require-meta-docs-url`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-docs-url.md)
   * - `fixable`: [`require-meta-fixable`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-fixable.md)
   * - `hasSuggestions`: [`require-meta-has-suggestions`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-has-suggestions.md)
   * - `schema`: [`require-meta-schema`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-schema.md)
   * - `schemaDescriptions`: [`require-meta-schema-description`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-schema-description.md)
   * - `type`: [`require-meta-type`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/require-meta-type.md)
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
        | 'schema'
        | 'schemaDescriptions'
        | 'type',
        'enforce' | 'not-enforce'
      >
  >;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configRuleTests: false,
  });

  const {configRuleTests, metaProperties = {}} = optionsResolved;

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
    ?.addConfig(['eslint-plugin', {includeDefaultFilesAndIgnores: true}])
    .addRule('fixer-return', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('meta-property-ordering', ERROR) /** @since 2.1.0 */
    .addRule('no-deprecated-context-methods', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-deprecated-report-api', ERROR) /** @since 0.1.0 */ // 🟢
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
    .addRule('require-test-case-name', ERROR, [
      {require: 'objects-with-config'} /** Default: objects-with-config */,
    ]) /** @since 7.1.0 */
    .addRule('unique-test-case-names', ERROR) /** @since 7.2.0 */
    .enableConfigTesterForPlugin('eslint-plugin', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => ESLINT_PLUGIN_TESTING_RELATED_RULES_SET.has(ruleName),
    })
    .addOverrides();

  const configBuilderRuleTests = context.createConfigBuilder(configRuleTests, 'eslint-plugin');

  configBuilderRuleTests
    ?.addConfig([
      'eslint-plugin/rule-tests',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: generateDefaultTestFiles(GLOB_JS_TS_EXTENSION),
      },
    ])
    .addRule('consistent-output', ERROR) /** @since 0.7.0 */
    .addRule('no-identical-tests', ERROR) /** @since 0.7.4 */ // 🟢
    .addRule('no-only-tests', ERROR) /** @since 3.3.0 */ // 🟢
    .addRule('prefer-output-null', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('test-case-property-ordering', ERROR) /** @since 0.8.0 */
    .addRule('test-case-shorthand-strings', ERROR) /** @since 0.4.0 */
    .enableConfigTesterForPlugin('eslint-plugin', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !ESLINT_PLUGIN_TESTING_RELATED_RULES_SET.has(ruleName),
    })
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderRuleTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'eslintPlugin'> as UnConfigFn<'eslintPlugin'>;
