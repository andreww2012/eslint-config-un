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
    .addRule('exhaustive-deps', ERROR) // 🟢
    .addRule('infinite-query-property-order', ERROR) // 🟢
    .addRule('mutation-property-order', ERROR) // 🟢
    .addRule('no-rest-destructuring', ERROR) // 🟡
    .addRule('no-unstable-deps', ERROR) // 🟢
    .addRule('no-void-query-fn', ERROR) // 🟢
    .addRule('stable-query-client', ERROR) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
