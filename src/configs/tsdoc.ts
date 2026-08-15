import {ERROR, GLOB_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [TSDoc](https://tsdoc.org) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
 */
export interface TsdocEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tsdoc'> {}

export default defineUnConfig<TsdocEslintConfigOptions>(
  'tsdoc',
  false,
)((context, optionsRaw) => {
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
});
