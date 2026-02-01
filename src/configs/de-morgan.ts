import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface DeMorganEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'de-morgan'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies DeMorganEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'de-morgan');

  configBuilder
    ?.addConfig([
      'de-morgan',
      {
        includeDefaultFilesAndIgnores: true,
        // TODO why?
        ignoresInternal: {
          html: false,
        },
      },
    ])
    .addRule('no-negated-conjunction', ERROR) /** @since 1.0.0 */
    .addRule('no-negated-disjunction', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('de-morgan')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'deMorgan'>;
