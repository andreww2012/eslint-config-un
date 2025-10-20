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
    .addRule('blocklist', ERROR) /** @since 0.55.7 */
    .addRule('enforce-class-compile', OFF) /** @since 0.58.6 */
    .addRule('order', ERROR) /** @since 0.49.3 */ // 🟡
    .addRule('order-attributify', ERROR) /** @since 0.49.3 */ // 🟡
    .enableConfigTesterForPlugin('@unocss')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
