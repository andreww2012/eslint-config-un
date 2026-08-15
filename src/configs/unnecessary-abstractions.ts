import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin with rules to detect and prevent some unnecessary code abstractions.
 *
 * 📁 Default `files`: all files
 */
export interface UnnecessaryAbstractionsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unnecessary-abstractions'> {}

export default defineUnConfig<UnnecessaryAbstractionsEslintConfigOptions>(
  'unnecessaryAbstractions',
  true,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unnecessary-abstractions');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('unnecessary-abstractions')
    .addRule('no-ternary-wrappers', ERROR) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('unnecessary-abstractions')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
