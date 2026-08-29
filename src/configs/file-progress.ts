import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

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
> extends UnFlatConfigEntryBase<ExtraPlugins, 'file-progress'> {
  /**
   * [`eslint-plugin-file-progress`](https://npmx.dev/eslint-plugin-file-progress) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `progress` property and applied to the resolved `files` and `ignores`
   * of this config.
   *
   * Will be merged with the default value for `hide`.
   */
  settings?: {
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
  };
}

export default defineUnConfig<FileProgressEslintConfigOptions>(
  'fileProgress',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings} = optionsResolved;

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
          } satisfies FileProgressEslintConfigOptions['settings'] & {},
        },
      },
    ])
    .addRule('activate', ERROR) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('file-progress')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
