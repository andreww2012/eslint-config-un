import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, isInCi, isInEditor} from '../utils';
import type {UnConfigFn} from './index';

export interface FileProgressEslintConfigOptions extends UnConfigOptions<'file-progress'> {
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

export const fileProgressUnConfig: UnConfigFn<'fileProgress'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.fileProgress;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies FileProgressEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'file-progress');

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
};
