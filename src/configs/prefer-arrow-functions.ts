import {WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface PreferArrowFunctionsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'prefer-arrow-functions'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'prefer-arrow-functions');

  configBuilder
    ?.addConfig([
      'prefer-arrow-functions',
      {
        // TODO why?
        ignoresInternal: {
          html: false,
        },
      },
    ])
    .addRule('prefer-arrow-functions', WARNING) /** @since 3.0.0 */
    .enableConfigTesterForPlugin('prefer-arrow-functions')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'preferArrowFunctions'>;
