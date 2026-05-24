import {ERROR, OFF, WARNING} from '../constants';
import type {Prettify} from '../types';
import {maybeCall, objectKeysUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

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

export interface TailwindEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tailwindcss'> {
  /**
   * [`eslint-plugin-tailwindcss`](https://npmx.dev/eslint-plugin-tailwindcss) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `tailwindcss` property
   * and applied to the resolved `files` and `ignores` of this config.
   *
   * Will be merged with the default [`eslint-plugin-tailwindcss` settings](https://github.com/francoismassart/eslint-plugin-tailwindcss?tab=readme-ov-file#more-settings).
   *
   * Actual default values can be found [here](https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/lib/util/settings.js).
   */
  settings?: Prettify<TailwindPluginSettings>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tailwindcss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'tailwind',
      {
        includeDefaultFilesAndIgnores: true,
        settings: {
          tailwindcss: {
            ...pluginSettings,
            ...objectKeysUnsafe(DEFAULT_PLUGIN_SETTINGS).reduce<TailwindPluginSettings>(
              (acc, settingKey) => {
                if (pluginSettings?.[settingKey]) {
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
      },
    ])
    .addRule('classnames-order', WARNING) /** @since 1.0.1 */ // 🟡
    .addRule('enforces-negative-arbitrary-values', WARNING) /** @since 3.4.0 */ // 🟡
    .addRule('enforces-shorthand', WARNING) /** @since 3.1.0 */ // 🟡
    .addRule('migration-from-tailwind-2', WARNING) /** @since 3.0.0 */ // 🟡
    .addRule('no-arbitrary-value', OFF) /** @since 3.2.0 */
    .addRule('no-contradicting-classname', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-custom-classname', OFF) /** @since 1.1.0 */ // 🟡
    .addRule('no-unnecessary-arbitrary-value', WARNING) /** @since 3.15.0 */ // 🟡
    .enableConfigTesterForPlugin('tailwindcss')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'tailwind'>;
