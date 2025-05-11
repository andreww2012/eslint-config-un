import {OFF} from '../constants';
import {type ConfigSharedOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface PerfectionistEslintConfigOptions extends ConfigSharedOptions<'perfectionist'> {}

export const perfectionistUnConfig: UnConfigFn<'perfectionist'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.perfectionist;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies PerfectionistEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'perfectionist');

  configBuilder
    ?.addConfig(['perfectionist', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}])
    .addRule('sort-array-includes', OFF) // >=0.5.0
    .addRule('sort-classes', OFF) // >=0.11.0
    .addRule('sort-decorators', OFF) // >=4.0.0
    .addRule('sort-enums', OFF) // >=0.8.0
    .addRule('sort-exports', OFF) // >=1.2.0
    .addRule('sort-heritage-clauses', OFF) // >=4.0.0
    .addRule('sort-imports', OFF) // >=0.9.0
    .addRule('sort-interfaces', OFF) // >=0.1.0
    .addRule('sort-intersection-types', OFF) // >=2.9.0
    .addRule('sort-jsx-props', OFF) // >=0.2.0
    .addRule('sort-maps', OFF) // >=0.5.0
    .addRule('sort-modules', OFF) // >=4.0.0
    .addRule('sort-named-exports', OFF) // >=0.4.0
    .addRule('sort-named-imports', OFF) // >=0.2.0
    .addRule('sort-object-types', OFF) // >=0.11.0
    .addRule('sort-objects', OFF) // >=0.6.0
    .addRule('sort-sets', OFF) // >=3.4.0
    .addRule('sort-switch-case', OFF) // >=3.0.0
    .addRule('sort-union-types', OFF) // >=0.4.0
    .addRule('sort-variable-declarations', OFF) // >=3.0.0
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
