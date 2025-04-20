import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface DeMorganEslintConfigOptions extends ConfigSharedOptions<'de-morgan'> {}

export const deMorganEslintConfig = (
  options: DeMorganEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder('de-morgan', options, internalOptions);

  builder
    .addConfig(['de-morgan', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-negated-conjunction', ERROR)
    .addRule('no-negated-disjunction', ERROR)
    .addOverrides();

  return builder.getAllConfigs();
};
