import {ERROR} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface CspellEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, '@cspell'> {
  /**
   * The single rule (`spellchecker`) options.
   */
  options?: GetRuleOptions<'@cspell', 'spellchecker'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CspellEslintConfigOptions);

  const {options} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, '@cspell');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'cspell',
      {
        includeDefaultFilesAndIgnores: true,
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
      },
    ])
    .addRule(
      'spellchecker',
      ERROR,
      options ? [options] : [],
    ) /** @since 5.18.5 */ /** @aka cspell */ // 🟢
    .enableConfigTesterForPlugin('@cspell')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'cspell'>;
