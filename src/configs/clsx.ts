import {ERROR, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface ClsxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'clsx'> {
  /**
   * [`eslint-plugin-clsx`](https://npmjs.com/eslint-plugin-clsx) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `clsxOptions` property
   * and applied to the resolved `files` and `ignores` of this config.
   * @default {clsx: ['default', 'clsx']; classnames: 'default'}
   */
  settings?: {
    /**
     * Imports that should be considered `clsx` imports.
     */
    clsx?: string[];

    classnames?: string;
  };
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies Partial<ClsxEslintConfigOptions>);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'clsx');

  // Legend:
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'clsx',
      {
        includeDefaultFilesAndIgnores: true,
        settings: {
          clsxOptions: pluginSettings,
        },
      },
    ])
    .addRule('forbid-array-expressions', ERROR) /** @since 0.0.1 */ // 🟡
    .addRule('forbid-false-inside-object-expressions', ERROR) /** @since 0.0.1 */ // 🟡
    .addRule('forbid-true-inside-object-expressions', ERROR) /** @since 0.0.1 */ // 🟡
    .addRule('no-redundant-clsx', ERROR) /** @since 0.0.1 */ // 🟡
    .addRule('no-spreading', ERROR) /** @since 0.0.1 */ // 🟡
    .addRule('prefer-logical-over-objects', OFF) /** @since 0.0.1 */
    .addRule('prefer-merged-neighboring-elements', ERROR) /** @since 0.0.1 */ // 🟡
    .addRule('prefer-objects-over-logical', WARNING) /** @since 0.0.1 */
    .enableConfigTesterForPlugin('clsx')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'clsx'>;
