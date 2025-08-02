import {ERROR, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, OFF} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import {JSONC_DEFAULT_FILES} from './shared';
import type {UnConfigFn} from './index';

export interface JsoncEslintConfigOptions extends UnConfigOptions<'jsonc'> {
  /**
   * Config exclusively for .json files (no rules are applied by default!)
   * @default false
   */
  configJson?: boolean | UnConfigOptions<'jsonc'>;

  /**
   * Config exclusively for .jsonc files (no rules are applied by default!)
   * @default false
   */
  configJsonc?: boolean | UnConfigOptions<'jsonc'>;

  /**
   * Config exclusively for .jsonc5 files (no rules are applied by default!)
   * @default false
   */
  configJson5?: boolean | UnConfigOptions<'jsonc'>;

  /**
   * `files` specified in this config will be merged with the default of
   * `['**\/*.json', '**\/*.jsonc', '**\/*.json5']`. Set this to `true` to avoid that behavior
   * @default false
   */
  doNotMergeFilesWithDefault?: boolean;
}

export const jsoncUnConfig: UnConfigFn<'json'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.json;
  const optionsResolved = assignDefaults(optionsRaw, {
    doNotMergeFilesWithDefault: false,
    configJson: false,
    configJsonc: false,
    configJson5: false,
  } satisfies JsoncEslintConfigOptions);
  const {doNotMergeFilesWithDefault, configJson, configJsonc, configJson5} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'jsonc');

  // Legend:
  // 🟣 = in main

  configBuilder
    ?.addConfig(
      [
        'jsonc/all',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: JSONC_DEFAULT_FILES,
          mergeUserFilesWithFallback: !doNotMergeFilesWithDefault,
          doNotIgnoreMarkdown: true,
          doNotIgnoreMdx: true,
        },
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    /* Category: Main rules */
    .addRule('auto', OFF) // >=0.8.0
    .addRule('key-name-casing', OFF) // >=0.8.0
    .addRule('no-bigint-literals', ERROR) // 🟣 >=0.2.0
    .addRule('no-binary-expression', ERROR) // 🟣 >=2.0.0
    .addRule('no-binary-numeric-literals', ERROR) // 🟣 >=1.1.0
    .addRule('no-comments', OFF) // 🟣 (json) >=0.1.0
    .addRule('no-escape-sequence-in-identifier', ERROR) // 🟣 >=1.1.0
    .addRule('no-hexadecimal-numeric-literals', OFF) // 🟣(json, jsonc) >=1.1.0
    .addRule('no-infinity', OFF) // 🟣(json, jsonc) >=1.1.0
    .addRule('no-nan', OFF) // 🟣(json, jsonc) >=1.1.0
    .addRule('no-number-props', ERROR) // 🟣 >=0.2.0
    .addRule('no-numeric-separators', ERROR) // 🟣 >=0.6.0
    .addRule('no-octal-numeric-literals', ERROR) // 🟣 >=1.1.0
    .addRule('no-parenthesized', ERROR) // 🟣 >=2.0.0
    .addRule('no-plus-sign', OFF) // 🟣(json, jsonc) >=1.1.0
    .addRule('no-regexp-literals', ERROR) // 🟣 >=0.2.0
    .addRule('no-template-literals', ERROR) // 🟣 >=0.2.0
    .addRule('no-undefined-value', ERROR) // 🟣 >=0.2.0
    .addRule('no-unicode-codepoint-escapes', ERROR) // 🟣 >=1.1.0
    .addRule('sort-array-values', OFF) // >=2.2.0
    .addRule('sort-keys', OFF) // >=0.1.0
    .addRule('valid-json-number', OFF) // 🟣(json, jsonc) >=0.1.0
    .addRule('vue-custom-block/no-parsing-error', ERROR) // 🟣 >=0.8.0
    /* Category: Extension rules */
    .addRule('array-bracket-newline', OFF) // >=0.1.0
    .addRule('array-bracket-spacing', OFF) // >=0.1.0
    .addRule('array-element-newline', OFF) // >=0.1.0
    .addRule('comma-dangle', OFF) // 🟣(json) >=0.1.0
    .addRule('comma-style', OFF) // >=0.1.0
    .addRule('indent', OFF) // >=0.1.0
    .addRule('key-spacing', OFF) // >=0.1.0
    .addRule('no-dupe-keys', ERROR) // 🟣 >=0.1.0
    .addRule('no-floating-decimal', OFF) // 🟣(json, jsonc) >=0.9.0
    .addRule('no-irregular-whitespace', ERROR) // >=2.5.0
    .addRule('no-multi-str', OFF) // 🟣(json, jsonc) >=0.1.0
    .addRule('no-octal-escape', OFF) // >=0.1.0
    .addRule('no-octal', ERROR) // 🟣 >=1.1.0
    .addRule('no-sparse-arrays', ERROR) // 🟣 >=0.2.0
    .addRule('no-useless-escape', ERROR) // 🟣 >=0.1.0
    .addRule('object-curly-newline', OFF) // >=0.1.0
    .addRule('object-curly-spacing', OFF) // >=0.1.0
    .addRule('object-property-newline', OFF) // >=0.1.0
    .addRule('quote-props', OFF) // 🟣(json, jsonc) >=0.1.0
    .addRule('quotes', OFF) // 🟣(json, jsonc) >=0.1.0
    .addRule('space-unary-ops', ERROR) // 🟣 >=0.2.0
    // Included in the recommended config:
    .disableAnyRule('', 'no-unused-expressions')
    .disableAnyRule('', 'no-unused-vars')
    .disableAnyRule('', 'strict')
    .addOverrides();

  const configBuilderJson = createConfigBuilder(context, configJson, 'jsonc');
  configBuilderJson
    ?.addConfig([
      'jsonc/json',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JSON],
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
      },
    ])
    .addOverrides();

  const configBuilderJsonc = createConfigBuilder(context, configJsonc, 'jsonc');
  configBuilderJsonc
    ?.addConfig([
      'jsonc/jsonc',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JSONC],
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
      },
    ])
    .addOverrides();

  const configBuilderJson5 = createConfigBuilder(context, configJson5, 'jsonc');
  configBuilderJson5
    ?.addConfig([
      'jsonc/json5',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [GLOB_JSON5],
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
      },
    ])
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderJson, configBuilderJsonc, configBuilderJson5],
    optionsResolved,
  };
};
