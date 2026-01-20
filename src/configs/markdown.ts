import type {MarkdownLanguageOptions} from '@eslint/markdown/types';
import type {BundledLanguage as ShikiLanguageCodesList} from 'shiki';
import {ERROR, GLOB_MARKDOWN, GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS, OFF} from '../constants';
import type {FlatConfigEntryFilesOrIgnores} from '../eslint';
import {generatePackageToLoadProperty} from '../loaders';
import type {Prettify} from '../types';
import {capitalize, unique} from '../utils';
import {
  type IgnoresAdditionalOptions,
  determineRulesDisabledInEmbeddedCodeBlocks,
  generateIgnoresWithAdditional,
} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type RulesRecordPartial,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

type MarkdownDialect = 'commonmark' | 'gfm';

type CodeBlockLanguage = ShikiLanguageCodesList | (string & {});

const DEFAULT_FILES = [GLOB_MARKDOWN];
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS];

const GFM_ALERTS_TYPES = ['note', 'tip', 'important', 'warning', 'caution'] as const;

const generateNoMissingLabelRefsOptions = (
  dialect: MarkdownDialect,
): GetRuleOptions<'markdown', 'no-missing-label-refs', 'all'> => [
  {
    // TODO remove once https://github.com/eslint/markdown/issues/294 is landed
    ...(dialect === 'gfm' && {
      allowLabels: GFM_ALERTS_TYPES.flatMap((alertType) => [
        `!${alertType}`,
        `!${alertType.toUpperCase()}`,
        `!${capitalize(alertType)}`,
      ]),
    }),
  },
];

const CONFIG_SENTENCES_PER_LINE_DEFAULT_IGNORES = ['LICENSE.md'] as const;

export interface MarkdownEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'markdown'> {
  /**
   * Format fenced code blocks with Prettier.
   * @default true <=> `prettier` package is installed
   */
  configFormatFencedCodeBlocks?: boolean | UnConfigOptions<ExtraPlugins, 'prettier'>;

  /**
   * Config with the plugin that allows you to enforce that no line in your Markdown files
   * contains more than one sentence.
   *
   * 📁 Default `files`: parent config's `files`
   *
   * ❌ Default `ignores`: parent config's `ignores` merged with the default ignore list.
   * If `ignores` is explicitly specified, it will still be merged with the default ignore list,
   * excluding items specified in `ignoresAdditional`.
   *
   * The default ignore list: `LICENSE.md`.
   *
   * 🧩 Main plugin: [`eslint-plugin-sentences-per-line`](https://npmjs.com/eslint-plugin-sentences-per-line) ([docs](https://github.com/JoshuaKGoldberg/sentences-per-line/tree/main/packages/eslint-plugin-sentences-per-line#readme))
   * @default false
   */
  configSentencesPerLine?:
    | boolean
    | (UnConfigOptions<ExtraPlugins, 'sentences-per-line'> &
        IgnoresAdditionalOptions<typeof CONFIG_SENTENCES_PER_LINE_DEFAULT_IGNORES>);

  /**
   * Lint Markdown files themselves (***not*** fenced code blocks inside them)
   * @default true
   */
  lintMarkdown?: boolean;

  /**
   * Choose a Markdown language dialect globally or per specific files. For each array item,
   * a separate config entry will be created. `gfm` stands for [GitHub Flavored Markdown](https://github.github.com/gfm).
   *
   * If `gfm` syntax is used, [`no-missing-label-refs`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-label-refs.md) rule will be enabled and have `allowLabels` option set to [GitHub alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts).
   * @default 'gfm'
   */
  language?:
    | MarkdownDialect
    | Prettify<FlatConfigEntryFilesOrIgnores & {language: MarkdownDialect}>[];

  /**
   * If array, only those tags will be allowed. If `false`, no tags are allowed. If `true`, all tags are allowed (default)
   * @default true
   */
  allowHtmlTags?: boolean | string[];

  /**
   * Lint fenced code blocks (\```lang ... ```) inside Markdown files
   *
   * You can also specify which *markdown* files should be subject to fenced code blocks linting.
   * @default true
   * @example {files: ['**\/*.md'], ignores: ['CHANGELOG.md'], ignoreLanguages: ['yml']}
   */
  lintCodeBlocks?: boolean | Prettify<FlatConfigEntryFilesOrIgnores>;

  /**
   * Note that these languages will be ignored disregarding of specified in `.lintCodeBlocks{files,ignores}`, i.e. this option will create a rule ignoring by `**\/*.md/**\/*.{extensions}` pattern.
   *
   * [Markdown only] Since some language codes [get remapped](https://github.com/eslint/markdown/blob/e7e6f58f6a0181a0b6e61197d65ddd12ab32b443/src/processor.js#L244) (`javascript` -> `js`), so specifying `javascript` instead of `js` won't have any effect.
   */
  codeBlocksIgnoredLanguages?: CodeBlockLanguage[];

