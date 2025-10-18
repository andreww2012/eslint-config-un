import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {
  type NoOnlyTestsSubConfigEnabledByDefault,
  RULES_TO_DISABLE_IN_TEST_FILES,
  generateConfigNoOnlyTestsBuilder,
  generateDefaultTestFiles,
} from './shared';
import type {UnConfigFn} from './index';

export interface CypressEslintConfigOptions
  extends UnConfigOptions<'cypress'>,
    NoOnlyTestsSubConfigEnabledByDefault {}

export const cypressUnConfig: UnConfigFn<'cypress'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.cypress;
  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: true,
  } satisfies CypressEslintConfigOptions);

  const {configNoOnlyTests} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'cypress');

  const configFilesFallback = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
    includeCypressTests: true,
  });

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'cypress',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: configFilesFallback,
      },
    ])
    .addRule('assertion-before-screenshot', WARNING) /** @since 2.2.0 */
    .addRule('no-assigning-return-values', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('no-async-before', ERROR) /** @since 2.15.2 */
    .addRule('no-async-tests', ERROR) /** @since 2.11.0 */ // 🟢
    .addRule('no-chained-get', WARNING) /** @since 4.3.0 */
    .addRule('no-debug', ERROR) /** @since 3.5.0 */
    .addRule('no-force', WARNING) /** @since 2.10.0 */
    .addRule('no-pause', ERROR) /** @since 2.12.0 */
    .addRule('no-unnecessary-waiting', ERROR) /** @since 2.1.0 */ // 🟢
    .addRule('no-xpath', OFF) /** @since 4.2.0 */
    .addRule('require-data-selectors', OFF) /** @since 2.7.0 */
    .addRule('unsafe-to-chain-command', ERROR) /** @since 2.13.0 */ // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .enableConfigTesterForPlugin('cypress')
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'cypress',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: configFilesFallback},
  );

  return {
    configs: [configBuilder, configBuilderNoOnlyTests],
    optionsResolved,
  };
};
