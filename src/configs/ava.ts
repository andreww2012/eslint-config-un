import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  RULES_TO_DISABLE_IN_TEST_FILES,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
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
   * - [`assertion-arguments`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/assertion-arguments.md)
   */
  enforceAssertionMessage?: boolean;

  /**
   * Enforce a limit on the number of assertions in a test.
   *
   * Affected rules:
   * - [`max-asserts`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/max-asserts.md)
   */
  enforceMaxAssertions?: number;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false, // has `no-only-test` rule
  } satisfies AvaEslintConfigOptions);

  const {configNoOnlyTests, enforceAssertionMessage, enforceMaxAssertions} = optionsResolved;

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
    .addRule('hooks-order', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule(
      'max-asserts',
      enforceMaxAssertions == null ? OFF : ERROR,
      enforceMaxAssertions == null ? [] : [enforceMaxAssertions],
    ) // /** @since 1.0.0 */
    .addRule('no-async-fn-without-await', ERROR) /** @since 3.1.0 */ // 🟢
    .addRule('no-duplicate-modifiers', ERROR) /** @since 3.1.0 */ // 🟢
    .addRule('no-identical-title', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-ignored-test-files', ERROR) /** @since 2.0.0 */ // 🟢
    .addRule('no-import-test-files', ERROR) /** @since 5.0.0 */ // 🟢
    .addRule('no-incorrect-deep-equal', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule('no-inline-assertions', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule('no-nested-tests', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('no-only-test', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-skip-assert', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-skip-test', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-todo-implementation', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('no-todo-test', WARNING) /** @since 1.1.0 */ // 🟡
    .addRule('no-unknown-modifiers', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('prefer-async-await', ERROR) /** @since 3.0.0 */ // 🟢
    .addRule('prefer-power-assert', OFF) // /** @since 0.1.0 */
    .addRule('prefer-t-regex', ERROR) /** @since 7.0.0 */ // 🟢
    .addRule('test-title', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('test-title-format', OFF) // /** @since 7.0.0 */
    .addRule('use-t', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('use-t-throws-async-well', ERROR) /** @since 10.3.0 */ // 🟢
    .addRule('use-t-well', ERROR) /** @since 2.2.0 */ // 🟢
    .addRule('use-test', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('use-true-false', ERROR) /** @since 2.2.0 */ // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'ava',
    configNoOnlyTests,
    optionsResolved,
    {filesDefault: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'ava'>;
