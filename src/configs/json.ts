import type {PARSING_LANGUAGES} from '../config-un/parsing';
import {ERROR, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, OFF} from '../constants';
import {objectEntriesUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * JSON, JSONC and JSON5 related rules powered by the official
 * [`@eslint/json`](https://npmx.dev/@eslint/json) language plugin.
 *
 * 📁 Default `files`: <code>**&#47;*.{json,jsonc,json5}</code>
 */
export interface JsonEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'json'> {
  /**
   * Parses the matched files with the `jsonc` language, which allows comments and trailing commas.
   *
   * 📁 Default `files`: <code>**&#47;*.jsonc</code>
   * @default true
   */
  configJsonc?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'json'>;

  /**
   * Parses the matched files with the `json5` language.
   *
   * 📁 Default `files`: <code>**&#47;*.json5</code>
   * @default true
   */
  configJson5?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'json'>;
}

const JSON_SUB_CONFIGS_FILES: Record<
  keyof (typeof PARSING_LANGUAGES)['json']['dialects'],
  string[]
> = {
  json: [GLOB_JSON],
  jsonc: [GLOB_JSONC],
  json5: [GLOB_JSON5],
};

export default defineUnConfig<JsonEslintConfigOptions>(
  'json',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configJsonc: true,
    configJson5: true,
  });

  const {configJsonc, configJson5} = optionsResolved;

  const optionsPerLanguage = {
    json: optionsResolved,
    jsonc: configJsonc,
    json5: configJson5,
  };

  // Legend:
  // 🔴 - NOT in `recommended`

  const configBuilders = objectEntriesUnsafe(JSON_SUB_CONFIGS_FILES).map(
    ([languageName, filesDefault]) => {
      const configBuilder = context.createConfigBuilder(optionsPerLanguage[languageName], 'json');

      configBuilder
        ?.addConfig([
          `json/${languageName}`,
          {
            filesDefault,
            parseWith: ['json', languageName],
          },
        ])
        .addRule('no-duplicate-keys', ERROR) /** @since 0.1.0 */
        .addRule('no-empty-keys', ERROR) /** @since 0.1.0 */
        .addRule('no-unnormalized-keys', ERROR) /** @since 0.8.0 */
        .addRule('no-unsafe-values', ERROR) /** @since 0.7.0 */
        .addRule('sort-keys', OFF) /** @since 0.10.0 */ // 🔴
        .addRule('top-level-interop', OFF) /** @since 0.9.0 */ // 🔴
        .enableConfigTesterForPlugin('json')
        .addOverrides();

      return configBuilder;
    },
  );

  return {
    configs: configBuilders,
    optionsResolved,
  };
});
