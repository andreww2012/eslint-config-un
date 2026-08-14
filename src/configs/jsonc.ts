import {ERROR, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, OFF} from '../constants';
import {JSONC_DEFAULT_FILES} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface JsoncEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'jsonc'> {
  /**
   * 📁 Default `files`: <code>**&#47;*.json</code>
   *
   * ⚠️ WARNING: no rules are configured by default, this sub-config only exists
   * to provide a convenient way to override rules for JSON files.
   * @default false
   */
  configJson?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'jsonc'>;

  /**
   * 📁 Default `files`: <code>**&#47;*.jsonc</code>
   *
   * ⚠️ WARNING: no rules are configured by default, this sub-config only exists
   * to provide a convenient way to override rules for JSONC files.
   * @default false
   */
  configJsonc?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'jsonc'>;

  /**
   * 📁 Default `files`: <code>**&#47;*.json5</code>
   *
   * ⚠️ WARNING: no rules are configured by default, this sub-config only exists
   * to provide a convenient way to override rules for JSON5 files.
   * @default false
   */
  configJson5?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'jsonc'>;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configJson: false,
    configJsonc: false,
    configJson5: false,
  });
  const {configJson, configJsonc, configJson5} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'jsonc');

  // Legend:
  // 🟣 = in main

  configBuilder
    ?.addConfig([
      'jsonc/all',
      {
        filesDefault: JSONC_DEFAULT_FILES,
        ignoresInternal: {md: false, mdx: false}, // TODO why?
        language: ['jsonc', 'x'],
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
        filesDefault: [GLOB_JSON],
        ignoresInternal: {md: false, mdx: false}, // TODO why?
        language: ['jsonc', 'json'],
      },
    ])
    .addOverrides();

  const configBuilderJsonc = context.createConfigBuilder(configJsonc, 'jsonc');
  configBuilderJsonc
    ?.addConfig([
      'jsonc/jsonc',
      {
        filesDefault: [GLOB_JSONC],
        ignoresInternal: {md: false, mdx: false}, // TODO why?
        language: ['jsonc', 'jsonc'],
      },
    ])
    .addOverrides();

  const configBuilderJson5 = context.createConfigBuilder(configJson5, 'jsonc');
  configBuilderJson5
    ?.addConfig([
      'jsonc/json5',
      {
        filesDefault: [GLOB_JSON5],
        ignoresInternal: {md: false, mdx: false}, // TODO why?
        language: ['jsonc', 'json5'],
      },
    ])
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderJson, configBuilderJsonc, configBuilderJson5],
    optionsResolved,
  };
}) satisfies UnConfigFn<'jsonc'>;
