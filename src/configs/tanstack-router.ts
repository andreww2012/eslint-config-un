import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface TanstackRouterEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, '@tanstack/router'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<TanstackRouterEslintConfigOptions>,
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, '@tanstack/router');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['tanstack-router', {includeDefaultFilesAndIgnores: true}])
    .addRule('create-route-property-order', ERROR) /** @since 1.20.3-alpha.1 */ // 🟢
    .enableConfigTesterForPlugin('@tanstack/router')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'tanstackRouter'>;
