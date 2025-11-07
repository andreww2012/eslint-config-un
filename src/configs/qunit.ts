// cspell:ignore jsdump propequal
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface QunitEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'qunit'>,
    NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins> {
  /**
   * [`eslint-plugin-qunit`](https://npmjs.com/eslint-plugin-qunit) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `qunit` property and applied to the specified `files` and `ignores`.
   */
  settings?: Record<string, unknown>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false, // has `no-only` rule
  } satisfies QunitEslintConfigOptions);

  const {settings: pluginSettings, configNoOnlyTests} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'qunit');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'qunit',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: configFilesFallback,
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            qunit: pluginSettings,
          },
        }),
      },
    )
    .addRule('assert-args', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('literal-compare-order', ERROR) /** @since 0.5.0 */ // 🟢
    .addRule('no-arrow-tests', OFF) /** @since 0.6.0 */
    .addRule('no-assert-equal', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-assert-equal-boolean', ERROR) /** @since 5.1.0 */ // 🟢
    .addRule('no-assert-logical-expression', ERROR) /** @since 2.2.0 */ // 🟢
    .addRule('no-assert-ok', WARNING) /** @since 4.1.0 */
    .addRule('no-async-in-loops', ERROR) /** @since 0.1.1 */ // 🟢
    .addRule('no-async-module-callbacks', ERROR) /** @since 5.4.0 */ // 🟢
    .addRule('no-async-test', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule('no-commented-tests', WARNING) /** @since 0.2.0 */ // 🟢
    .addRule('no-compare-relation-boolean', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-conditional-assertions', ERROR) /** @since 2.3.0 */ // 🟢
    .addRule('no-early-return', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('no-global-assertions', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-global-expect', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('no-global-module-test', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule('no-global-stop-start', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-hooks-from-ancestor-modules', ERROR) /** @since 5.4.0 */ // 🟢
    .addRule('no-identical-names', ERROR) /** @since 2.4.0 */ // 🟢
    .addRule('no-init', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-jsdump', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-loose-assertions', WARNING) /** @since 4.3.0 */
    .addRule('no-negated-ok', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('no-nested-tests', ERROR) /** @since 5.0.0 */ // 🟢
    .addRule('no-ok-equality', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('no-only', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('no-qunit-push', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-qunit-start-in-tests', ERROR) /** @since 2.3.0 */ // 🟢
    .addRule('no-qunit-stop', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-reassign-log-callbacks', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-reset', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('no-setup-teardown', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('no-skip', ERROR) /** @since 4.2.0 */
    .addRule('no-test-expect-argument', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-throws-string', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('require-expect', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('require-object-in-propequal', ERROR) /** @since 5.4.0 */ // 🟢
    .addRule('resolve-async', ERROR) /** @since 0.1.1 */ // 🟢
    .enableConfigTesterForPlugin('qunit')
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'qunit',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'qunit'>;
