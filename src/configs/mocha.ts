import globals from 'globals';
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface MochaEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'mocha'>,
    NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins> {
  /**
   * [`eslint-plugin-mocha`](https://npmx.dev/eslint-plugin-mocha) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `settings` object with keys transformed to
   * `mocha/<property>` and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    additionalCustomNames?: {
      name: string;
      type: 'config' | 'hook' | 'suite' | 'testCase';
      interface: 'BDD' | 'TDD' | 'exports';
    }[];
  };

  /**
   * Affected rules:
   * - [`mocha/consistent-interface`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/docs/rules/consistent-interface.md)
   */
  enforceInterface?: GetRuleOptions<'mocha', 'consistent-interface'>['interface'];

  /**
   * Enforce the max number of top-level suites in a single file.
   *
   * Affected rules:
   * - [`vitest/max-top-level-suites`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/max-top-level-suites.md)
   * @default 1
   */
  maxTopLevelSuites?: number;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: true,
    maxTopLevelSuites: 1,
  });

  const {
    settings: pluginSettings,
    configNoOnlyTests,
    enforceInterface,
    maxTopLevelSuites,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'mocha');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(
      [
        'mocha',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: configFilesFallback,
          settings: {
            '': {
              ...Object.fromEntries(
                Object.entries(pluginSettings || {}).map(([name, value]) => [
                  `mocha/${name}`,
                  value,
                ]),
              ),
            },
          },
        },
      ],
      {
        languageOptions: {
          globals: globals.mocha,
        },
      },
    )
    .addRule(
      'consistent-interface',
      enforceInterface == null ? OFF : ERROR,
      enforceInterface == null ? [] : [{interface: enforceInterface}],
    ) /** @since 11.0.0 */
    .addRule('consistent-spacing-between-blocks', OFF) /** @since 10.3.0 */ // 🟢
    .addRule('handle-done-callback', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('max-top-level-suites', ERROR, [{limit: maxTopLevelSuites}]) /** @since 4.6.0 */
    .addRule('no-async-suite', ERROR) /** @since 11.0.0 */ // 🟢
    .addRule('no-empty-title', ERROR) /** @since 11.0.0 */ // 🟢
    .addRule('no-exclusive-tests', ERROR) /** @since 0.1.0 */ // 🟡
    .addRule('no-exports', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule('no-global-tests', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-hooks', OFF) /** @since 4.3.0 */
    .addRule('no-hooks-for-single-case', WARNING) /** @since 4.4.0 */
    .addRule('no-identical-title', ERROR) /** @since 4.5.0 */ // 🟢
    .addRule('no-mocha-arrows', ERROR) /** @since 4.1.0 */ // 🟢
    .addRule('no-nested-tests', ERROR) /** @since 4.7.0 */ // 🟢
    .addRule('no-pending-tests', ERROR) /** @since 2.2.0 */ // 🟡
    .addRule('no-return-and-callback', ERROR) /** @since 4.4.0 */ // 🟢
    .addRule('no-return-from-async', ERROR) /** @since 6.0.0 */
    .addRule('no-setup-in-describe', ERROR) /** @since 4.12.0 */ // 🟢
    .addRule('no-sibling-hooks', ERROR) /** @since 4.3.0 */ // 🟢
    .addRule('no-synchronous-tests', OFF) /** @since 0.5.1 */
    .addRule('no-top-level-hooks', ERROR) /** @since 4.4.0 */ // 🟡
    .addRule('prefer-arrow-callback', OFF) /** @since 5.1.0 */
    .addRule('valid-suite-title', OFF) /** @since 11.0.0 */
    .addRule('valid-test-title', OFF) /** @since 11.0.0 */
    .enableConfigTesterForPlugin('mocha')
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'mocha',
    configNoOnlyTests,
    optionsResolved,
    {filesDefault: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'mocha'>;
