import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface DeMorganEslintConfigOptions extends UnConfigOptions<'de-morgan'> {}

export const deMorganUnConfig: UnConfigFn<'deMorgan'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.deMorgan;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DeMorganEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'de-morgan');

  configBuilder
    ?.addConfig(['de-morgan', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}])
    .addRule('no-negated-conjunction', ERROR) /** @since 1.0.0 */
    .addRule('no-negated-disjunction', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('de-morgan')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
