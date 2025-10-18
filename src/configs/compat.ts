import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface CompatEslintConfigOptions extends UnConfigOptions<'compat'> {
  /**
   * [`eslint-plugin-compat`](https://npmjs.com/eslint-plugin-compat) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `settings` object as-is and applied to the specified `files` and `ignores`.
   */
  settings?: {
    polyfills?: string[];

    /**
     * "This plugin also supports linting the compatibility of ES APIs in addition to Web APIs. This is an experimental feature and is disabled by default" - plugin docs
     */
    lintAllEsApis?: boolean;

    browserslistOpts?: {
      env?: string;
    };
  };
}

export const compatUnConfig: UnConfigFn<'compat'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.compat;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CompatEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'compat');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['compat', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: pluginSettings,
      }),
    })
    .addRule('compat', ERROR) /** @since 0.0.4 */
    .ensureAllRulesAreListed('compat')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
