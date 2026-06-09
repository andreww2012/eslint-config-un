import {ERROR, GLOB_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface TanstackStartEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tanstack-start'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tanstack-start');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'tanstack-start',
      {includeDefaultFilesAndIgnores: true, filesDefault: [GLOB_TS_X]},
    ])
    .addRule('no-async-client-component', ERROR) /** @since 0.0.0 */ // 🟢
    .addRule('no-client-code-in-server-component', ERROR) /** @since 0.0.0 */ // 🟢
    .enableConfigTesterForPlugin('tanstack-start')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'tanstackStart'>;
