import type {FormatConfig as OxfmtOptions} from 'oxfmt';
import type {Options as PrettierOptions} from 'prettier';
import {
  ERROR,
  GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS,
  GLOB_MDX_SUPPORTED_CODE_BLOCKS,
  GLOB_MD_X_CODE_BLOCKS,
} from '../constants';
import type {DprintOptions} from '../plugin-format/worker';
import type {OmitStrict, Prettify} from '../types';
import {resolveFilesOption} from './shared';
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

const FORMATTER_PACKAGE_NAMES = {
  dprint: '@dprint/formatter',
  oxfmt: 'oxfmt',
  prettier: 'prettier',
} as const satisfies Record<keyof SupportedFormatters, string>;

const defaultFilesForFencedCodeBlocks = [
  GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS,
  GLOB_MDX_SUPPORTED_CODE_BLOCKS,
];

/**
 * Formats files with [Prettier](https://prettier.io),
 * [oxfmt](https://oxc.rs/docs/guide/usage/formatter) or [dprint](https://dprint.dev), reporting the
 * differences as ESLint errors.
 *
 * 📁 Default `files`: all files
 *
 * 📚 Supports multiple configs (array notation)
 */
export interface FormatEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'format'> {
  /**
   * Format fenced code blocks inside Markdown and MDX files.
   * Unless specified, `formatter` and `readFormatterConfig` are taken from the parent config.
   *
   * When enabled, the parent config no longer formats code blocks, so they can be formatted
   * differently.
   * To only format code blocks, set the parent config `files` to `[]`.
   *
   * 📁 Default `files`: fenced code blocks of the supported languages inside
   * <code>**&#47;*.md</code> and <code>**&#47;*.mdx</code> files
   * @default false
   */
  configFencedCodeBlocks?:
    | boolean
    | Prettify<
        UnFlatConfigEntryBase<ExtraPlugins, 'format'> &
          Pick<FormatEslintConfigOptions<ExtraPlugins>, 'formatter' | 'readFormatterConfig'>
      >;

  /**
   * Choose a formatter from `prettier`, `oxfmt` and `dprint`.
   * Use an array notation to pass formatter options.
   * Nothing is formatted if the formatter is not installed.
   *
   * ⚠️ `dprint` formatter requires specifying `language` which is a file path or URL to the WASM
   * binary supporting this language.
   * [Read more on this in dprint docs](https://dprint.dev/plugins).
   * @default 'oxfmt' <=> `oxfmt` package is installed and `prettier` is not, otherwise 'prettier'
   */
  formatter?:
    | keyof OmitStrict<SupportedFormatters, 'dprint'>
    | {
        [Formatter in keyof SupportedFormatters]: [Formatter, SupportedFormatters[Formatter]];
      }[keyof SupportedFormatters];

  /**
   * Whether to read the formatter config (and `.editorconfig`) that applies to the formatted file.
   * The options passed in `formatter` take precedence over it.
   *
   * ⚠️ Only Prettier's config can be read: oxfmt has no API for it, and dprint plugins are
   * configured in `formatter` only.
   * Pass the options of other formatters explicitly.
   * @default true
   */
  readFormatterConfig?: boolean;

  /**
   * If the file format you're trying to format is not parsed by any ESLint parser, make sure to set
   * this option to `true` for such files.
   * This will use [`eslint-parser-plain`](https://npmx.dev/eslint-parser-plain) for them.
   *
   * Requires `files`: the parser reads nothing, so leaving it unscoped would take the whole project
   * over.
   */
  usePlainParser?: boolean;
}

