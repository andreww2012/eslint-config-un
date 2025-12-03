import {ERROR, OFF} from '../constants';
import {TOML_DEFAULT_FILES} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

const DEFAULT_FILES_TO_IGNORE = ['Cargo.lock'] as const;

export interface TomlEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'toml'> {
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
  noNonDecimalIntegerExceptions?: GetRuleOptions<'toml', 'no-non-decimal-integer'>;

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

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    maxPrecisionOfFractionalSeconds: 3,
    maxIntegerPrecisionBits: 64,
  } satisfies TomlEslintConfigOptions);

  const {maxPrecisionOfFractionalSeconds, maxIntegerPrecisionBits} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'toml');

  // Legend:
  // 🟣 = in standard

  configBuilder
    ?.addConfig(
      [
        'toml',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: TOML_DEFAULT_FILES,
          mergeUserFilesWithFallback: !optionsResolved.doNotMergeFilesWithDefault,
          parser: 'toml-eslint-parser',
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
      },
    )
    .markCategory('Base rules')
    .addRule('indent', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('keys-order', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule(
      'no-mixed-type-in-array',
      optionsResolved.noMixedTypeInArray ? ERROR : OFF,
    ) /** @since 0.1.0 */
    .addRule('no-non-decimal-integer', ERROR, [
      {allowHexadecimal: true, ...optionsResolved.noNonDecimalIntegerExceptions},
    ]) /** @since 0.1.0 */
    .addRule('no-space-dots', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('no-unreadable-number-separator', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('padding-line-between-pairs', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('padding-line-between-tables', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('precision-of-fractional-seconds', ERROR, [
      {max: maxPrecisionOfFractionalSeconds},
    ]) /** @since 0.1.0 */ // 🟣
    .addRule('precision-of-integer', ERROR, [{maxBit: maxIntegerPrecisionBits}]) /** @since 0.1.0 */ // 🟣
    .addRule('quoted-keys', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('tables-order', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('vue-custom-block/no-parsing-error', ERROR) /** @since 0.1.0 */ // 🟣
    .markCategory('Extension rules')
    .addRule('array-bracket-newline', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('array-bracket-spacing', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('array-element-newline', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('comma-style', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('inline-table-curly-spacing', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('key-spacing', ERROR) /** @since 0.2.0 */ // 🟣
    .addRule('spaced-comment', ERROR) /** @since 0.1.0 */ // 🟣
    .addRule('table-bracket-spacing', ERROR) /** @since 0.1.0 */ // 🟣
    .enableConfigTesterForPlugin('toml')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'toml'>;
