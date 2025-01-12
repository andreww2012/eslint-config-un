import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import {WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
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
        // @ts-expect-error `default` does not exist, but required because the export is wrong: https://arethetypeswrong.github.io/?p=eslint-plugin-prefer-arrow-functions%403.6.0
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        'prefer-arrow-functions': eslintPluginPreferArrowFunctions.default,
      },
    })
    .addRule('prefer-arrow-functions/prefer-arrow-functions', WARNING)
    .addOverrides();

  return builder.getAllConfigs();
};
