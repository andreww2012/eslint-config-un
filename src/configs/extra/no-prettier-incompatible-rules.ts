// cspell:ignore atx setext blockquote nonblock
import type {UnRulesConfig} from '../../eslint/eslint-types';
import {
  PLUGINS_BY_PRETTIER_LANGUAGE,
  type PrettierIncompatibleRuleName,
  RULES_INCOMPATIBLE_WITH_PRETTIER,
} from '../../plugins.gen';
import {isKeyIn, objectEntriesUnsafe} from '../../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

const PRETTIER_PLUGIN_BY_LANGUAGE = {
  astro: 'prettier-plugin-astro',
  svelte: 'prettier-plugin-svelte',
  toml: 'prettier-plugin-toml',
} as const;

type PrettierLanguage = keyof typeof PLUGINS_BY_PRETTIER_LANGUAGE;

/* eslint-disable perfectionist/sort-objects */

/**
 * Disables rules that are unnecessary or might conflict with [Prettier](https://prettier.io).
 * Successor to [`eslint-config-prettier`](https://npmx.dev/eslint-config-prettier).
 *
 * 📁 Default `files`: all files
 */
export interface NoPrettierIncompatibleRulesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, Pick<UnRulesConfig, PrettierIncompatibleRuleName>> {
  /**
   * Enable or disable entire rule groups, one per language Prettier is able to format.
   *
   * Groups for languages Prettier only formats via an extra plugin:
   * - `astro` ([`prettier-plugin-astro`](https://npmx.dev/prettier-plugin-astro))
   * - `svelte` ([`prettier-plugin-svelte`](https://npmx.dev/prettier-plugin-svelte))
   * - `toml` ([`prettier-plugin-toml`](https://npmx.dev/prettier-plugin-toml))
   *
   * are applied only if the corresponding plugin is detected as installed.
   *
   * Set the corresponding key to `true` to force a group on regardless of the plugin, or to `false`
   * to turn any group off.
   */
  languages?: Partial<Record<PrettierLanguage, boolean>>;
}

export default defineUnConfig<NoPrettierIncompatibleRulesEslintConfigOptions>(
  'noPrettierIncompatibleRules',
  {enabledBy: {package: 'prettier'}, phase: 'terminal'},
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {languages} = optionsResolved;

  const isLanguageEnabled = (language: PrettierLanguage): boolean => {
    const userValue = languages?.[language];
    if (userValue != null) {
      return userValue;
    }

    return (
      !isKeyIn(language, PRETTIER_PLUGIN_BY_LANGUAGE) ||
      context.packagesInfo[PRETTIER_PLUGIN_BY_LANGUAGE[language]] != null
    );
  };

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig([
      'no-prettier-incompatible-rules',
      {
        ignoresInternal: false,
      },
    ])
    .disableBulkRules(
      objectEntriesUnsafe(PLUGINS_BY_PRETTIER_LANGUAGE)
        .filter(([language]) => isLanguageEnabled(language))
        .flatMap(([, plugins]) =>
          plugins.flatMap((pluginPrefix) =>
            Object.keys(RULES_INCOMPATIBLE_WITH_PRETTIER[pluginPrefix]).map(
              (ruleName) => `${pluginPrefix ? `${pluginPrefix}/` : ''}${ruleName}`,
            ),
          ),
        ),
    )
    .addOverrides();
});

/* eslint-enable perfectionist/sort-objects */
