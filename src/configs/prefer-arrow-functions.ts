import {WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface PreferArrowFunctionsEslintConfigOptions
  extends ConfigSharedOptions<'prefer-arrow-functions'> {}

export const preferArrowFunctionsEslintConfig = (
  options: PreferArrowFunctionsEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder('prefer-arrow-functions', options, internalOptions);

  builder
    .addConfig(['prefer-arrow-functions', {includeDefaultFilesAndIgnores: true}])
    .addRule('prefer-arrow-functions', WARNING)
    .addOverrides();

  return builder.getAllConfigs();
};
