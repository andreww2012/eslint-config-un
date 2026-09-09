import {ERROR, GLOB_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [TanStack Start](https://tanstack.com/start/latest) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
 */
export interface TanstackStartEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tanstack-start'> {}

export default defineUnConfig<TanstackStartEslintConfigOptions>('tanstackStart', {
  enabledBy: {packages: ['@tanstack/react-start', '@tanstack/solid-start']},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tanstack-start');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['tanstack-start', {filesDefault: [GLOB_TS_X]}])
    .addRule('no-async-client-component', ERROR) /** @since 0.0.0 */ // 🟢
    .addRule('no-client-code-in-server-component', ERROR) /** @since 0.0.0 */ // 🟢
    .enableConfigTesterForPlugin('tanstack-start')
    .addOverrides();
});
