import eslintPluginTailwind from 'eslint-plugin-tailwindcss';
import {OFF, WARNING} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {ConfigEntryBuilder} from '../utils';

export interface TailwindEslintConfigOptions extends ConfigSharedOptions<'tailwindcss'> {}

export const tailwindEslintConfig = (
  options: TailwindEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'tailwindcss'>(options, internalOptions);

  builder
    .addConfig(['tailwind', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        tailwindcss: eslintPluginTailwind,
      },
    })
    .addBulkRules(eslintPluginTailwind.configs.recommended.rules)
    .addRule('tailwindcss/classnames-order', WARNING)
    .addRule('tailwindcss/enforces-negative-arbitrary-values', WARNING)
    .addRule('tailwindcss/enforces-shorthand', WARNING)
    .addRule('tailwindcss/migration-from-tailwind-2', WARNING)
    // .addRule('tailwindcss/no-arbitrary-value', OFF)
    // .addRule('tailwindcss/no-contradicting-classname', ERROR)
    .addRule('tailwindcss/no-custom-classname', OFF)
    .addRule('tailwindcss/no-unnecessary-arbitrary-value', WARNING)
    .addOverrides();

  return builder.getAllConfigs();
};
