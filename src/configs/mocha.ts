import globals from 'globals';
import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  generateConfigNoOnlyTests,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type MochaInterface = 'BDD' | 'TDD' | 'require';

/**
 * [`eslint-plugin-mocha`](https://npmx.dev/eslint-plugin-mocha) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `settings` flat config option with keys transformed to
 * `mocha/<property>` and applied to the resolved `files` and `ignores` of this config.
 * @see https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/README.md#plugin-settings
 */
export interface MochaPluginSettings {
  /**
   * Wrappers around the Mocha functions that the rules must recognize as those functions
   */
  additionalCustomNames?: {
    /**
     * The name of the wrapper, which may be a member expression such as `describe.only`
     */
    name: string;

    /**
     * Which kind of Mocha function the wrapper stands for
     */
    type: 'hook' | 'suite' | 'testCase';

    /**
     * The Mocha interface the wrapper belongs to
     */
    interface: MochaInterface;
  }[];

  /**
   * The Mocha interface the linted code uses.
   * With `require`, the rules resolve Mocha functions from named imports instead of globals.
   * @default 'BDD'
   */
  interface?: MochaInterface;
}

/**
 * [Mocha](https://mochajs.org) specific rules.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
 * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
 */
export interface MochaEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'mocha'>,
    NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins> {
  /**
   * Affected rule:
   * - [`mocha/consistent-interface`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/consistent-interface.md)
   */
  enforceInterface?: GetRuleOptions<'mocha', 'consistent-interface'>['interface'];

  /**
   * Enforce the max number of top-level suites in a single file.
   *
   * Affected rule:
   * - [`vitest/max-top-level-suites`](https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/max-top-level-suites.md)
   * @default 1
   */
  maxTopLevelSuites?: number;
}

export default defineUnConfig<MochaEslintConfigOptions>('mocha', {
  enabledBy: {package: 'mocha'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: true,
    maxTopLevelSuites: 1,
  });

  const {configNoOnlyTests, enforceInterface, maxTopLevelSuites} = optionsResolved;

  const pluginSettings = context.getPluginSettings('mocha');

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
    .addRule('consistent-structure', ERROR) /** @since 12.0.0 */ // 🟢
    .addRule('handle-done-callback', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('limit-retries', OFF) /** @since 12.0.0 */
    .addRule('limit-slow', OFF) /** @since 12.0.0 */
    .addRule('limit-timeout', OFF) /** @since 12.0.0 */
    .addRule('max-top-level-suites', ERROR, [{limit: maxTopLevelSuites}]) /** @since 4.6.0 */
    .addRule('no-async-and-done', ERROR) /** @since 12.0.0 */ // 🟢
    .addRule('no-async-in-sync-tests', ERROR) /** @since 12.0.0 */ // 🟢
    .addRule('no-async-suite', ERROR) /** @since 11.0.0 */ // 🟢
    .addRule('no-code-after-done', ERROR) /** @since 12.0.0 */ // 🟢
    .addRule('no-conditional-tests', ERROR) /** @since 12.0.0 */ // 🟢
    .addRule('no-done-twice', ERROR) /** @since 12.0.0 */ // 🟢
    .addRule('no-empty-title', ERROR) /** @since 11.0.0 */ // 🟢
    .addRule('no-exclusive-tests', ERROR) /** @since 0.1.0 */ // 🟡
    .addRule('no-exports', ERROR) /** @since 8.0.0 */ // 🟢
    .addRule('no-hooks', OFF) /** @since 4.3.0 */
    .addRule(
      'no-hooks-for-single-child',
      WARNING,
    ) /** @since 4.4.0 */ /** @aka no-hooks-for-single-case */
    .addRule('no-identical-title', ERROR) /** @since 4.5.0 */ // 🟢
    .addRule('no-mocha-arrows', ERROR) /** @since 4.1.0 */ // 🟢
    .addRule('no-nested-suites', OFF) /** @since 12.0.0 */
    .addRule('no-nested-tests', ERROR) /** @since 4.7.0 */ // 🟢
    .addRule('no-pending-tests', ERROR) /** @since 2.2.0 */ // 🟡
    .addRule('no-return-and-done', ERROR) /** @since 4.4.0 */ /** @aka no-return-and-callback */ // 🟢
    .addRule('no-return-from-async', ERROR) /** @since 6.0.0 */
    .addRule('no-root-hooks', ERROR) /** @since 4.4.0 */ /** @aka no-top-level-hooks */ // 🟡
    .addRule('no-setup-in-suite', ERROR) /** @since 4.12.0 */ /** @aka no-setup-in-describe */ // 🟢
    .addRule('no-synchronous-tests', OFF) /** @since 0.5.1 */
    .addRule('no-top-level-tests', ERROR) /** @since 1.1.0 */ /** @aka no-global-tests */ // 🟢
    .addRule('prefer-arrow-callback', OFF) /** @since 5.1.0 */
    .addRule('valid-suite-title', OFF) /** @since 11.0.0 */
    .addRule('valid-test-title', OFF) /** @since 11.0.0 */
    .enableConfigTesterForPlugin('mocha')
    .addOverrides();

  generateConfigNoOnlyTests(context, 'mocha', configNoOnlyTests, optionsResolved, {
    filesDefault: configFilesFallback,
  });
});