  /**
   * Only these languages codes are allowed in fenced code blocks (\```lang ... ```)
   * By default, all languages, including no language, are allowed. To require any language to be explicitly specified, specify `any-lang-required`.
   *
   * Since some language codes [get remapped](https://github.com/eslint/markdown/blob/e7e6f58f6a0181a0b6e61197d65ddd12ab32b443/src/processor.js#L244) (`javascript` -> `js`), so specifying `javascript` instead of `js` won't have any effect.
   *
   * There is no option to "allow only this set of languages or not specifying a language".
   * @default all languages are allowed, including no language
   * @example ['js', 'ts', 'vue']
   */
  codeBlocksAllowedLanguages?: [CodeBlockLanguage, ...CodeBlockLanguage[]] | 'any-lang-required';

  /**
   * Lint fenced code blocks as if its code assumed to be running in JavaScript's [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).
   *
   * Likely you don't want to change this.
   * @default true
   * @see https://github.com/eslint/markdown/HEAD/main/docs/processors/markdown.md
   */
  codeBlocksImpliedStrictMode?: boolean;

  overridesCodeBlocks?: RulesRecordPartial;

  /**
   * Enables Front Matter parsing in both `commonmark` and `gfm` dialects.
   * @default 'yaml'
   */
  parseFrontmatter?: MarkdownLanguageOptions['frontmatter'];
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configFormatFencedCodeBlocks: context.packagesInfo.prettier != null,
    configSentencesPerLine: false,
    files: DEFAULT_FILES,
    lintMarkdown: true,
    language: 'gfm',
    allowHtmlTags: true,
    lintCodeBlocks: true,
    parseFrontmatter: 'yaml',
    codeBlocksImpliedStrictMode: true,
  } satisfies MarkdownEslintConfigOptions);

  const {
    files: parentConfigFiles,
    ignores: parentConfigIgnores,

    configFormatFencedCodeBlocks,
    configSentencesPerLine,

    lintMarkdown,
    language,
    allowHtmlTags,

    lintCodeBlocks,
    codeBlocksIgnoredLanguages,
    codeBlocksAllowedLanguages,
    codeBlocksImpliedStrictMode,

    parseFrontmatter,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'markdown');

  const defaultDialect: MarkdownDialect = typeof language === 'string' ? language : 'commonmark';

  const allowedFencedCodeBlocksLanguages =
    Array.isArray(codeBlocksAllowedLanguages) &&
    codeBlocksAllowedLanguages.length > 0 &&
    codeBlocksAllowedLanguages;

  // Legend:
  // 🟢 - in recommended

  if (lintMarkdown) {
    configBuilder
      ?.addConfig(
        ['markdown/markdown', {includeDefaultFilesAndIgnores: true, ignoresInternal: {md: false}}],
        {
          language: `markdown/${defaultDialect}`,
          languageOptions: {
            frontmatter: parseFrontmatter,
          },
        },
      )
      .addRule(
        'fenced-code-language',
        allowedFencedCodeBlocksLanguages || codeBlocksAllowedLanguages === 'any-lang-required'
          ? ERROR
          : OFF,
        [
          {
            ...(allowedFencedCodeBlocksLanguages && {
              required: unique(codeBlocksAllowedLanguages satisfies string[]),
            }),
          },
        ],
      ) /** @since 6.0.0 */ // 🟢
      .addRule('heading-increment', ERROR) /** @since 6.0.0 */ // 🟢
      .addRule('no-bare-urls', OFF) /** @since 6.6.0 */
      .addRule('no-duplicate-definitions', ERROR) /** @since 6.5.0 */ // 🟢
      .addRule('no-duplicate-headings', OFF) /** @since 6.0.0 */
      .addRule('no-empty-definitions', ERROR) /** @since 6.5.0 */ // 🟢
      .addRule('no-empty-images', ERROR) /** @since 6.5.0 */ // 🟢
      .addRule('no-empty-links', ERROR) /** @since 6.0.0 */ // 🟢
      .addRule('no-html', allowHtmlTags === true ? OFF : ERROR, [
        {
          ...(Array.isArray(allowHtmlTags) &&
            allowHtmlTags.length > 0 && {
              allowed: unique(allowHtmlTags),
            }),
        },
      ]) /** @since 6.0.0 */
      .addRule('no-invalid-label-refs', ERROR) /** @since 6.0.0 */ // 🟢
      .addRule('no-missing-atx-heading-space', ERROR, [
        {checkClosedHeadings: true} /** @since 6.5.0 */,
      ]) // 🟢
      .addRule(
        'no-missing-label-refs',
        ERROR,
        generateNoMissingLabelRefsOptions(defaultDialect) /** @since 6.0.0 */,
      ) // 🟢
      .addRule('no-missing-link-fragments', ERROR) /** @since 6.6.0 */ // 🟢
      .addRule('no-multiple-h1', ERROR, [{frontmatterTitle: ''}]) /** @since 6.5.0 */ // 🟢
      .addRule('no-reference-like-urls', ERROR) /** @since 7.3.0 */ // 🟢
      .addRule('no-reversed-media-syntax', ERROR) /** @since 6.6.0 */ // 🟢
      .addRule('no-space-in-emphasis', ERROR) /** @since 7.2.0 */ // 🟢
      .addRule('no-unused-definitions', ERROR) /** @since 7.0.0 */ // 🟢
      .addRule('require-alt-text', ERROR) /** @since 6.5.0 */ // 🟢
      .addRule('table-column-count', ERROR, [{checkMissingCells: true} /** @since 6.5.0 */]) // 🟢
      .enableConfigTesterForPlugin('markdown')
      .addOverrides();

    if (Array.isArray(language)) {
      language.forEach((markdownLanguageSettings, i) => {
        const dialect = markdownLanguageSettings.language;
        configBuilder
          ?.addConfig(
            [
              `markdown/language-override/${i}`,
              {
                filesDefault: markdownLanguageSettings.files,
                ignoresDefault: markdownLanguageSettings.ignores,
                ignoresInternal: {
                  md: false,
                },
              },
            ],
            {
              language: `markdown/${dialect}`,
            },
          )
          .addRule('no-missing-label-refs', ERROR, generateNoMissingLabelRefsOptions(dialect));
      });
    }
  }

  if (lintCodeBlocks) {
    configBuilder?.addConfig(
      [
        'markdown/setup/code-blocks-processor',
        {filesDefault: DEFAULT_FILES, ignoresInternal: {md: false}},
      ],
      {
        // TODO report
        // eslint-disable-next-line sonarjs/no-gratuitous-expressions
        ...(typeof lintCodeBlocks === 'object' && lintCodeBlocks),
        ...generatePackageToLoadProperty(
          'processor',
          ['eslintPluginMarkdown', 'eslintMergeProcessors'],
          {
            valueTransformFn: {
              fn: ({
                eslintPluginMarkdown,
                eslintMergeProcessors: {mergeProcessors, processorPassThrough},
              }) => {
                const processorAllowingLintingBothMarkdownAndCodeBlocks = mergeProcessors([
                  eslintPluginMarkdown.processors.markdown,
                  processorPassThrough,
                ]);
                return processorAllowingLintingBothMarkdownAndCodeBlocks;
              },
            },
          },
        ),
      },
    );

    configBuilder
      ?.addConfig(
        [
          'markdown/code-blocks',
          {filesDefault: DEFAULT_FILES_FOR_CODE_BLOCKS, ignoresInternal: false},
        ],
        // TODO way to ignore ````js some-property`? way to allow using `with`, which is not allowed in the strict mode?
        {
          languageOptions: {
            parserOptions: {
              ecmaFeatures: {
                impliedStrict: codeBlocksImpliedStrictMode,
              },
            },
          },
        },
      )
      .disableBulkRules(determineRulesDisabledInEmbeddedCodeBlocks(context))
      .addBulkRules(optionsResolved.overridesCodeBlocks); // TODO

    if (codeBlocksIgnoredLanguages?.length) {
      configBuilder?.addConfig('markdown/code-blocks/ignore', {
        ignores: [`**/*.md/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      });
    }
  }

  const configFormatFencedCodeBlocksBuilder = context.createConfigBuilder(
    configFormatFencedCodeBlocks,
    'prettier',
  );

  configFormatFencedCodeBlocksBuilder
    ?.addConfig([
      'markdown/format-fenced-code-blocks',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: DEFAULT_FILES_FOR_CODE_BLOCKS,
        ignoresInternal: false,
      },
    ])
    .addRule('prettier', ERROR, [{}, {eslintTakeoverMode: true}]);

  const configBuilderSentencesPerLine = context.createConfigBuilder(
    configSentencesPerLine,
    'sentences-per-line',
  );
  if (configSentencesPerLine) {
    configBuilderSentencesPerLine
      ?.addConfig(
        [
          'markdown/sentences-per-line',
          {
            includeDefaultFilesAndIgnores: true,
            filesDefault: parentConfigFiles,
            ignoresInternal: {
              md: false,
            },
          },
        ],
        {
          ...generateIgnoresWithAdditional(
            configSentencesPerLine,
            parentConfigIgnores,
          )(CONFIG_SENTENCES_PER_LINE_DEFAULT_IGNORES),
        },
      )
      .addRule('one', ERROR) /** @since 0.0.0 */ // 🟢
      .enableConfigTesterForPlugin('sentences-per-line')
      .addOverrides();
  }

  return {
    configs: [configBuilder, configFormatFencedCodeBlocksBuilder, configBuilderSentencesPerLine],
    optionsResolved,
  };
}) satisfies UnConfigFn<'markdown'>;
