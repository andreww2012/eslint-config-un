import eslintPluginJsonc from 'eslint-plugin-jsonc';
import jsoncEslintParser from 'jsonc-eslint-parser';
import {ERROR, GLOB_JSON, GLOB_JSON5, GLOB_JSONC} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

const DEFAULT_FILES = [GLOB_JSON, GLOB_JSONC, GLOB_JSON5];

export interface JsoncEslintConfigOptions extends ConfigSharedOptions<'jsonc'> {
  /** `files` specified in this config will be merged with the default of `['**\/*.json', '**\/*.jsonc', '**\/*.json5']`. Set this to `true` to avoid that behavior */
  doNotMergeFilesWithDefault?: boolean;

  /** Config exclusively for .json files (no rules are applied by default!) */
  jsonConfig?: ConfigSharedOptions<'jsonc'>;

  /** Config exclusively for .jsonc files (no rules are applied by default!) */
  jsoncConfig?: ConfigSharedOptions<'jsonc'>;

  /** Config exclusively for .json5 files (no rules are applied by default!) */
  json5Config?: ConfigSharedOptions<'jsonc'>;
}

export const jsoncEslintConfig = (
  options: JsoncEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'jsonc'>(options, internalOptions);

  // LEGEND:
  // 🟣 = Included in the main ruleset

  builder
    .addConfig(
      [
        'jsonc/all',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: DEFAULT_FILES,
          mergeUserFilesWithFallback: !options.doNotMergeFilesWithDefault,
        },
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addBulkRules(
      eslintPluginJsonc.configs['flat/base'].reduce(
        (result, config) => Object.assign(result, config.rules),
        {},
      ),
    )
    // 🟢 Main rules
    // .addRule('jsonc/auto', OFF) // >=0.8.0
    // .addRule('jsonc/key-name-casing', OFF) // >=0.8.0
    .addRule('jsonc/no-bigint-literals', ERROR) // 🟣 >=0.2.0
    .addRule('jsonc/no-binary-expression', ERROR) // 🟣 >=2.0.0
    .addRule('jsonc/no-binary-numeric-literals', ERROR) // 🟣 >=1.1.0
    // .addRule('jsonc/no-comments', OFF) // 🟣 (json) >=0.1.0
    .addRule('jsonc/no-escape-sequence-in-identifier', ERROR) // 🟣 >=1.1.0
    // .addRule('jsonc/no-hexadecimal-numeric-literals', OFF) // 🟣(json, jsonc) >=1.1.0
    // .addRule('jsonc/no-infinity', OFF) // 🟣(json, jsonc) >=1.1.0
    // .addRule('jsonc/no-nan', OFF) // 🟣(json, jsonc) >=1.1.0
    .addRule('jsonc/no-number-props', ERROR) // 🟣 >=0.2.0
    .addRule('jsonc/no-numeric-separators', ERROR) // 🟣 >=0.6.0
    .addRule('jsonc/no-octal-numeric-literals', ERROR) // 🟣 >=1.1.0
    .addRule('jsonc/no-parenthesized', ERROR) // 🟣 >=2.0.0
    // .addRule('jsonc/no-plus-sign', OFF) // 🟣(json, jsonc) >=1.1.0
    .addRule('jsonc/no-regexp-literals', ERROR) // 🟣 >=0.2.0
    .addRule('jsonc/no-template-literals', ERROR) // 🟣 >=0.2.0
    .addRule('jsonc/no-undefined-value', ERROR) // 🟣 >=0.2.0
    .addRule('jsonc/no-unicode-codepoint-escapes', ERROR) // 🟣 >=1.1.0
    // .addRule('jsonc/sort-array-values', OFF) // >=2.2.0
    // .addRule('jsonc/sort-keys', OFF) // >=0.1.0
    // .addRule('jsonc/valid-json-number', OFF) // 🟣(json, jsonc) >=0.1.0
    .addRule('jsonc/vue-custom-block/no-parsing-error', ERROR) // 🟣 >=0.8.0
    // 🟢 Extension rules
    // .addRule('jsonc/array-bracket-newline', OFF) // >=0.1.0
    // .addRule('jsonc/array-bracket-spacing', OFF) // >=0.1.0
    // .addRule('jsonc/array-element-newline', OFF) // >=0.1.0
    // .addRule('jsonc/comma-dangle', OFF) // 🟣(json) >=0.1.0
    // .addRule('jsonc/comma-style', OFF) // >=0.1.0
    // .addRule('jsonc/indent', OFF) // >=0.1.0
    // .addRule('jsonc/key-spacing', OFF) // >=0.1.0
    .addRule('jsonc/no-dupe-keys', ERROR) // 🟣 >=0.1.0
    // .addRule('jsonc/no-floating-decimal', OFF) // 🟣(json, jsonc) >=0.9.0
    .addRule('jsonc/no-irregular-whitespace', ERROR) // >=2.5.0
    // .addRule('jsonc/no-multi-str', OFF) // 🟣(json, jsonc) >=0.1.0
    // .addRule('jsonc/no-octal-escape', OFF) // >=0.1.0
    .addRule('jsonc/no-octal', ERROR) // 🟣 >=1.1.0
    .addRule('jsonc/no-sparse-arrays', ERROR) // 🟣 >=0.2.0
    .addRule('jsonc/no-useless-escape', ERROR) // 🟣 >=0.1.0
    // .addRule('jsonc/object-curly-newline', OFF) // >=0.1.0
    // .addRule('jsonc/object-curly-spacing', OFF) // >=0.1.0
    // .addRule('jsonc/object-property-newline', OFF) // >=0.1.0
    // .addRule('jsonc/quote-props', OFF) // 🟣(json, jsonc) >=0.1.0
    // .addRule('jsonc/quotes', OFF) // 🟣(json, jsonc) >=0.1.0
    .addRule('jsonc/space-unary-ops', ERROR) // 🟣 >=0.2.0
    .addOverrides();

  const result = builder.getAllConfigs();

  if (options.jsonConfig) {
    const jsonBuilder = new ConfigEntryBuilder<'jsonc'>(options.jsonConfig, internalOptions);
    jsonBuilder
      .addConfig(['jsonc/json', {includeDefaultFilesAndIgnores: true, filesFallback: [GLOB_JSON]}])
      .addOverrides();
    result.push(...jsonBuilder.getAllConfigs());
  }

  if (options.jsoncConfig) {
    const jsoncBuilder = new ConfigEntryBuilder<'jsonc'>(options.jsoncConfig, internalOptions);
    jsoncBuilder
      .addConfig([
        'jsonc/jsonc',
        {includeDefaultFilesAndIgnores: true, filesFallback: [GLOB_JSONC]},
      ])
      .addOverrides();
    result.push(...jsoncBuilder.getAllConfigs());
  }

  if (options.json5Config) {
    const json5Builder = new ConfigEntryBuilder<'jsonc'>(options.json5Config, internalOptions);
    json5Builder
      .addConfig([
        'jsonc/json5',
        {includeDefaultFilesAndIgnores: true, filesFallback: [GLOB_JSON5]},
      ])
      .addOverrides();
    result.push(...json5Builder.getAllConfigs());
  }

  return result;
};
