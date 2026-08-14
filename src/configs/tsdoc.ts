import {ERROR, GLOB_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface TsdocEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tsdoc'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tsdoc');

  configBuilder
    ?.addConfig([
      'tsdoc',
      {
        filesDefault: [GLOB_TS_X],
      },
    ])
    .addRule('syntax', ERROR) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('tsdoc')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'tsdoc'>;
