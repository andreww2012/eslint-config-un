import {WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface PreferArrowFunctionsEslintConfigOptions
  extends ConfigSharedOptions<'prefer-arrow-functions'> {}

export const preferArrowFunctionsUnConfig: UnConfigFn<'preferArrowFunctions'> = (context) => {
  const optionsRaw = context.globalOptions.configs?.preferArrowFunctions;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies PreferArrowFunctionsEslintConfigOptions,
  );

  const configBuilder = new ConfigEntryBuilder('prefer-arrow-functions', optionsResolved, context);

  configBuilder
    .addConfig(['prefer-arrow-functions', {includeDefaultFilesAndIgnores: true}])
    .addRule('prefer-arrow-functions', WARNING)
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};
