import type {MarkdownLanguageOptions} from '@eslint/markdown/types';
import type {BundledLanguage as ShikiLanguageCodesList} from 'shiki';
import {ERROR, GLOB_MARKDOWN, GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS, OFF} from '../constants';
import {
  type FlatConfigEntryFiles,
  type FlatConfigEntryFilesOrIgnores,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import {assignDefaults, interopDefault, unique} from '../utils';
import {RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS} from './shared';
import type {UnConfigFn} from './index';

type MarkdownDialect = 'commonmark' | 'gfm';

type CodeBlockLanguage = ShikiLanguageCodesList | (string & {});

const DEFAULT_FILES = [GLOB_MARKDOWN];
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS];

export interface MarkdownEslintConfigOptions extends UnConfigOptions<'markdown'> {
  /**
   * Lint Markdown files themselves (***not*** fenced code blocks inside them)
   * @default true
   */
  lintMarkdown?: boolean;

  /**
   * Choose a Markdown language dialect globally or per specific files. For each array item,
   * a config entry will be created
   *
   * `gfm` stands for [GitHub Flavored Markdown](https://github.github.com/gfm/)
   * @default 'commonmark'
   */
  language?:
    | MarkdownDialect
    | PrettifyShallow<FlatConfigEntryFiles & {language: MarkdownDialect}>[];

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
  lintCodeBlocks?: boolean | PrettifyShallow<FlatConfigEntryFilesOrIgnores>;

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

  /**
   * Format fenced code blocks with Prettier.
   * @default true <=> `prettier` package is installed
   */
  configFormatFencedCodeBlocks?: boolean | UnConfigOptions<'prettier'>;

  overridesCodeBlocks?: RulesRecordPartial;

  /**
   * Enables Front Matter parsing in both `commonmark` and `gfm` dialects.
   * @default 'yaml'
   */
  parseFrontmatter?: MarkdownLanguageOptions['frontmatter'];
}

export const markdownUnConfig: UnConfigFn<'markdown'> = async (context) => {
  const [eslintPluginMarkdown, {mergeProcessors, processorPassThrough}] = await Promise.all([
    interopDefault(import('@eslint/markdown')),
    interopDefault(import('eslint-merge-processors')),
  ]);

  const optionsRaw = context.rootOptions.configs?.markdown;
  const optionsResolved = assignDefaults(optionsRaw, {
    lintMarkdown: true,
    language: 'commonmark',
    allowHtmlTags: true,
    lintCodeBlocks: true,
    parseFrontmatter: 'yaml',
    codeBlocksImpliedStrictMode: true,
    configFormatFencedCodeBlocks: context.packagesInfo.prettier != null,
  } satisfies MarkdownEslintConfigOptions);

  const {
    lintMarkdown,
    language,
    allowHtmlTags,

    lintCodeBlocks,
    codeBlocksIgnoredLanguages,
    codeBlocksAllowedLanguages,
    codeBlocksImpliedStrictMode,

    parseFrontmatter,
    configFormatFencedCodeBlocks,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'markdown');

  const defaultDialect: MarkdownDialect = typeof language === 'string' ? language : 'commonmark';
  const defaultConfigLanguage = `markdown/${defaultDialect}` as const;

  const allowedFencedCodeBlocksLanguages =
    Array.isArray(codeBlocksAllowedLanguages) &&
    codeBlocksAllowedLanguages.length > 0 &&
    codeBlocksAllowedLanguages;

  // Legend:
  // 🟢 - in recommended

  if (lintMarkdown) {
    configBuilder
      ?.addConfig(
        [
          'markdown/markdown',
          {
            includeDefaultFilesAndIgnores: true,
            filesFallback: DEFAULT_FILES,
            doNotIgnoreMarkdown: true,
          },
        ],
        {
          language: defaultConfigLanguage,
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
      ) // 🟢
      .addRule('heading-increment', ERROR) // 🟢
      .addRule('no-duplicate-definitions', ERROR) // 🟢
      .addRule('no-duplicate-headings', OFF)
      .addRule('no-empty-definitions', ERROR) // 🟢
      .addRule('no-empty-images', ERROR) // 🟢
      .addRule('no-empty-links', ERROR) // 🟢
      .addRule('no-html', allowHtmlTags === true ? OFF : ERROR, [
        {
          ...(Array.isArray(allowHtmlTags) &&
            allowHtmlTags.length > 0 && {
              allowed: unique(allowHtmlTags),
            }),
        },
      ])
      .addRule('no-invalid-label-refs', ERROR) // 🟢
      .addRule('no-missing-atx-heading-space', ERROR) // 🟢
      .addRule('no-missing-label-refs', ERROR) // 🟢
      .addRule('no-multiple-h1', ERROR, [{frontmatterTitle: ''}]) // 🟢
      .addRule('require-alt-text', ERROR) // 🟢
      .addRule('table-column-count', ERROR) // 🟢
      .addOverrides();

    if (Array.isArray(language)) {
      language.forEach((markdownLanguageSettings, i) => {
        configBuilder?.addConfig(
          [
            `markdown/language-override/${i}`,
            {
              doNotIgnoreMarkdown: true,
              filesFallback: markdownLanguageSettings.files,
            },
          ],
          {
            language: `markdown/${markdownLanguageSettings.language}`,
          },
        );
      });
    }
  }

  /* Processor */

  const processorAllowingLintingBothMarkdownAndCodeBlocks = mergeProcessors([
    eslintPluginMarkdown.processors.markdown,
    processorPassThrough,
  ]);

  configBuilder?.addConfig(
    [
      'markdown/setup/code-blocks-processor',
      {
        doNotIgnoreMarkdown: true,
        filesFallback: DEFAULT_FILES,
      },
    ],
    {
      ...(typeof lintCodeBlocks === 'object' && lintCodeBlocks),
      processor: processorAllowingLintingBothMarkdownAndCodeBlocks,
    },
  );

  if (lintCodeBlocks) {
    configBuilder
      ?.addConfig(
        [
          'markdown/code-blocks',
          {
            doNotIgnoreCss: true,
            doNotIgnoreHtml: true,
            doNotIgnoreMarkdown: true,
            doNotIgnoreMdx: true,
            filesFallback: DEFAULT_FILES_FOR_CODE_BLOCKS,
          },
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
      .disableBulkRules(RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS)
      .addBulkRules(optionsResolved.overridesCodeBlocks); // TODO

    if (codeBlocksIgnoredLanguages?.length) {
      configBuilder?.addConfig('markdown/code-blocks/ignore', {
        ignores: [`**/*.md/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      });
    }
  }

  const configFormatFencedCodeBlocksBuilder = createConfigBuilder(
    context,
    configFormatFencedCodeBlocks,
    'prettier',
  );

  configFormatFencedCodeBlocksBuilder
    ?.addConfig([
      'markdown/format-fenced-code-blocks',
      {
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
        includeDefaultFilesAndIgnores: true,
        filesFallback: DEFAULT_FILES_FOR_CODE_BLOCKS,
      },
    ])
    .addRule('prettier', ERROR, [{}, {eslintTakeoverMode: true}]);

  return {
    configs: [configBuilder, configFormatFencedCodeBlocksBuilder],
    optionsResolved,
  };
};
