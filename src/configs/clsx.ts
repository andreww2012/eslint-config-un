import {ERROR, OFF, WARNING} from '../constants';
import type {MaybeArray} from '../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [`eslint-plugin-clsx`](https://npmx.dev/eslint-plugin-clsx) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned to the `clsxOptions` property of the `settings` flat config option.
 *
 * Keys are the modules whose imports should be treated as `clsx`, values are the names of the
 * imports to look at, where `default` stands for the default import.
 *
 * Note that specifying this setting *replaces* the default value rather than being merged with it.
 * @default {clsx: ['default', 'clsx'], classnames: 'default'}
 */
export type ClsxPluginSettings = Partial<
  Record<'clsx' | 'classnames' | (string & {}), MaybeArray<string>>
>;

/**
 * [clsx](https://github.com/lukeed/clsx) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface ClsxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'clsx'> {}

export default defineUnConfig<ClsxEslintConfigOptions>('clsx', {enabledBy: {package: 'clsx'}})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const pluginSettings = context.getPluginSettings('clsx');

  const configBuilder = context.createConfigBuilder(optionsResolved, 'clsx');

  // Legend:
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'clsx',
      {
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
});
