import {ERROR, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {PrettifyShallow} from '../types';
import {assignDefaults, maybeCall, objectKeysUnsafe} from '../utils';
import type {UnConfigFn} from './index';

type OverwriteOrDeriveFromDefault<T> = T | ((defaultValue: T) => T);

interface TailwindPluginSettings {
  callees?: OverwriteOrDeriveFromDefault<string[]>;
  ignoredKeys?: OverwriteOrDeriveFromDefault<string[]>;
  config?: string;
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

export interface TailwindEslintConfigOptions extends UnConfigOptions<'tailwindcss'> {
  /**
   * Will be merged with the default [`eslint-plugin-tailwindcss` settings](https://github.com/francoismassart/eslint-plugin-tailwindcss?tab=readme-ov-file#more-settings).
   *
   * Actual default values can be found [here](https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/lib/util/settings.js).
   */
  settings?: PrettifyShallow<TailwindPluginSettings>;
}

export const tailwindUnConfig: UnConfigFn<'tailwind'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.tailwind;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies TailwindEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'tailwindcss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['tailwind', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          tailwindcss: {
            ...pluginSettings,
            ...objectKeysUnsafe(DEFAULT_PLUGIN_SETTINGS).reduce<TailwindPluginSettings>(
              (acc, settingKey) => {
                if (pluginSettings[settingKey]) {
                  acc[settingKey] = maybeCall(
                    pluginSettings[settingKey],
                    DEFAULT_PLUGIN_SETTINGS[settingKey],
                  );
                }
                return acc;
              },
              {},
            ),
          } satisfies TailwindPluginSettings,
        },
      }),
    })
    .addRule('classnames-order', WARNING) // 🟡
    .addRule('enforces-negative-arbitrary-values', WARNING) // 🟡
    .addRule('enforces-shorthand', WARNING) // 🟡
    .addRule('migration-from-tailwind-2', WARNING) // 🟡
    .addRule('no-arbitrary-value', OFF)
    .addRule('no-contradicting-classname', ERROR) // 🟢
    .addRule('no-custom-classname', OFF) // 🟡
    .addRule('no-unnecessary-arbitrary-value', WARNING) // 🟡
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
