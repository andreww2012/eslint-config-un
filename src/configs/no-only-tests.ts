import {ERROR, GLOB_JS_TS_X_EXTENSION} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import {generateDefaultTestFiles} from './shared';
import type {UnConfigFn} from './index';

export interface NoOnlyTestsEslintConfigOptions extends UnConfigOptions<'no-only-tests'> {}

export const noOnlyTestsUnConfig: UnConfigFn<'noOnlyTests'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.noOnlyTests;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies NoOnlyTestsEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'no-only-tests');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'no-only-tests',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION),
      },
    ])
    .addRule('no-only-tests', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
