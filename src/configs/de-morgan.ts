import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface DeMorganEslintConfigOptions extends ConfigSharedOptions<'de-morgan'> {}

export const deMorganUnConfig: UnConfigFn<'deMorgan'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.deMorgan;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DeMorganEslintConfigOptions);

  const configBuilder = new ConfigEntryBuilder('de-morgan', optionsResolved, context);

  configBuilder
    .addConfig(['de-morgan', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-negated-conjunction', ERROR)
    .addRule('no-negated-disjunction', ERROR)
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};
