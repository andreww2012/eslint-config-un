// cspell:ignore networkidle
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface PlaywrightEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'playwright'>,
    NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins> {
  /**
   * [`eslint-plugin-playwright`](https://npmx.dev/eslint-plugin-playwright) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `playwright` property
   * and applied to the resolved `files` and `ignores` of this config.
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
   * Affected rule:
   * - [`playwright/expect-expect`](https://github.com/playwright-community/eslint-plugin-playwright/blob/HEAD/docs/rules/expect-expect.md)
   */
  customAssertFunctionNames?: string[];

  /**
   * Affected rule:
   * - [`playwright/missing-playwright-await`](https://github.com/playwright-community/eslint-plugin-playwright/blob/HEAD/docs/rules/missing-playwright-await.md)
   */
  customAsyncExpectMatches?: string[];
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false,
  });

  const {
    settings: pluginSettings,
    configNoOnlyTests,
    customAssertFunctionNames,
    customAsyncExpectMatches,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'playwright');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'playwright',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: configFilesFallback,
        settings: {
          playwright: pluginSettings,
        },
      },
    ])
    .addRule('consistent-spacing-between-blocks', ERROR) /** @since 2.5.0 */ // 🟡
    .addRule(
      'expect-expect',
      ERROR,
      customAssertFunctionNames?.length
        ? [{assertFunctionNames: customAssertFunctionNames as [string]}]
        : [],
    ) /** @since 0.15.0 */ // 🟡
    .addRule('max-expects', OFF) /** @since 1.2.0 */
    .addRule('max-nested-describe', WARNING) /** @since 0.10.0 */ // 🟡
    .addRule(
      'missing-playwright-await',
      ERROR,
      customAsyncExpectMatches?.length ? [{customMatchers: customAsyncExpectMatches}] : [],
    ) /** @since 0.3.3 */ // 🟢
    .addRule('no-commented-out-tests', WARNING) /** @since 1.2.0 */
    .addRule('no-conditional-expect', ERROR) /** @since 1.2.0 */ // 🟡
    .addRule('no-conditional-in-test', OFF) /** @since 0.10.0 */ // 🟡
    .addRule('no-duplicate-hooks', ERROR) /** @since 1.2.0 */
    .addRule('no-duplicate-slow', ERROR) /** @since 2.6.0 */ // 🟢
    .addRule('no-element-handle', ERROR) /** @since 0.9.0 */ // 🟡
    .addRule('no-eval', WARNING) /** @since 0.9.0 */ // 🟡
    .addRule('no-focused-test', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-force-option', WARNING) /** @since 0.9.0 */ // 🟡
    .addRule('no-get-by-title', WARNING) /** @since 1.0.0 */
    .addRule('no-hooks', OFF) /** @since 1.3.0 */
    .addRule('no-nested-step', OFF) /** @since 0.15.0 */ // 🟡
    .addRule('no-networkidle', ERROR) /** @since 0.14.0 */ // 🟢
    .addRule('no-nth-methods', OFF) /** @since 0.15.0 */
    .addRule('no-page-pause', WARNING) /** @since 0.7.0 */ // 🟡
    .addRule('no-raw-locators', OFF) /** @since 0.16.0 */
    .addRule('no-restricted-locators', OFF) /** @since 2.5.0 */
    .addRule('no-restricted-matchers', OFF) /** @since 0.11.1 */
    .addRule('no-restricted-roles', OFF) /** @since 2.6.0 */
    .addRule('no-skipped-test', ERROR) /** @since 0.9.0 */ // 🟡
    .addRule('no-slowed-test', OFF) /** @since 2.2.0 */
    .addRule('no-standalone-expect', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-unsafe-references', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-unused-locators', ERROR) /** @since 2.3.0 */ // 🟢
    .addRule('no-useless-await', ERROR) /** @since 0.14.0 */ // 🟡
    .addRule('no-useless-not', ERROR) /** @since 0.11.1 */ // 🟡
    .addRule('no-wait-for-navigation', ERROR) /** @since 2.2.1 */ // 🟢
    .addRule('no-wait-for-selector', OFF) /** @since 0.22.0 */ // 🟡
    .addRule('no-wait-for-timeout', OFF) /** @since 0.9.0 */ // 🟡
    .addRule('prefer-comparison-matcher', ERROR) /** @since 1.3.0 */
    .addRule('prefer-equality-matcher', ERROR) /** @since 1.3.0 */
    .addRule('prefer-hooks-in-order', ERROR) /** @since 1.2.0 */
    .addRule('prefer-hooks-on-top', ERROR) /** @since 1.2.0 */
    .addRule('prefer-locator', WARNING) /** @since 1.7.0 */
    .addRule('prefer-lowercase-title', ERROR) /** @since 0.11.1 */
    .addRule('prefer-native-locators', WARNING) /** @since 1.7.0 */
    .addRule('prefer-strict-equal', WARNING) /** @since 0.12.0 */
    .addRule('prefer-to-be', ERROR) /** @since 0.12.0 */
    .addRule('prefer-to-contain', ERROR) /** @since 0.15.0 */
    .addRule('prefer-to-have-count', ERROR) /** @since 0.17.0 */
    .addRule('prefer-to-have-length', ERROR) /** @since 0.11.1 */
    .addRule('prefer-web-first-assertions', ERROR) /** @since 0.13.0 */ // 🟢
    .addRule('require-hook', WARNING) /** @since 1.3.0 */
    .addRule('require-soft-assertions', OFF) /** @since 0.12.0 */
    .addRule('require-tags', OFF) /** @since 2.6.0 */
    .addRule('require-to-pass-timeout', OFF) /** @since 2.6.0 */
    .addRule('require-to-throw-message', OFF) /** @since 1.4.0 */
    .addRule('require-top-level-describe', OFF) /** @since 0.11.1 */
    .addRule('valid-describe-callback', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('valid-expect', ERROR) /** @since 0.11.1 */ // 🟢
    .addRule('valid-expect-in-promise', ERROR) /** @since 1.4.0 */ // 🟢
    .addRule('valid-test-tags', ERROR) /** @since 2.2.1 */ // 🟢
    .addRule('valid-title', ERROR) /** @since 0.19.0 */ // 🟢
    .enableConfigTesterForPlugin('playwright')
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'playwright',
    configNoOnlyTests,
    optionsResolved,
    {filesDefault: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'playwright'>;
