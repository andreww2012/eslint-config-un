import {objectKeys} from '@antfu/utils';
import eslintPluginTailwind from 'eslint-plugin-tailwindcss';
import {OFF, WARNING} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types/eslint';
import type {PrettifyShallow} from '../types/utils';
import {ConfigEntryBuilder, maybeCall} from '../utils';

type OverwriteOrDeriveFromDefault<T> = T | ((defaultValue: T) => T);

interface TailwindPluginSettings {
  callees?: OverwriteOrDeriveFromDefault<string[]>;
  ignoredKeys?: OverwriteOrDeriveFromDefault<string[]>;
  config?: string[];
  cssFiles?: OverwriteOrDeriveFromDefault<string[]>;
  cssFilesRefreshRate?: number;
  removeDuplicates?: boolean;
  skipClassAttribute?: boolean;
  whitelist?: string[];
  tags?: string[];
  classRegex?: string;
}

// ⚠️ Please keep up to date with the plugin's source code
const DEFAULT_PLUGIN_SETTINGS = {
  callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv'],
  ignoredKeys: ['compoundVariants', 'defaultVariants'],
  cssFiles: ['**/*.css', '!**/node_modules', '!**/.*', '!**/dist', '!**/build'],
};

export interface TailwindEslintConfigOptions extends ConfigSharedOptions<'tailwindcss'> {
  /**
   * Will be merged with the default [`eslint-plugin-tailwindcss` settings](https://github.com/francoismassart/eslint-plugin-tailwindcss?tab=readme-ov-file#more-settings).
   *
   * Actual default values can be found [here](https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/master/lib/util/settings.js).
   */
  settings?: PrettifyShallow<TailwindPluginSettings>;
}

export const tailwindEslintConfig = (
  options: TailwindEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {settings} = options;

  const builder = new ConfigEntryBuilder<'tailwindcss'>(options, internalOptions);

  builder
    .addConfig(['tailwind', {includeDefaultFilesAndIgnores: true}], {
      plugins: {
        tailwindcss: eslintPluginTailwind,
      },
      ...(settings && {
        settings: {
          tailwindcss: {
            ...settings,
            ...objectKeys(DEFAULT_PLUGIN_SETTINGS).reduce<Record<string, unknown>>(
              (acc, settingKey) => {
                if (settings[settingKey]) {
                  acc[settingKey] = maybeCall(
                    settings[settingKey],
                    DEFAULT_PLUGIN_SETTINGS[settingKey],
                  );
                }
                return acc;
              },
              {},
            ),
          },
        },
      }),
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
