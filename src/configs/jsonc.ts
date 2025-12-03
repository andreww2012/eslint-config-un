import {ERROR, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, OFF} from '../constants';
import {JSONC_DEFAULT_FILES} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface JsoncEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'jsonc'> {
  /**
   * Config exclusively for .json files (no rules are applied by default!)
   * @default false
   */
  configJson?: boolean | UnConfigOptions<ExtraPlugins, 'jsonc'>;

  /**
   * Config exclusively for .jsonc files (no rules are applied by default!)
   * @default false
   */
  configJsonc?: boolean | UnConfigOptions<ExtraPlugins, 'jsonc'>;

  /**
   * Config exclusively for .jsonc5 files (no rules are applied by default!)
   * @default false
   */
  configJson5?: boolean | UnConfigOptions<ExtraPlugins, 'jsonc'>;

  /**
   * `files` specified in this config will be merged with the default of
   * `['**\/*.json', '**\/*.jsonc', '**\/*.json5']`. Set this to `true` to avoid that behavior
   * @default false
   */
  doNotMergeFilesWithDefault?: boolean;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    doNotMergeFilesWithDefault: false,
    configJson: false,
    configJsonc: false,
    configJson5: false,
  } satisfies JsoncEslintConfigOptions);
  const {doNotMergeFilesWithDefault, configJson, configJsonc, configJson5} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'jsonc');

  // Legend:
  // 🟣 = in main

  configBuilder
    ?.addConfig([
      'jsonc/all',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: JSONC_DEFAULT_FILES,
        mergeUserFilesWithFallback: !doNotMergeFilesWithDefault,
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
        parser: 'jsonc-eslint-parser',
      },
    ])
    .markCategory('Main rules')
    .addRule('auto', OFF) /** @since 0.8.0 */
    .addRule('key-name-casing', OFF) /** @since 0.8.0 */
    .addRule('no-bigint-literals', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-binary-expression', ERROR) /** @since 2.0.0 */ // 🟣
    .addRule('no-binary-numeric-literals', ERROR) /** @since 1.1.0 */ // 🟣
    .addRule('no-comments', OFF) /** @since 0.1.0 */ // 🟣 (json)
    .addRule('no-escape-sequence-in-identifier', ERROR) /** @since 1.1.0 */ // 🟣
    .addRule('no-hexadecimal-numeric-literals', OFF) /** @since 1.1.0 */ // 🟣(json, jsonc)
    .addRule('no-infinity', OFF) /** @since 1.1.0 */ // 🟣(json, jsonc)
    .addRule('no-nan', OFF) /** @since 1.1.0 */ // 🟣(json, jsonc)
    .addRule('no-number-props', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-numeric-separators', ERROR) /** @since 0.6.0 */ // 🟣
    .addRule('no-octal-numeric-literals', ERROR) /** @since 1.1.0 */ // 🟣
    .addRule('no-parenthesized', ERROR) /** @since 2.0.0 */ // 🟣
    .addRule('no-plus-sign', OFF) /** @since 1.1.0 */ // 🟣(json, jsonc)
    .addRule('no-regexp-literals', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-template-literals', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-undefined-value', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-unicode-codepoint-escapes', ERROR) /** @since 1.1.0 */ // 🟣
    .addRule('sort-array-values', OFF) /** @since 2.2.0 */
    .addRule('sort-keys', OFF) /** @since 0.1.0 */
    .addRule('valid-json-number', OFF) /** @since 0.1.0 */ // 🟣(json, jsonc)
    .addRule('vue-custom-block/no-parsing-error', ERROR) /** @since 0.8.0 */ // 🟣
    .markCategory('Extension rules')
    .addRule('array-bracket-newline', OFF) /** @since 0.1.0 */
    .addRule('array-bracket-spacing', OFF) /** @since 0.1.0 */
    .addRule('array-element-newline', OFF) /** @since 0.1.0 */
    .addRule('comma-dangle', OFF) /** @since 0.1.0 */ // 🟣(json)
    .addRule('comma-style', OFF) /** @since 0.1.0 */
    .addRule('indent', OFF) /** @since 0.1.0 */
    .addRule('key-spacing', OFF) /** @since 0.1.0 */
    .addRule('no-dupe-keys', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-floating-decimal', OFF) /** @since 0.9.0 */ // 🟣(json, jsonc)
    .addRule('no-irregular-whitespace', ERROR) /** @since 2.5.0 */
    .addRule('no-multi-str', OFF) /** @since 0.1.0 */ // 🟣(json, jsonc)
    .addRule('no-octal', ERROR) /** @since 1.1.0 */ // 🟣
    .addRule('no-octal-escape', OFF) /** @since 0.1.0 */
    .addRule('no-sparse-arrays', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('no-useless-escape', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('object-curly-newline', OFF) /** @since 0.1.0 */
    .addRule('object-curly-spacing', OFF) /** @since 0.1.0 */
    .addRule('object-property-newline', OFF) /** @since 0.1.0 */
    .addRule('quote-props', OFF) /** @since 0.1.0 */ // 🟣(json, jsonc)
    .addRule('quotes', OFF) /** @since 0.1.0 */ // 🟣(json, jsonc)
    .addRule('space-unary-ops', ERROR) /** @since 0.2.0 */ // 🟣
    // Included in the recommended config:
    .disableAnyRule('', 'no-unused-expressions')
    .disableAnyRule('', 'no-unused-vars')
    .disableAnyRule('', 'strict')
    .enableConfigTesterForPlugin('jsonc')
    .addOverrides();

  const configBuilderJson = context.createConfigBuilder(configJson, 'jsonc');
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

  const configBuilderJsonc = context.createConfigBuilder(configJsonc, 'jsonc');
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

  const configBuilderJson5 = context.createConfigBuilder(configJson5, 'jsonc');
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
}) satisfies UnConfigFn<'json'>;
