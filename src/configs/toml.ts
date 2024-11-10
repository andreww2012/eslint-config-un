import eslintPluginToml from 'eslint-plugin-toml';
import tomlEslintParser from 'toml-eslint-parser';
import {ERROR, GLOB_TOML, OFF} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  GetRuleOptions,
  InternalConfigOptions,
} from '../types/eslint';
import {ConfigEntryBuilder} from '../utils';

const DEFAULT_FILES = [GLOB_TOML];

const DEFAULT_FILES_TO_IGNORE = ['Cargo.lock'] as const;

export interface TomlEslintConfigOptions extends ConfigSharedOptions<'toml'> {
  /** `files` specified in this config will be merged with the default of `['**\/*.toml']`. Set this to `true` to avoid that behavior */
  doNotMergeFilesWithDefault?: boolean;

  doNotIgnoreFilesByDefault?: Partial<Record<(typeof DEFAULT_FILES_TO_IGNORE)[number], boolean>>;
  /**
   * Mixed types in array were prohibited in TOML v0.5.0: https://toml.io/en/v0.5.0#array
   * @default false
   */
  noMixedTypeInArray?: boolean;
  /**
   * Will be merged with the default value
   * @default {allowHexadecimal: true}
   */
  noNonDecimalIntegerExceptions?: GetRuleOptions<'toml/no-non-decimal-integer'>[0] & {};
  /**
   * "Millisecond precision is required. Further precision of fractional seconds is implementation-specific."
   * @see https://toml.io/en/v1.0.0#local-time
   * @default 3
   */
  maxPrecisionOfFractionalSeconds?: number;
  /**
   * @see https://toml.io/en/v1.0.0#integer
   * @default 64
   */
  maxIntegerPrecisionBits?: number;
}

export const tomlEslintConfig = (
  options: TomlEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'toml'>(options, internalOptions);

  // LEGEND:
  // 🟣 = Included in Standard ruleset

  builder
    .addConfig(
      [
        'toml',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: DEFAULT_FILES,
          mergeUserFilesWithFallback: !options.doNotMergeFilesWithDefault,
        },
      ],
      {
        plugins: {
          // @ts-expect-error types mismatch
          toml: eslintPluginToml,
        },
        ignores: [
          ...DEFAULT_FILES_TO_IGNORE.map((fileToIgnore) =>
            options.doNotIgnoreFilesByDefault?.[fileToIgnore]
              ? undefined
              : (`**/${fileToIgnore}` as const),
          ).filter((v) => typeof v === 'string'),
          ...(options.ignores || []),
        ],
        languageOptions: {
          parser: tomlEslintParser,
        },
      },
    )
    .addBulkRules(
      eslintPluginToml.configs['flat/standard'].reduce(
        (result, config) => Object.assign(result, config.rules),
        {},
      ),
    )
    // 🟢 Base rules
    // .addRule('toml/indent', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/keys-order', ERROR) // 🟣 >=0.1.0
    .addRule('toml/no-mixed-type-in-array', options.noMixedTypeInArray ? ERROR : OFF) // >=0.1.0
    .addRule('toml/no-non-decimal-integer', ERROR, [
      {allowHexadecimal: true, ...options.noNonDecimalIntegerExceptions},
    ]) //  >=0.1.0
    // .addRule('toml/no-space-dots', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/no-unreadable-number-separator', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/padding-line-between-pairs', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/padding-line-between-tables', ERROR) // 🟣 >=0.1.0
    .addRule('toml/precision-of-fractional-seconds', ERROR, [
      {max: options.maxPrecisionOfFractionalSeconds ?? 3},
    ]) // 🟣 >=0.1.0
    .addRule('toml/precision-of-integer', ERROR, [{maxBit: options.maxIntegerPrecisionBits ?? 64}]) // 🟣 >=0.1.0
    // .addRule('toml/quoted-keys', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/tables-order', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/vue-custom-block/no-parsing-error', ERROR) // 🟣 >=0.1.0
    // 🟢 Extension rules
    // .addRule('toml/array-bracket-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/array-bracket-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/array-element-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/comma-style', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/inline-table-curly-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/key-spacing', ERROR) // 🟣 >=0.2.0
    // .addRule('toml/spaced-comment', ERROR) // 🟣 >=0.1.0
    // .addRule('toml/table-bracket-spacing', ERROR) // 🟣 >=0.1.0
    .addOverrides();

  return builder.getAllConfigs();
};
