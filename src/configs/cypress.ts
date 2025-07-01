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
    .addRule('assertion-before-screenshot', WARNING)
    .addRule('no-assigning-return-values', ERROR) // 🟢
    .addRule('no-async-before', ERROR)
    .addRule('no-async-tests', ERROR) // 🟢
    .addRule('no-chained-get', WARNING)
    .addRule('no-debug', ERROR)
    .addRule('no-force', WARNING)
    .addRule('no-pause', ERROR)
    .addRule('no-unnecessary-waiting', ERROR) // 🟢
    .addRule('no-xpath', OFF)
    .addRule('require-data-selectors', OFF)
    .addRule('unsafe-to-chain-command', ERROR) // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
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