export default defineUnConfig<FormatEslintConfigOptions>('format', {
  enabledBy: false,
  supportsMultipleConfigs: true,
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configFencedCodeBlocks: false,
    formatter: context.packagesInfo.oxfmt && !context.packagesInfo.prettier ? 'oxfmt' : 'prettier',
    readFormatterConfig: true,
  });

  // TODO remove after this is fixed: https://github.com/unjs/defu/issues/145
  const symbolProperties =
    optionsRaw && typeof optionsRaw === 'object'
      ? Object.fromEntries(
          Object.getOwnPropertySymbols(optionsRaw).map((key) => [
            key,
            Reflect.get(optionsRaw, key),
          ]),
        )
      : {};
  Object.assign(optionsResolved, symbolProperties);

  const {configFencedCodeBlocks, formatter, readFormatterConfig, usePlainParser} = optionsResolved;

  /** `null` if the formatter is not installed */
  const resolveFormatter = (
    formatterAndMaybeOptions: typeof formatter,
    shouldReadConfig: boolean,
    configName: string,
  ) => {
    const [formatterName, formatterOptions] = Array.isArray(formatterAndMaybeOptions)
      ? formatterAndMaybeOptions
      : [formatterAndMaybeOptions];

    const packageName = FORMATTER_PACKAGE_NAMES[formatterName];
    if (context.packagesInfo[packageName] == null) {
      context.logger.warn(
        `[${configName}] \`${packageName}\` package is not installed, so nothing will be formatted. Install it or choose another formatter`,
      );
      return null;
    }

    const ruleOptions:
      | []
      | [Record<string, unknown>]
      | [Record<string, unknown>, {readConfig: boolean}] =
      formatterName === 'prettier' && !shouldReadConfig
        ? [formatterOptions || {}, {readConfig: false}]
        : formatterOptions
          ? [formatterOptions]
          : [];

    return {formatterName, ruleOptions};
  };

  if (usePlainParser && resolveFilesOption(optionsResolved.files, []).length === 0) {
    context.logger.warn(
      '[format] `usePlainParser` was ignored because no `files` were specified. Specify the files that no ESLint parser reads, otherwise the whole project would be parsed as plain text',
    );
  }

  const configBuilder = context.createConfigBuilder(optionsResolved, 'format');
  const parentFormatter =
    configBuilder && resolveFormatter(formatter, readFormatterConfig, 'format');

  if (parentFormatter) {
    configBuilder
      .addConfig([
        `format/${parentFormatter.formatterName}`,
        {
          ignoresInternal: false,
          ...(configFencedCodeBlocks && {
            ignoresDefault: [GLOB_MD_X_CODE_BLOCKS],
            ignoresDefaultMergedWithUserIgnores: true,
          }),
          ...(usePlainParser && {
            parseWith: 'plain',
          }),
        },
      ])

      /**
       * dprint, oxfmt, prettier
       * @since 1.0.0
       */
      .addRule(parentFormatter.formatterName, ERROR, parentFormatter.ruleOptions)
      // Config tester is not enabled: only single rule is used
      .addOverrides();
  }

  const fencedCodeBlocksOptions =
    typeof configFencedCodeBlocks === 'object' ? configFencedCodeBlocks : {};
  const configBuilderFencedCodeBlocks = context.createConfigBuilder(
    configFencedCodeBlocks && {...fencedCodeBlocksOptions, ...symbolProperties},
    'format',
  );
  const fencedCodeBlocksFormatter =
    configBuilderFencedCodeBlocks &&
    resolveFormatter(
      fencedCodeBlocksOptions.formatter || formatter,
      fencedCodeBlocksOptions.readFormatterConfig ?? readFormatterConfig,
      'format/fencedCodeBlocks',
    );

  if (fencedCodeBlocksFormatter) {
    configBuilderFencedCodeBlocks
      .addConfig([
        `format/${fencedCodeBlocksFormatter.formatterName}/fenced-code-blocks`,
        {
          filesDefault: defaultFilesForFencedCodeBlocks,
          ignoresInternal: false,
        },
      ])
      .addRule(
        fencedCodeBlocksFormatter.formatterName,
        ERROR,
        fencedCodeBlocksFormatter.ruleOptions,
      )
      .addOverrides();
  }
});
