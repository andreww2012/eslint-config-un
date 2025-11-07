// cspell:ignore attributify
import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface UnocssEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, '@unocss'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies UnocssEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, '@unocss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['unocss', {includeDefaultFilesAndIgnores: true}])
    .addRule('blocklist', ERROR) /** @since 0.55.7 */
    .addRule('enforce-class-compile', OFF) /** @since 0.58.6 */
    .addRule('order', ERROR) /** @since 0.49.3 */ // 🟡
    .addRule('order-attributify', ERROR) /** @since 0.49.3 */ // 🟡
    .enableConfigTesterForPlugin('@unocss')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'unocss'>;
