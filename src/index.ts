import {eslintConfigInternal} from './config-un/config';
import type {
  ReplacedRuleEntriesOfPlugins,
  ValidatedPluginReplacements,
} from './config-un/rule-replacement-types';
import type {EslintConfigUnOptions, ExtraPluginsType} from './config-un/shared';
import type {PluginPrefix} from './loaders';
import type {Prettify} from './types';

export const eslintConfig = <
  const ExtraPlugins extends ExtraPluginsType = never,
  NoWarnings extends boolean = false,
  // Any other default breaks the contextual typing of the option
  const Replacements extends Record<string, unknown> = Record<string, unknown>,
>(
  options: Prettify<
    EslintConfigUnOptions<
      ExtraPlugins,
      {noWarnings: NoWarnings; replacedRuleEntries: ReplacedRuleEntriesOfPlugins<Replacements>}
    > & {
      noWarnings?: NoWarnings;
      // Only the plugin prefixes are mapped, so that no index signature lets typos through when
      // nothing is inferred
      plugins?: {
        [Plugin in keyof Replacements & PluginPrefix]?: {
          replacements?: ValidatedPluginReplacements<Plugin, Replacements[Plugin], ExtraPlugins>;
        };
      };
    }
  > = {},
) =>
  eslintConfigInternal(
    // eslint-disable-next-line un/no-type-assertion -- Casting is in place here merely to avoid a prohibitively expensive structural relate of the two huge config types here (it would make the type checker instantiate the per-key warn-stripping for every config)
    options as EslintConfigUnOptions<ExtraPlugins>,
  );

export {defineRuleReplacements} from './config-un/rule-replacements';
export type {RuleOptions} from './eslint-types.gen';
export {DEFAULT_GLOBAL_IGNORES} from './constants';

export {default as globals} from 'globals';
export {isInCi, isInEditor} from './utils';
