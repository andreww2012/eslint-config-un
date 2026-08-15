import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Cypress](https://www.cypress.io) specific rules.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
 * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
 */
export interface CypressEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'cypress'>,
    NoOnlyTestsSubConfigEnabledByDefault<ExtraPlugins> {}

export default defineUnConfig<CypressEslintConfigOptions>('cypress', {
  enabledBy: {package: 'cypress'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: true,
  });

  const {configNoOnlyTests} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'cypress');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
    includeCypressTests: true,
  });

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'cypress',
      {
        filesDefault: configFilesFallback,
      },
    ])
    .addRule('assertion-before-screenshot', WARNING) /** @since 2.2.0 */
    .addRule('no-and', ERROR) /** @since 6.3.0 */
    .addRule('no-assigning-return-values', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('no-async-before', ERROR) /** @since 2.15.2 */
    .addRule('no-async-tests', ERROR) /** @since 2.11.0 */ // 🟢
    .addRule('no-chained-get', WARNING) /** @since 4.3.0 */
    .addRule('no-debug', ERROR) /** @since 3.5.0 */
    .addRule('no-force', WARNING) /** @since 2.10.0 */
    .addRule('no-pause', ERROR) /** @since 2.12.0 */
    .addRule('no-unnecessary-waiting', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('require-data-selectors', OFF) /** @since 2.7.0 */
    .addRule('unsafe-to-chain-command', ERROR) /** @since 2.13.0 */ // 🟢
    .enableConfigTesterForPlugin('cypress')
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'cypress',
    configNoOnlyTests,
    optionsResolved,
    {filesDefault: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
});
