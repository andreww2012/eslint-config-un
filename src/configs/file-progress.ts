import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-file-progress`](https://npmx.dev/eslint-plugin-file-progress) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `progress` property of the `settings` flat config option.
 *
 * Will be merged with the default value for `hide`.
 */
export interface FileProgressPluginSettings {
  /**
   * Hides the progress bar.
   * @default true <=> the resolved `environment` root option is not `default`
   */
  hide?: boolean;

  /**
   * Hide the currently linted file name.
   * @default false
   */
  hideFileName?: boolean;

  /**
   * The message printed once every file has been linted
   */
  successMessage?: string;
}

/**
 * An ESlint plugin to print file progress.
 *
 * Even if enabled, it will be disabled by default unless the resolved `environment`
 * root option is `default`.
 *
 * 📁 Default `files`: all files
 */
export interface FileProgressEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'file-progress'> {}

export default defineUnConfig<FileProgressEslintConfigOptions>(
  'fileProgress',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const pluginSettings = context.getPluginSettings('file-progress');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'file-progress');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'file-progress',
      {
        ignoresInternal: false,
        settings: {
          progress: {
            hide: context.meta.environment !== 'default',
            ...pluginSettings,
          } satisfies FileProgressPluginSettings,
        },
      },
    ])
    .addRule('activate', ERROR) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('file-progress')
    .addOverrides();
});
