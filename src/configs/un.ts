import {ERROR, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * Rules not included in any other plugins, provided by us and collected under `un` prefix.
 *
 * 📁 Default `files`: all files
 *
 * 🧩 Plugins: built-in `eslint-plugin-un`
 */
export interface UnEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'un'> {}

export default defineUnConfig<UnEslintConfigOptions>(
  'un',
  true,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'un');

  configBuilder
    ?.addConfig('un')
    .addRule('no-distributive-never-check', ERROR) /** @since 1.0.0 */
    .addRule('no-multiple-consecutive-spaces', ERROR) /** @since 1.0.0 */
    .addRule('no-typeof-like-comparisons', WARNING) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('un')
    .addOverrides();
});
