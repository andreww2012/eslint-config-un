import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`@unocss/eslint-plugin`](https://npmx.dev/@unocss/eslint-plugin) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `unocss` property of the `settings` flat config option.
 */
export interface UnocssPluginSettings {
  /**
   * Path to the UnoCSS config file.
   * If not specified, the plugin will look for it on its own.
   */
  configPath?: string;
}

/**
 * [UnoCSS](https://unocss.dev) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface UnocssEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unocss'> {}

export default defineUnConfig<UnocssEslintConfigOptions>('unocss', {
  enabledBy: {package: 'unocss'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const pluginSettings = context.getPluginSettings('unocss');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unocss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'unocss',
      {
        settings: {
          unocss: pluginSettings,
        },
      },
    ])
    .addRule('blocklist', ERROR) /** @since 0.55.7 */
    .addRule('enforce-class-compile', OFF) /** @since 0.58.6 */
    .addRule('order', ERROR) /** @since 0.49.3 */ // 🟡
    // cspell:disable-next-line
    .addRule('order-attributify', ERROR) /** @since 0.49.3 */ // 🟡
    .enableConfigTesterForPlugin('unocss')
    .addOverrides();
});
