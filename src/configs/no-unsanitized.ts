import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin with rules to disallow unsafe coding practices that may result
 * in security vulnerabilities.
 *
 * 📁 Default `files`: all files
 */
export interface NoUnsanitizedEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'no-unsanitized'> {}

export default defineUnConfig<NoUnsanitizedEslintConfigOptions>(
  'noUnsanitized',
  true,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'no-unsanitized');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('no-unsanitized')
    .addRule('method', ERROR) /** @since 1.1.0 */
    .addRule('property', ERROR) /** @since 1.1.0 */
    .enableConfigTesterForPlugin('no-unsanitized')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
