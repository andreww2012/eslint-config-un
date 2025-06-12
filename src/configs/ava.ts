import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {RULES_TO_DISABLE_IN_TEST_FILES, generateDefaultTestFiles} from './shared';
import type {UnConfigFn} from './index';

export interface AvaEslintConfigOptions extends UnConfigOptions<'ava'> {
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
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies AvaEslintConfigOptions);

  const {enforceAssertionMessage, enforceMaxAssertions} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'ava');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'ava',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION),
      },
    ])
    .addRule(
      'assertion-arguments',
      ERROR,
      enforceAssertionMessage == null
        ? []
        : [{message: enforceAssertionMessage ? 'always' : 'never'}],
    ) // 🟢
    .addRule('hooks-order', ERROR) // 🟢
    .addRule(
      'max-asserts',
      enforceMaxAssertions == null ? OFF : ERROR,
      enforceMaxAssertions == null ? [] : [enforceMaxAssertions],
    )
    .addRule('no-async-fn-without-await', ERROR) // 🟢
    .addRule('no-duplicate-modifiers', ERROR) // 🟢
    .addRule('no-identical-title', ERROR) // 🟢
    .addRule('no-ignored-test-files', ERROR) // 🟢
    .addRule('no-import-test-files', ERROR) // 🟢
    .addRule('no-incorrect-deep-equal', ERROR) // 🟢
    .addRule('no-inline-assertions', ERROR) // 🟢
    .addRule('no-nested-tests', ERROR) // 🟢
    .addRule('no-only-test', ERROR) // 🟢
    .addRule('no-skip-assert', ERROR) // 🟢
    .addRule('no-skip-test', ERROR) // 🟢
    .addRule('no-todo-implementation', ERROR) // 🟢
    .addRule('no-todo-test', WARNING) // 🟡
    .addRule('no-unknown-modifiers', ERROR) // 🟢
    .addRule('prefer-async-await', ERROR) // 🟢
    .addRule('prefer-power-assert', OFF)
    .addRule('prefer-t-regex', ERROR) // 🟢
    .addRule('test-title', ERROR) // 🟢
    .addRule('test-title-format', OFF)
    .addRule('use-t', ERROR) // 🟢
    .addRule('use-t-throws-async-well', ERROR) // 🟢
    .addRule('use-t-well', ERROR) // 🟢
    .addRule('use-test', ERROR) // 🟢
    .addRule('use-true-false', ERROR) // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
