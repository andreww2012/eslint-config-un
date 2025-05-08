import eslintPluginToml from 'eslint-plugin-toml';
import tomlEslintParser from 'toml-eslint-parser';
import {ERROR, GLOB_TOML, OFF} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type GetRuleOptions} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export const TOML_DEFAULT_FILES = [GLOB_TOML];

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
   * @default 3
   * @see https://toml.io/en/v1.0.0#local-time
   */
  maxPrecisionOfFractionalSeconds?: number;

  /**
   * @default 64
   * @see https://toml.io/en/v1.0.0#integer
   */
  maxIntegerPrecisionBits?: number;
}

export const tomlUnConfig: UnConfigFn<'toml'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.toml;
  const optionsResolved = assignDefaults(optionsRaw, {
    maxPrecisionOfFractionalSeconds: 3,
    maxIntegerPrecisionBits: 64,
  } satisfies TomlEslintConfigOptions);

  const {maxPrecisionOfFractionalSeconds, maxIntegerPrecisionBits} = optionsResolved;

  const configBuilder = new ConfigEntryBuilder('toml', optionsResolved, context);

  // LEGEND:
  // 🟣 = Included in Standard ruleset

  configBuilder
    .addConfig(
      [
        'toml',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: TOML_DEFAULT_FILES,
          mergeUserFilesWithFallback: !optionsResolved.doNotMergeFilesWithDefault,
        },
      ],
      {
        ignores: [
          ...DEFAULT_FILES_TO_IGNORE.map((fileToIgnore) =>
            optionsResolved.doNotIgnoreFilesByDefault?.[fileToIgnore]
              ? undefined
              : (`**/${fileToIgnore}` as const),
          ).filter((v) => typeof v === 'string'),
          ...(optionsResolved.ignores || []),
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
    // .addRule('indent', ERROR) // 🟣 >=0.1.0
    // .addRule('keys-order', ERROR) // 🟣 >=0.1.0
    .addRule('no-mixed-type-in-array', optionsResolved.noMixedTypeInArray ? ERROR : OFF) // >=0.1.0
    .addRule('no-non-decimal-integer', ERROR, [
      {allowHexadecimal: true, ...optionsResolved.noNonDecimalIntegerExceptions},
    ]) //  >=0.1.0
    // .addRule('no-space-dots', ERROR) // 🟣 >=0.1.0
    // .addRule('no-unreadable-number-separator', ERROR) // 🟣 >=0.1.0
    // .addRule('padding-line-between-pairs', ERROR) // 🟣 >=0.1.0
    // .addRule('padding-line-between-tables', ERROR) // 🟣 >=0.1.0
    .addRule('precision-of-fractional-seconds', ERROR, [{max: maxPrecisionOfFractionalSeconds}]) // 🟣 >=0.1.0
    .addRule('precision-of-integer', ERROR, [{maxBit: maxIntegerPrecisionBits}]) // 🟣 >=0.1.0
    // .addRule('quoted-keys', ERROR) // 🟣 >=0.1.0
    // .addRule('tables-order', ERROR) // 🟣 >=0.1.0
    // .addRule('vue-custom-block/no-parsing-error', ERROR) // 🟣 >=0.1.0
    // 🟢 Extension rules
    // .addRule('array-bracket-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('array-bracket-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('array-element-newline', ERROR) // 🟣 >=0.1.0
    // .addRule('comma-style', ERROR) // 🟣 >=0.1.0
    // .addRule('inline-table-curly-spacing', ERROR) // 🟣 >=0.1.0
    // .addRule('key-spacing', ERROR) // 🟣 >=0.2.0
    // .addRule('spaced-comment', ERROR) // 🟣 >=0.1.0
    // .addRule('table-bracket-spacing', ERROR) // 🟣 >=0.1.0
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};
