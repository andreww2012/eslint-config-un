import {ERROR, GLOB_JS_TS_EXTENSION, OFF} from '../constants';
import {type RulesRecordPartial, type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {ConditionalKeys} from '../types';
import {assignDefaults} from '../utils';
import {RULES_TO_DISABLE_IN_TEST_FILES, generateDefaultTestFiles} from './shared';
import type {UnConfigFn} from './index';

export interface EslintPluginEslintConfigOptions extends UnConfigOptions<'eslint-plugin'> {
  /**
   * Includes rules for ESLint rule test files.
   * @default true
   */
  configRuleTests?:
    | boolean
    | UnConfigOptions<
        Pick<
          RulesRecordPartial<'eslint-plugin'>,
          `eslint-plugin/${
            | 'consistent-output'
            | 'no-identical-tests'
            | 'no-only-tests'
            | 'prefer-output-null'
            | 'test-case-property-ordering'
            | 'test-case-shorthand-strings'}`
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

export const eslintPluginUnConfig: UnConfigFn<'eslintPlugin'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.eslintPlugin;
  const optionsResolved = assignDefaults(optionsRaw, {
    configRuleTests: false,
  } satisfies EslintPluginEslintConfigOptions);

  const {configRuleTests, metaProperties = {}} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'eslint-plugin');

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
    .addRule('fixer-return', ERROR) // 🟢
    .addRule('meta-property-ordering', ERROR)
    .addRule('no-deprecated-context-methods', ERROR) // 🟢
    .addRule('no-deprecated-report-api', ERROR) // 🟢
    // `meta.deprecated` supported since ESLint 9.21.0
    .addRule('no-meta-replaced-by', getRuleDisallowingMetaPropertySeverity('replacedBy'))
    // `meta.defaultOptions` supported since ESLint 9.15.0
    .addRule(
      'no-meta-schema-default',
      getRuleDisallowingMetaPropertySeverity('schemaDefaultProperties'),
    )
    .addRule('no-missing-message-ids', ERROR) // 🟢
    .addRule('no-missing-placeholders', ERROR) // 🟢
    .addRule('no-property-in-node', ERROR) // 💭
    .addRule('no-unused-message-ids', ERROR) // 🟢
    .addRule('no-unused-placeholders', ERROR) // 🟢
    .addRule('no-useless-token-range', ERROR) // 🟢
    .addRule('prefer-message-ids', ERROR) // 🟢
    .addRule('prefer-object-rule', ERROR) // 🟢
    .addRule('prefer-placeholders', ERROR)
    .addRule('prefer-replace-text', ERROR)
    .addRule('report-message-format', ERROR, ['^[A-Z]'])
    // ESLint >=9.15.0
    .addRule('require-meta-default-options', getRuleEnforcingMetaPropertySeverity('defaultOptions'))
    .addRule(
      'require-meta-docs-description',
      getRuleEnforcingMetaPropertySeverity('docsDescription'),
    )
    .addRule(
      'require-meta-docs-recommended',
      getRuleEnforcingMetaPropertySeverity('docsRecommended'),
    )
    .addRule('require-meta-docs-url', getRuleEnforcingMetaPropertySeverity('docsUrl'))
    .addRule('require-meta-fixable', getRuleEnforcingMetaPropertySeverity('fixable', 'enforce')) // 🟢
    .addRule(
      'require-meta-has-suggestions',
      getRuleEnforcingMetaPropertySeverity('hasSuggestions', 'enforce'),
    ) // 🟢
    .addRule('require-meta-schema', getRuleEnforcingMetaPropertySeverity('schema', 'enforce')) // 🟢
    .addRule(
      'require-meta-schema-description',
      getRuleEnforcingMetaPropertySeverity('schemaDescriptions'),
    )
    .addRule('require-meta-type', getRuleEnforcingMetaPropertySeverity('type', 'enforce')) // 🟢
    .addOverrides();

  const configBuilderRuleTests = createConfigBuilder(context, configRuleTests, 'eslint-plugin');

  configBuilderRuleTests
    ?.addConfig([
      'eslint-plugin',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: generateDefaultTestFiles(GLOB_JS_TS_EXTENSION),
      },
    ])
    .addRule('consistent-output', ERROR)
    .addRule('no-identical-tests', ERROR) // 🟢
    .addRule('no-only-tests', ERROR) // 🟢
    .addRule('prefer-output-null', ERROR) // 🟢
    .addRule('test-case-property-ordering', ERROR)
    .addRule('test-case-shorthand-strings', ERROR)
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderRuleTests],
    optionsResolved,
  };
};
