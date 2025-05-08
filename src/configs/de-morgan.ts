import {ERROR} from '../constants';
import {type ConfigSharedOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface DeMorganEslintConfigOptions extends ConfigSharedOptions<'de-morgan'> {}

export const deMorganUnConfig: UnConfigFn<'deMorgan'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.deMorgan;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DeMorganEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'de-morgan');

  configBuilder
    ?.addConfig(['de-morgan', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-negated-conjunction', ERROR)
    .addRule('no-negated-disjunction', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
