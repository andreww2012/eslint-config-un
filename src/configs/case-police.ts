import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to enforce the spelling of certain words (for example, `GitHub`, not `github` or
 * `Github`).
 *
 * 📁 Default `files`: all files
 */
export interface CasePoliceEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'case-police'> {}

export default defineUnConfig<CasePoliceEslintConfigOptions>(
  'casePolice',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'case-police');

  configBuilder
    ?.addConfig(['case-police', {ignoresInternal: false}])
    .addRule('string-check', ERROR) /** @since 0.6.0 */
    .enableConfigTesterForPlugin('case-police')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
