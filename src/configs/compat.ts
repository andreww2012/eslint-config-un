import type {Options as DefaultBrowsersListOptions} from 'browserslist';
import {ERROR} from '../constants';
import type {OmitStrict} from '../types';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to lint the browser compatibility of the code.
 *
 * 📁 Default `files`: all files
 */
export interface CompatEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'compat'> {
  /**
   * [`eslint-plugin-compat`](https://npmx.dev/eslint-plugin-compat) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned directly to `settings` flat config option and applied to the resolved
   * `files` and `ignores` of this config.
   */
  // Must be in sync with https://github.com/amilajack/eslint-plugin-compat/blob/6388a9b65c0b7b110c94a1225403036c1d9b8428/src/types.ts#L77
  settings?: {
    /**
     * Mark which features are polyfilled and should not be reported.
     * @see https://github.com/amilajack/eslint-plugin-compat#adding-polyfills
     */
    polyfills?: string[];

    /**
     * "This plugin also supports linting the compatibility of ES APIs in addition to Web APIs.
     * This is an experimental feature and is disabled by default" - plugin docs
     * @see https://github.com/amilajack/eslint-plugin-compat#linting-es-apis-experimental
     */
    lintAllEsApis?: boolean;

    /**
     * @see https://github.com/amilajack/eslint-plugin-compat#configuring-for-different-environments
     */
    browserslistOpts?: OmitStrict<DefaultBrowsersListOptions, 'path'>;

    /**
     * "By default, feature detection like `if (fetch) { ... }` does not trigger a report.
     * To lint these conditionals anyway, set this setting" - plugin docs
     * @see https://github.com/amilajack/eslint-plugin-compat#conditional-checks
     */
    ignoreConditionalChecks?: boolean;

    // TODO The following 2 options are officially not documented, usage: https://github.com/amilajack/eslint-plugin-compat/blob/6388a9b65c0b7b110c94a1225403036c1d9b8428/src/rules/compat.ts#L164

    targets?: string[];

    browsers?: string[];
  };
}

export default defineUnConfig<CompatEslintConfigOptions>(
  'compat',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'compat');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'compat',
      {
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
});
