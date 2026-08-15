import type {DprintOptions, OxfmtOptions, PrettierOptions} from 'eslint-plugin-format/rule-options';
import {ERROR} from '../constants';
import type {OmitStrict, Prettify} from '../types';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

interface SupportedFormatters {
  dprint: DprintOptions;
  oxfmt: Prettify<OxfmtOptions>;
  prettier: Prettify<PrettierOptions>;
}

/**
 * An ESLint plugin for formatting various languages by
 * [Prettier](https://prettier.io) or [dprint](https://dprint.dev).
 *
 * 📁 Default `files`: all files
 *
 * 📚 Supports multiple configs (array notation)
 */
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
   * This will use [`eslint-parser-plain`](https://npmx.dev/eslint-parser-plain) for them.
   */
  usePlainParser?: boolean;
}

export default defineUnConfig<FormatEslintConfigOptions>('format', {
  enabledBy: false,
  supportsMultipleConfigs: true,
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    formatter: 'prettier',
  });

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
});
