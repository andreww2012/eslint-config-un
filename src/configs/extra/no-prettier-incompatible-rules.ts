import type {UnRulesConfig} from '../../eslint/eslint-types';
import {prefixRuleName} from '../../eslint/eslint-utils';
import {PLUGINS_BY_PRETTIER_LANGUAGE, type PrettierIncompatibleRuleName} from '../../plugins.gen';
import {isKeyIn, objectEntriesUnsafe} from '../../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

// oxfmt formats TOML natively, Svelte only with its `svelte` option on, and Astro not at all
const PACKAGES_ENABLING_LANGUAGE = {
  astro: ['prettier-plugin-astro'],
  svelte: ['prettier-plugin-svelte'],
  toml: ['prettier-plugin-toml', 'oxfmt'],
} as const;

type PrettierLanguage = keyof typeof PLUGINS_BY_PRETTIER_LANGUAGE;

const PLUGINS_OF_PRETTIER_LANGUAGES: ReadonlySet<string> = new Set(
  Object.values(PLUGINS_BY_PRETTIER_LANGUAGE).flat(),
);

/**
 * Disables rules that are unnecessary or might conflict with [Prettier](https://prettier.io) or
 * [oxfmt](https://oxc.rs/docs/guide/usage/formatter), which follows Prettier's output.
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
   * Groups for languages Prettier only formats via an extra plugin are applied only if one of the
   * listed packages is detected as installed:
   * - `astro`: [`prettier-plugin-astro`](https://npmx.dev/prettier-plugin-astro)
   * - `svelte`: [`prettier-plugin-svelte`](https://npmx.dev/prettier-plugin-svelte)
   * - `toml`: [`prettier-plugin-toml`](https://npmx.dev/prettier-plugin-toml) or
   *   [`oxfmt`](https://npmx.dev/oxfmt)
   *
   * Set the corresponding key to `true` to force a group on regardless of the packages, or to
   * `false` to turn any group off.
   * If you format Svelte files with oxfmt (its `svelte` option), set `svelte: true` here: oxfmt's
   * config cannot be read to detect that
   */
  languages?: Partial<Record<PrettierLanguage, boolean>>;
}

export default defineUnConfig<NoPrettierIncompatibleRulesEslintConfigOptions>(
  'noPrettierIncompatibleRules',
  {enabledBy: {packages: ['prettier', 'oxfmt']}, phase: 'terminal'},
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {languages} = optionsResolved;

  const isLanguageEnabled = (language: PrettierLanguage): boolean => {
    const userValue = languages?.[language];
    if (userValue != null) {
      return userValue;
    }

    return (
      !isKeyIn(language, PACKAGES_ENABLING_LANGUAGE) ||
      PACKAGES_ENABLING_LANGUAGE[language].some(
        (packageName) => context.packagesInfo[packageName] != null,
      )
    );
  };

  const {prettierIncompatible: rulesPerPlugin} = context.ruleTraits;
  const pluginPrefixes = [
    ...objectEntriesUnsafe(PLUGINS_BY_PRETTIER_LANGUAGE)
      .filter(([language]) => isLanguageEnabled(language))
      .flatMap(([, plugins]) => plugins),
    // Only a rule replacement can give the trait to a rule of such a plugin
    ...Object.keys(rulesPerPlugin).filter(
      (pluginPrefix) => !PLUGINS_OF_PRETTIER_LANGUAGES.has(pluginPrefix),
    ),
  ];

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig([
      'no-prettier-incompatible-rules',
      {
        ignoresInternal: false,
      },
    ])
    .disableBulkRules(
      pluginPrefixes.flatMap((pluginPrefix) =>
        Object.keys(rulesPerPlugin[pluginPrefix] || {}).map((ruleName) =>
          prefixRuleName(pluginPrefix, ruleName),
        ),
      ),
    )
    .addOverrides();
});
