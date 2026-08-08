import {ERROR, GLOB_JS_TS_X_EXTENSION, GLOB_PACKAGE_JSON, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

export interface AvaEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'ava'>,
    NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins> {
  /**
   * If `true`, all assertions will need to have an assertion message.
   * If set to `false`, no assertion may have an assertion message.
   * If omitted, no reports about the assertion message will be made.
   *
   * Affected rules:
   * - [`ava/assertion-arguments`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/assertion-arguments.md)
   */
  enforceAssertionMessage?: boolean;

  /**
   * Enforce a limit on the number of assertions in a test.
   *
   * Affected rules:
   * - [`ava/max-asserts`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/max-asserts.md)
   */
  enforceMaxAssertions?: number;

  /**
   * Enables or specifies the configuration for the sub-config targeting `package.json` files,
   * which requires a JSON parser. Currently only enables the
   * [`ava/no-ava-in-dependencies`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-ava-in-dependencies.md)
   * rule, which disallows AVA in `dependencies`.
   * @default true
   */
  configPackageJson?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'ava'>, 'ava/no-ava-in-dependencies'>
      >;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false, // has `ava/no-only-test` rule
    configPackageJson: true,
  });

  const {configNoOnlyTests, configPackageJson, enforceAssertionMessage, enforceMaxAssertions} =
    optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'ava');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'ava',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: configFilesFallback,
      },
    ])
    .addRule(
      'assertion-arguments',
      ERROR,
      enforceAssertionMessage == null
        ? []
        : [{message: enforceAssertionMessage ? 'always' : 'never'}],
    ) /** @since 2.3.0 */ // 🟢
    .addRule('failing-test-url', OFF) /** @since 16.0.0 */
    .addRule('hooks-order', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule(
      'max-asserts',
      enforceMaxAssertions == null ? OFF : ERROR,
      enforceMaxAssertions == null ? [] : [{max: enforceMaxAssertions}],
    ) // /** @since 1.0.0 */
    .addRule('no-async-fn-without-await', ERROR) /** @since 3.1.0 */ // 🟢
    .addRule('no-commented-tests', WARNING) /** @since 16.0.0 */ // 🟡
    .addRule('no-conditional-assertion', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('no-duplicate-hooks', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('no-identical-title', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-ignored-test-files', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('no-import-test-files', ERROR) /** @since 5.0.0 */ // 🟢
    .addRule('no-incorrect-deep-equal', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule('no-inline-assertions', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule('no-invalid-modifier-chain', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('no-negated-assertion', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('no-nested-assertions', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('no-nested-tests', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('no-only-test', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-skip-assert', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-skip-test', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-todo-implementation', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('no-todo-test', WARNING) /** @since 1.1.0 */ // 🟡
    .addRule('no-useless-t-pass', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('prefer-async-await', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('prefer-power-assert', OFF) // /** @since 0.1.0 */
    .addRule('prefer-t-regex', ERROR) /** @since 7.0.0 */ // 🟢
    .addRule('prefer-t-throws', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('require-assertion', ERROR) /** @since 16.0.0 */ // 🟢
    .addRule('test-title', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('test-title-format', OFF) // /** @since 7.0.0 */
    .addRule('use-t', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('use-t-throws-async-well', ERROR) /** @since 10.3.0 */ // 🟢
    .addRule('use-t-well', ERROR) /** @since 2.2.0 */ // 🟢
    .addRule('use-test', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('use-true-false', ERROR) /** @since 2.2.0 */ // 🟢
    .enableConfigTesterForPlugin('ava', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => ruleName === 'no-ava-in-dependencies',
    })
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'ava',
    configNoOnlyTests,
    optionsResolved,
    {filesDefault: configFilesFallback},
  );

  const configBuilderPackageJson = context.createConfigBuilder(configPackageJson, 'ava');
  configBuilderPackageJson
    ?.addConfig([
      'ava/package.json',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_PACKAGE_JSON],
        language: ['json', 'json'],
      },
    ])
    .addRule('no-ava-in-dependencies', ERROR) /** @since 16.0.0 */ // 🟢
    .enableConfigTesterForPlugin('ava', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => ruleName !== 'no-ava-in-dependencies',
    })
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderNoOnlyTests, configBuilderPackageJson],
    optionsResolved,
  };
}) satisfies UnConfigFn<'ava'>;
