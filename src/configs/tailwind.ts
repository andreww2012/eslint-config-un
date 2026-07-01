import type {PluginSettings as EslintPluginTailwindcssSettings} from 'eslint-plugin-tailwindcss';
import {ERROR, OFF, WARNING} from '../constants';
import type {Prettify} from '../types';
import {maybeCall, objectKeysUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
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

type TailwindPluginSettings = {
  [Key in keyof EslintPluginTailwindcssSettings]?: Key extends keyof typeof DEFAULT_PLUGIN_SETTINGS
    ? OverwriteOrDeriveFromDefault<NonNullable<EslintPluginTailwindcssSettings[Key]>>
    : EslintPluginTailwindcssSettings[Key];
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
   * ⚠️ You likely want to set `cssConfigPath` to the path of your Tailwind CSS
   * entry point so the plugin can resolve the theme.
   * It defaults to `src/style.css` when not provided.
   *
   * Will be merged with the default
   * [`eslint-plugin-tailwindcss` settings](https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/v4/README.md#settings).
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
