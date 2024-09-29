import eslintPluginYaml from 'eslint-plugin-yml';
// eslint-disable-next-line import/no-extraneous-dependencies
import yamlEslintParser from 'yaml-eslint-parser';
import {ERROR, OFF} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  GetRuleOptions,
  InternalConfigOptions,
} from '../types';
import {ConfigEntryBuilder} from '../utils';

export interface YamlEslintConfigOptions extends ConfigSharedOptions<'yml'> {
  /**
   * @default 'yml'
   */
  enforceExtension?: (GetRuleOptions<'yml/file-extension'>[0] & {})['extension'];
  /**
   * Will be merged with the default value (default `ignores` values will also be merged, not overriden)
   * @default {camelCase: true, ignores: ['<<']}
   */
  casing?: GetRuleOptions<'yml/key-name-casing'>[0] & {};
  /**
   * `false` to not enforce quotes style
   * @default 'single'
   */
  quotes?: (GetRuleOptions<'yml/quotes'>[0] & {})['prefer'] | false;
  parseOptions?: {
    /**
     * @see https://github.com/ota-meshi/yaml-eslint-parser?tab=readme-ov-file#advanced-configuration
     */
    defaultYAMLVersion?: string;
  };
}

export const yamlEslintConfig = (
  options: YamlEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'yml'>(options, internalOptions);

  // LEGEND:
  // 🟣 = Included in Standard ruleset

  builder
    .addConfig('yaml', {
      plugins: {
        // @ts-expect-error types mismatch
        yml: eslintPluginYaml,
      },
      files: options.files || ['*.yaml', '**/*.yaml', '*.yml', '**/*.yml'],
      ignores: ['**/yarn.lock', '**/pnpm-lock.yaml', ...(options.ignores || [])],
      languageOptions: {
        parser: yamlEslintParser,
      },
    })
    .addBulkRules(
      eslintPluginYaml.configs['flat/standard'].reduce(
        (result, config) => Object.assign(result, config.rules),
        {},
      ),
    )
    // 🟢 Base rules
    .addRule('yml/block-mapping-colon-indicator-newline', ERROR) // >=1.2.0
    // .addRule('yml/block-mapping-question-indicator-newline', ERROR) // 🟣 >=0.5.0
    // .addRule('yml/block-mapping', ERROR) // 🟣 >=0.1.0
    // .addRule('yml/block-sequence-hyphen-indicator-newline', ERROR) // 🟣 >=0.5.0
    // .addRule('yml/block-sequence', ERROR) // 🟣 >=0.1.0
    // TODO why reporting here?
    .addRule('yml/file-extension', ERROR, [{extension: options.enforceExtension ?? 'yml'}]) // >=1.2.0
    .addRule('yml/indent', ERROR) // 🟣 >=0.1.0
    .addRule('yml/key-name-casing', ERROR, [
      {camelCase: true, ...options.casing, ignores: ['<<', ...(options.ignores || [])]},
    ]) // >=0.2.0
    // .addRule('yml/no-empty-document', ERROR) // 🟣 >=0.6.0
    // .addRule('yml/no-empty-key', ERROR) // 🟣 >=0.3.0
    // .addRule('yml/no-empty-mapping-value', ERROR) // 🟣 >=0.3.0
    // .addRule('yml/no-empty-sequence-entry', ERROR) // 🟣 >=0.3.0
    // .addRule('yml/no-tab-indent', ERROR) // 🟣 >=0.1.0
    // .addRule('yml/no-trailing-zeros', OFF) // >=1.6.0
    // TODO option to ignore if a string is ISO 8601 date?
    // .addRule('yml/plain-scalar', ERROR) // 🟣 >=0.3.0
    .addRule('yml/quotes', options.quotes === false ? OFF : ERROR, [
      {prefer: options.quotes || 'single'},
    ]) // 🟣 >=0.3.0
    // .addRule('yml/require-string-key', OFF) // >=0.3.0
    // .addRule('yml/sort-keys', OFF) // >=0.3.0
    // .addRule('yml/sort-sequence-values', OFF) // >=0.14.0
    // .addRule('yml/vue-custom-block/no-parsing-error', ERROR) // >=0.2.0
    // 🟢 Extension rules
    // .addRule('yml/flow-mapping-curly-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('yml/flow-mapping-curly-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('yml/flow-sequence-bracket-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('yml/flow-sequence-bracket-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('yml/key-spacing', ERROR) // 🟣 >=0.3.0
    // .addRule('yml/no-irregular-whitespace', ERROR) // 🟣 >=0.1.0
    .addRule('yml/no-multiple-empty-lines', ERROR) // >=0.12.0
    .addRule('yml/spaced-comment', ERROR) // 🟣 >=0.1.0
    .addOverrides();

  return builder.getAllConfigs();
};