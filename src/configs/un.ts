import {ERROR, GLOB_TSX} from '../constants';
import {type ExtraPluginsType, type UnConfigOptions, assignDefaults, defineUnConfig} from './index';

export interface UnEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'un'> {}

export default defineUnConfig('un', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies UnEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'un');

  configBuilder
    ?.addConfig([
      'un',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_TSX],
      },
    ])
    .addRule('prefer-early-return', ERROR)
    .enableConfigTesterForPlugin('un') /** @since 1.0.0 */
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
