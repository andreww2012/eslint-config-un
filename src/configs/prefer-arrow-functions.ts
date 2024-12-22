// @ts-expect-error no typings
import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import {WARNING} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry} from '../eslint';
import {ConfigEntryBuilder} from '../eslint';
import type {InternalConfigOptions} from './index';

export interface PreferArrowFunctionsEslintConfigOptions
  extends ConfigSharedOptions<'prefer-arrow-functions'> {}

export const preferArrowFunctionsEslintConfig = (
  options: PreferArrowFunctionsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'prefer-arrow-functions'>(options, internalOptions);

  builder
    .addConfig(['prefer-arrow-functions', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
      },
    })
    .addRule('prefer-arrow-functions/prefer-arrow-functions', WARNING)
    .addOverrides();

  return builder.getAllConfigs();
};
