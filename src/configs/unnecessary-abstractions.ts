import {ERROR} from '../constants';
import {type ExtraPluginsType, type UnConfigOptions, assignDefaults, defineUnConfig} from './index';

export interface UnnecessaryAbstractionsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'unnecessary-abstractions'> {}

export default defineUnConfig('unnecessaryAbstractions', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies UnnecessaryAbstractionsEslintConfigOptions,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unnecessary-abstractions');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['unnecessary-abstractions', {includeDefaultFilesAndIgnores: true}])
    .addRule('no-ternary-wrappers', ERROR) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('unnecessary-abstractions')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
