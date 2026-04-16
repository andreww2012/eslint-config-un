import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface TanstackQueryEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, '@tanstack/query'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies TanstackQueryEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, '@tanstack/query');

  // Legend:
  // 🟢 - in recommended
  // 🟢! - in recommended (strict)
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['tanstack-query', {includeDefaultFilesAndIgnores: true}])
    .addRule('exhaustive-deps', ERROR) /** @since 4.14.1 */ // 🟢
    .addRule('infinite-query-property-order', ERROR) /** @since 5.57.0 */ // 🟢
    .addRule('mutation-property-order', ERROR) /** @since 5.78.0 */ // 🟢
    .addRule('no-rest-destructuring', ERROR) /** @since 5.6.0 */ // 🟡
    .addRule('no-unstable-deps', ERROR) /** @since 5.52.0 */ // 🟢
    .addRule('no-void-query-fn', ERROR) /** @since 5.72.0 */ // 🟢
    .addRule('prefer-query-options', OFF) /** @since 5.96.0 */ // 🟢!
    .addRule('stable-query-client', ERROR) /** @since 4.36.0 */ // 🟢
    .enableConfigTesterForPlugin('@tanstack/query')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'tanstackQuery'>;
