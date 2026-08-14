import {ERROR, GLOB_JS_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface MobxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'mobx'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'mobx');

  // Legend:
  // 🟢 - in `recommended`
  // 🟡 - in `recommended` (warns)

  configBuilder
    ?.addConfig(['mobx', {filesDefault: [GLOB_JS_TS_X]}])
    .addRule('exhaustive-make-observable', OFF) /** @since 0.0.2 */ // 🟡
    .addRule('missing-make-observable', ERROR) /** @since 0.0.2 */ // 🟢
    .addRule('missing-observer', OFF) /** @since 0.0.5 */ // 🟡
    .addRule('unconditional-make-observable', ERROR) /** @since 0.0.2 */ // 🟢
    .enableConfigTesterForPlugin('mobx', {
      rulesToSkipInConfig: ['no-anonymous-observer'], // Deprecated, but not marked as such in the meta
    })
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'mobx'>;
