import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface CompatEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'compat'> {
  /**
   * [`eslint-plugin-compat`](https://npmjs.com/eslint-plugin-compat) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned directly to `settings` flat config option
   * and applied to the resolved `files` and `ignores` of this config.
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

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CompatEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'compat');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'compat',
      {
        includeDefaultFilesAndIgnores: true,
        settings: {
          '': pluginSettings,
        },
      },
    ])
    .addRule('compat', ERROR) /** @since 0.0.4 */
    .enableConfigTesterForPlugin('compat')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'compat'>;
