import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface NoUnsanitizedEslintConfigOptions extends UnConfigOptions<'no-unsanitized'> {}

export const noUnsanitizedUnConfig: UnConfigFn<'noUnsanitized'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.noUnsanitized;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies NoUnsanitizedEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'no-unsanitized');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['no-unsanitized', {includeDefaultFilesAndIgnores: true}])
    .addRule('method', ERROR) /** @since 1.1.0 */
    .addRule('property', ERROR) /** @since 1.1.0 */
    .enableConfigTesterForPlugin('no-unsanitized')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
