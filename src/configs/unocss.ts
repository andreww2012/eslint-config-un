// cspell:ignore attributify
import {ERROR, OFF} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface UnocssEslintConfigOptions extends UnConfigOptions<'@unocss'> {}

export const unocssUnConfig: UnConfigFn<'unocss'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.unocss;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies UnocssEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, '@unocss');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig(['unocss', {includeDefaultFilesAndIgnores: true}])
    .addRule('blocklist', ERROR)
    .addRule('enforce-class-compile', OFF)
    .addRule('order', ERROR) // 🟡
    .addRule('order-attributify', ERROR) // 🟡
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
