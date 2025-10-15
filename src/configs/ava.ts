import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  RULES_TO_DISABLE_IN_TEST_FILES,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import type {UnConfigFn} from './index';

export interface AvaEslintConfigOptions
  extends UnConfigOptions<'ava'>,
    NoOnlyTestsSubConfigDisabledByDefault {
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

export const avaUnConfig: UnConfigFn<'ava'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.ava;
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false, // has `no-only-test` rule
  } satisfies AvaEslintConfigOptions);

  const {configNoOnlyTests, enforceAssertionMessage, enforceMaxAssertions} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'ava');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'ava',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: configFilesFallback,
      },
    ])
    .addRule(
      'assertion-arguments',
      ERROR,
      enforceAssertionMessage == null
        ? []
        : [{message: enforceAssertionMessage ? 'always' : 'never'}],
    ) // 🟢 >=2.3.0
    .addRule('hooks-order', ERROR) // 🟢 >=8.0.0
    .addRule(
      'max-asserts',
      enforceMaxAssertions == null ? OFF : ERROR,
      enforceMaxAssertions == null ? [] : [enforceMaxAssertions],
    ) // >=1.0.0
    .addRule('no-async-fn-without-await', ERROR) // 🟢 >=3.1.0
    .addRule('no-duplicate-modifiers', ERROR) // 🟢 >=3.1.0
    .addRule('no-identical-title', ERROR) // 🟢 >=1.0.0
    .addRule('no-ignored-test-files', ERROR) // 🟢 >=2.0.0
    .addRule('no-import-test-files', ERROR) // 🟢 >=5.0.0
    .addRule('no-incorrect-deep-equal', ERROR) // 🟢 >=8.0.0
    .addRule('no-inline-assertions', ERROR) // 🟢 >=8.0.0
    .addRule('no-nested-tests', ERROR) // 🟢 >=3.0.0
    .addRule('no-only-test', ERROR) // 🟢 >=1.0.0
    .addRule('no-skip-assert', ERROR) // 🟢 >=1.0.0
    .addRule('no-skip-test', ERROR) // 🟢 >=1.0.0
    .addRule('no-todo-implementation', ERROR) // 🟢 >=3.0.0
    .addRule('no-todo-test', WARNING) // 🟡 >=1.1.0
    .addRule('no-unknown-modifiers', ERROR) // 🟢 >=1.4.0
    .addRule('prefer-async-await', ERROR) // 🟢 >=3.0.0
    .addRule('prefer-power-assert', OFF) // >=0.1.0
    .addRule('prefer-t-regex', ERROR) // 🟢 >=7.0.0
    .addRule('test-title', ERROR) // 🟢 >=1.0.0
    .addRule('test-title-format', OFF) // >=7.0.0
    .addRule('use-t', ERROR) // 🟢 >=1.2.0
    .addRule('use-t-throws-async-well', ERROR) // 🟢 >=10.3.0
    .addRule('use-t-well', ERROR) // 🟢 >=2.2.0
    .addRule('use-test', ERROR) // 🟢 >=1.2.0
    .addRule('use-true-false', ERROR) // 🟢 >=2.2.0
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'ava',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
};
