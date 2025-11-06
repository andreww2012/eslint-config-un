import {ERROR} from '../constants';
import {type ExtraPluginsType, type UnConfigOptions, assignDefaults, defineUnConfig} from './index';

export interface NoUnsanitizedEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'no-unsanitized'> {}

export default defineUnConfig('noUnsanitized', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies NoUnsanitizedEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'no-unsanitized');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['no-unsanitized', {includeDefaultFilesAndIgnores: true}])
    .addRule('method', ERROR) /** @since 1.1.0 */
    .addRule('property', ERROR) /** @since 1.1.0 */
    .enableConfigTesterForPlugin('no-unsanitized')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
