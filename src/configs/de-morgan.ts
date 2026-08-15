import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
 *
 * 📁 Default `files`: all files
 */
export interface DeMorganEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'de-morgan'> {}

export default defineUnConfig<DeMorganEslintConfigOptions>(
  'deMorgan',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'de-morgan');

  configBuilder
    ?.addConfig([
      'de-morgan',
      {
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
});
