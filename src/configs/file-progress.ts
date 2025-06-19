import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface FileProgressEslintConfigOptions extends UnConfigOptions<'file-progress'> {
  /**
   * [`eslint-plugin-file-progress`](https://npmjs.com/eslint-plugin-file-progress) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `fileProgress` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Hides the progress bar.
     * @default Boolean(process.env.CI)
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
  const optionsResolved = assignDefaults(optionsRaw, {
    settings: {
      hide: Boolean(process.env.CI),
    },
  } satisfies FileProgressEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'file-progress');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['file-progress', {includeDefaultFilesAndIgnores: true}], {
      settings: {
        fileProgress: pluginSettings,
      },
    })
    .addRule('activate', ERROR) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
