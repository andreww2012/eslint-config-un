import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface TanstackQueryEslintConfigOptions extends UnConfigOptions<'@tanstack/query'> {}

export const tanstackQueryUnConfig: UnConfigFn<'tanstackQuery'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.tanstackQuery;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies TanstackQueryEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, '@tanstack/query');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['tanstack-query', {includeDefaultFilesAndIgnores: true}])
    .addRule('exhaustive-deps', ERROR) /** @since 4.14.1 */ // 🟢
    .addRule('infinite-query-property-order', ERROR) /** @since 5.57.0 */ // 🟢
    .addRule('mutation-property-order', ERROR) /** @since 5.78.0 */ // 🟢
    .addRule('no-rest-destructuring', ERROR) /** @since 5.6.0 */ // 🟡
    .addRule('no-unstable-deps', ERROR) /** @since 5.52.0 */ // 🟢
    .addRule('no-void-query-fn', ERROR) /** @since 5.72.0 */ // 🟢
    .addRule('stable-query-client', ERROR) /** @since 4.36.0 */ // 🟢
    .enableConfigTesterForPlugin('@tanstack/query')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
