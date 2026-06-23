import {ERROR, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface UnEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'un'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'un');

  configBuilder
    ?.addConfig(['un', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-multiple-consecutive-spaces', ERROR) /** @since 1.0.0 */
    .addRule('no-typeof-like-comparisons', WARNING) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('un')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'un'>;
