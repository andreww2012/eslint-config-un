import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * CSpell spell checker.
 *
 * 📁 Default `files`: all files
 */
export interface CspellEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'cspell'> {
  /**
   * The single rule (`spellchecker`) options.
   */
  options?: GetRuleOptions<'cspell', 'spellchecker'>;
}

export default defineUnConfig<CspellEslintConfigOptions>(
  'cspell',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'cspell');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['cspell', {ignoresInternal: false}])
    .addRule(
      'spellchecker',
      ERROR,
      options ? [options] : [],
    ) /** @since 5.18.5 */ /** @aka cspell */ // 🟢
    .enableConfigTesterForPlugin('cspell')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
