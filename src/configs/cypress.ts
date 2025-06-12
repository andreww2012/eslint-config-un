import {ERROR, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {RULES_TO_DISABLE_IN_TEST_FILES, generateDefaultTestFiles} from './shared';
import type {UnConfigFn} from './index';

export interface CypressEslintConfigOptions extends UnConfigOptions<'cypress'> {}

export const cypressUnConfig: UnConfigFn<'cypress'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.cypress;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CypressEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'cypress');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'cypress',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
          includeCypressTests: true,
        }),
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

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
