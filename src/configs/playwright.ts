// cspell:ignore networkidle
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

export interface PlaywrightEslintConfigOptions
  extends UnConfigOptions<'playwright'>,
    NoOnlyTestsSubConfigDisabledByDefault {
  /**
   * [`eslint-plugin-playwright`](https://npmjs.com/eslint-plugin-playwright) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `playwright` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * "If you import Playwright globals (e.g. `test`, `expect`) with a custom name, you can configure this plugin to be aware of these additional names" - plugin docs
     */
    globalAliases?: {
      test?: string[];
      expect?: string[];
    };

    /**
     * "You can customize the error messages for rules using the `messages` property.
     * This is useful if you would like to increase the verbosity of error messages
     * or provide additional context. Only the message ids you define in this setting
     * will be overridden, so any other messages will use the default message
     * defined by the plugin" - plugin docs
     */
    messages?: Record<string, string>;
  };

  /**
   * Names of functions that should be considered to be asserting functions.
   *
   * Affected rules:
   * - [`expect-expect`](https://github.com/playwright-community/eslint-plugin-playwright/blob/HEAD/docs/rules/expect-expect.md)
   */
  customAssertFunctionNames?: string[];

  /**
   * Affected rules:
   * - [`missing-playwright-await`](https://github.com/playwright-community/eslint-plugin-playwright/blob/HEAD/docs/rules/missing-playwright-await.md)
   */
  customAsyncExpectMatches?: string[];
}

export const playwrightUnConfig: UnConfigFn<'playwright'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.playwright;
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false,
  } satisfies PlaywrightEslintConfigOptions);

  const {
    settings: pluginSettings,
    configNoOnlyTests,
    customAssertFunctionNames,
    customAsyncExpectMatches,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'playwright');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(
      [
        'playwright',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: configFilesFallback,
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            playwright: pluginSettings,
          },
        }),
      },
    )
    .addRule(
      'expect-expect',
      ERROR,
      customAssertFunctionNames?.length
        ? [{assertFunctionNames: customAssertFunctionNames as [string]}]
        : [],
    ) // 🟡
    .addRule('max-expects', OFF)
    .addRule('max-nested-describe', WARNING) // 🟡
    .addRule(
      'missing-playwright-await',
      ERROR,
      customAsyncExpectMatches?.length ? [{customMatchers: customAsyncExpectMatches}] : [],
    ) // 🟢
    .addRule('no-commented-out-tests', WARNING)
    .addRule('no-conditional-expect', ERROR) // 🟡
    .addRule('no-conditional-in-test', OFF) // 🟡
    .addRule('no-duplicate-hooks', ERROR)
    .addRule('no-element-handle', ERROR) // 🟡
    .addRule('no-eval', WARNING) // 🟡
    .addRule('no-focused-test', ERROR) // 🟢
    .addRule('no-force-option', WARNING) // 🟡
    .addRule('no-get-by-title', WARNING)
    .addRule('no-hooks', OFF)
    .addRule('no-nested-step', OFF) // 🟡
    .addRule('no-networkidle', ERROR) // 🟢
    .addRule('no-nth-methods', OFF)
    .addRule('no-page-pause', WARNING) // 🟡
    .addRule('no-raw-locators', OFF)
    .addRule('no-restricted-matchers', OFF)
    .addRule('no-skipped-test', ERROR) // 🟡
    .addRule('no-slowed-test', OFF)
    .addRule('no-standalone-expect', ERROR) // 🟢
    .addRule('no-unsafe-references', ERROR) // 🟢
    .addRule('no-useless-await', ERROR) // 🟡
    .addRule('no-useless-not', ERROR) // 🟡
    .addRule('no-wait-for-navigation', ERROR) // 🟢
    .addRule('no-wait-for-selector', OFF) // 🟡
    .addRule('no-wait-for-timeout', OFF) // 🟡
    .addRule('prefer-comparison-matcher', ERROR)
    .addRule('prefer-equality-matcher', ERROR)
    .addRule('prefer-hooks-in-order', ERROR)
    .addRule('prefer-hooks-on-top', ERROR)
    .addRule('prefer-locator', WARNING)
    .addRule('prefer-lowercase-title', ERROR)
    .addRule('prefer-native-locators', WARNING)
    .addRule('prefer-strict-equal', WARNING)
    .addRule('prefer-to-be', ERROR)
    .addRule('prefer-to-contain', ERROR)
    .addRule('prefer-to-have-count', ERROR)
    .addRule('prefer-to-have-length', ERROR)
    .addRule('prefer-web-first-assertions', ERROR) // 🟢
    .addRule('require-hook', WARNING)
    .addRule('require-soft-assertions', OFF)
    .addRule('require-to-throw-message', OFF)
    .addRule('require-top-level-describe', OFF)
    .addRule('valid-describe-callback', ERROR) // 🟢
    .addRule('valid-expect', ERROR) // 🟢
    .addRule('valid-expect-in-promise', ERROR) // 🟢
    .addRule('valid-test-tags', ERROR) // 🟢
    .addRule('valid-title', ERROR) // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'playwright',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
};
