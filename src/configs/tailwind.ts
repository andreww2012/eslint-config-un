import type {PluginSettings as EslintPluginTailwindcssSettings} from 'eslint-plugin-tailwindcss';
import {ERROR, OFF, WARNING} from '../constants';
import {maybeCall, objectKeysUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

// ⚠️ Please keep up to date with the plugin's source code
const DEFAULT_PLUGIN_SETTINGS = {
  attributes: ['class', 'className', 'ngClass', '@apply'],
  functions: [
    'classnames',
    'classNames',
    'clsx',
    'cn',
    'ctl',
    'cva',
    'tv',
    'tw',
    'twMerge',
    'twJoin',
  ],
  parseKeyFunctions: ['classnames', 'classNames', 'clsx'],
  ignoredKeys: ['defaultVariants', 'compoundVariants', 'compoundSlots'],
};

type OverwriteOrDeriveFromDefault<T> = T | ((defaultValue: T) => T);

export type TailwindPluginSettings = {
  [Key in keyof EslintPluginTailwindcssSettings]?: Key extends keyof typeof DEFAULT_PLUGIN_SETTINGS
    ? OverwriteOrDeriveFromDefault<NonNullable<EslintPluginTailwindcssSettings[Key]>>
    : EslintPluginTailwindcssSettings[Key];
};

/**
 * [Tailwind CSS](https://tailwindcss.com) specific rules, the "original" plugin.
 *
 * ⚠️ WARNING: disabled by default, superseded by `betterTailwind` config
 *
 * 📁 Default `files`: all files
 */
export interface TailwindEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tailwindcss'> {}

export default defineUnConfig<TailwindEslintConfigOptions>('tailwind', {
  enabledBy: false,
  requires: {pluginLoadable: 'tailwindcss'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const pluginSettings = context.getPluginSettings('tailwindcss');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tailwindcss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'tailwind',
      {
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
    .addRule('enforces-canonical-classname', WARNING) /** @since 4.4.0 */ // 🟡
    .addRule('enforces-negative-arbitrary-values', WARNING) /** @since 3.4.0 */ // 🟡
    .addRule('enforces-shorthand', WARNING) /** @since 3.1.0 */ // 🟡
    .addRule('important-modifier-suffix', ERROR) /** @since 4.2.0-beta.0 */ // 🟡
    .addRule('no-arbitrary-value', OFF) /** @since 3.2.0 */
    .addRule('no-contradicting-classname', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-custom-classname', OFF) /** @since 1.1.0 */ // 🟡
    .addRule('no-unnecessary-arbitrary-value', WARNING) /** @since 3.15.0 */ // 🟡
    .enableConfigTesterForPlugin('tailwindcss')
    .addOverrides();
});
