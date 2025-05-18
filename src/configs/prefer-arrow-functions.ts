import {WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface PreferArrowFunctionsEslintConfigOptions
  extends UnConfigOptions<'prefer-arrow-functions'> {}

export const preferArrowFunctionsUnConfig: UnConfigFn<'preferArrowFunctions'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.preferArrowFunctions;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies PreferArrowFunctionsEslintConfigOptions,
  );

  const configBuilder = createConfigBuilder(context, optionsResolved, 'prefer-arrow-functions');

  configBuilder
    ?.addConfig([
      'prefer-arrow-functions',
      {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true},
    ])
    .addRule('prefer-arrow-functions', WARNING)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
