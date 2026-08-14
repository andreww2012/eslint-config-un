import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface ArrowReturnStyleEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'arrow-return-style'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'arrow-return-style');

  // Legend:
  // 🔴 - not in recommended

  configBuilder
    ?.addConfig('arrow-return-style')
    .addRule('arrow-return-style', OFF) /** @since 1.0.0 */
    .addRule('no-export-default-arrow', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('arrow-return-style')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'arrowReturnStyle'>;
