import type {DprintOptions, OxfmtOptions, PrettierOptions} from 'eslint-plugin-format/rule-options';
import {ERROR} from '../constants';
import type {OmitStrict, Prettify} from '../types';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

interface SupportedFormatters {
  dprint: DprintOptions;
  oxfmt: Prettify<OxfmtOptions>;
  prettier: Prettify<PrettierOptions>;
}

export interface FormatEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'format'> {
  /**
   * Choose a formatter from `prettier`, `oxfmt` and `dprint`. Use an array notation
   * to pass formatter options.
   *
   * ⚠️ `dprint` formatter requires specifying `language` which is a file path or URL
   * to the WASM binary supporting this language.
   * [Read more on this in dprint docs](https://dprint.dev/plugins).
   * @default 'prettier'
   */
  formatter?:
    | keyof OmitStrict<SupportedFormatters, 'dprint'>
    | {
        [Formatter in keyof SupportedFormatters]: [Formatter, SupportedFormatters[Formatter]];
      }[keyof SupportedFormatters];

  /**
   * If the file format you're trying to format is not parsed by any ESLint parser,
   * make sure to set this option to `true` for such files.
   * This will use [`eslint-parser-plain`](https://npmjs.com/eslint-parser-plain) for them.
   */
  usePlainParser?: boolean;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    formatter: 'prettier',
  } satisfies Partial<FormatEslintConfigOptions>);

  // TODO remove after this is fixed: https://github.com/unjs/defu/issues/145
  if (optionsRaw && typeof optionsRaw === 'object') {
    for (const key of Object.getOwnPropertySymbols(optionsRaw)) {
      Reflect.set(optionsResolved, key, Reflect.get(optionsRaw, key));
    }
  }

  const {formatter: formatterAndMaybeOptions, usePlainParser} = optionsResolved;

  const [usedFormatter, formatterOptions] = Array.isArray(formatterAndMaybeOptions)
    ? formatterAndMaybeOptions
    : [formatterAndMaybeOptions];

  const configBuilder = context.createConfigBuilder(optionsResolved, 'format');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      `format/${usedFormatter}`,
      {
        includeDefaultFilesAndIgnores: true,
        ignoresInternal: false,
        ...(usePlainParser && {parser: 'eslint-parser-plain'}),
      },
    ])

    /**
     * prettier
     * @since 0.0.1
     */

    /**
     * dprint
     * @since 0.0.1
     */

    /**
     * oxfmt
     * @since 1.5.0
     */
    .addRule(usedFormatter, ERROR, formatterOptions ? [formatterOptions] : [])
    // Config tester is not enabled: only single rule is used
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'format'> as UnConfigFn<'format'>;
