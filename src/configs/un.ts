import {ERROR, GLOB_JS_TS_X, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface UnEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'un'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies UnEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'un');

  configBuilder
    ?.addConfig([
      'un',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JS_TS_X],
      },
    ])
    .addRule('no-multiple-consecutive-spaces', ERROR) /** @since 1.0.0 */
    .addRule('no-typeof-like-comparisons', WARNING) /** @since 1.0.0 */
    .addRule('prefer-early-return', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('un')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'un'>;
