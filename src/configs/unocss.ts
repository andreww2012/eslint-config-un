import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface UnocssEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unocss'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unocss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig('unocss')
    .addRule('blocklist', ERROR) /** @since 0.55.7 */
    .addRule('enforce-class-compile', OFF) /** @since 0.58.6 */
    .addRule('order', ERROR) /** @since 0.49.3 */ // 🟡
    // cspell:disable-next-line
    .addRule('order-attributify', ERROR) /** @since 0.49.3 */ // 🟡
    .enableConfigTesterForPlugin('unocss')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'unocss'>;
