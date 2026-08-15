import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [TanStack Router](https://tanstack.com/router/latest) specific rules.
 *
 * 📁 Default `files`: all files
 */
export interface TanstackRouterEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tanstack-router'> {}

export default defineUnConfig<TanstackRouterEslintConfigOptions>('tanstackRouter', {
  enabledBy: {packages: ['@tanstack/react-router', '@tanstack/solid-router']},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tanstack-router');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig('tanstack-router')
    .addRule('create-route-property-order', ERROR) /** @since 1.20.3-alpha.1 */ // 🟢
    .addRule('route-param-names', ERROR) /** @since 1.155.0 */ // 🟢
    .enableConfigTesterForPlugin('tanstack-router')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
