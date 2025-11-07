import {ERROR} from '../constants';
import {isInCi, isInEditor} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface FileProgressEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'file-progress'> {
  /**
   * [`eslint-plugin-file-progress`](https://npmjs.com/eslint-plugin-file-progress) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `progress` property and applied to the specified `files` and `ignores`.
   *
   * Will be merged with the default value for `hide`.
   */
  settings?: {
    /**
     * Hides the progress bar.
     * @default true <=> when it's detected ESLint running in CI or in editor by `ci-info` and `is-in-editor` packages respectively
     */
    hide?: boolean;

    /**
     * Hide the currently linted file name.
     * @default false
     */
    hideFileName?: boolean;

    successMessage?: string;
  };
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies FileProgressEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'file-progress');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['file-progress', {includeDefaultFilesAndIgnores: true}], {
      settings: {
        progress: {
          hide: isInCi || isInEditor(),
          ...pluginSettings,
        } satisfies FileProgressEslintConfigOptions['settings'] & {},
      },
    })
    .addRule('activate', ERROR) /** @since 1.0.0 */ // 🟢
    .enableConfigTesterForPlugin('file-progress')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'fileProgress'>;
