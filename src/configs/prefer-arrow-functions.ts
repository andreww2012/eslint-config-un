import {WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint Plugin to lint and auto-fix plain functions into arrow functions, in all cases where
 * conversion would result in the same behavior.
 *
 * 📁 Default `files`: all files
 */
export interface PreferArrowFunctionsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'prefer-arrow-functions'> {}

export default defineUnConfig<PreferArrowFunctionsEslintConfigOptions>(
  'preferArrowFunctions',
  false,
)((context, optionsRaw) => {
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
});
