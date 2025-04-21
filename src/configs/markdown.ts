import eslintPluginMarkdown from '@eslint/markdown';
import type {MarkdownLanguageOptions} from '@eslint/markdown/types';
import {mergeProcessors, processorPassThrough} from 'eslint-merge-processors';
import type {BundledLanguage as ShikiLanguageCodesList} from 'shiki';
import {ERROR, GLOB_MARKDOWN, GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS, OFF} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type FlatConfigEntryFiles,
  type FlatConfigEntryFilesOrIgnores,
  type RuleOverrides,
  type RulesRecord,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import {arraify} from '../utils';
import type {InternalConfigOptions} from './index';

type MarkdownDialect = 'commonmark' | 'gfm';

type CodeBlockLanguage = ShikiLanguageCodesList | (string & {});

const DEFAULT_FILES = [GLOB_MARKDOWN];
const DEFAULT_FILES_FOR_CODE_BLOCKS = [GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS];

export interface MarkdownEslintConfigOptions extends ConfigSharedOptions<'markdown'> {
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
   * Since some language codes [get remapped](https://github.com/eslint/markdown/blob/e7e6f58f6a0181a0b6e61197d65ddd12ab32b443/src/processor.js#L244) (`javascript` -> `js`), so specifying `javascript` instead of `js` won't have any effect.
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
   * @see https://github.com/eslint/markdown/blob/main/docs/processors/markdown.md
   */
  codeBlocksImpliedStrictMode?: boolean;

  overridesCodeBlocks?: RuleOverrides<string>;

  /**
   * Enables Front Matter parsing in both `commonmark` and `gfm` dialects.
   * @default 'yaml'
   */
  parseFrontmatter?: MarkdownLanguageOptions['frontmatter'];
}

export const markdownEslintConfig = (
  options: MarkdownEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder('markdown', options, internalOptions);

  const {
    lintMarkdown = true,
    language = 'commonmark',
    allowHtmlTags = true,

    lintCodeBlocks = true,
    codeBlocksIgnoredLanguages,
    codeBlocksAllowedLanguages,

    parseFrontmatter = 'yaml',
  } = options;

  const defaultDialect: MarkdownDialect = typeof language === 'string' ? language : 'commonmark';
  const defaultConfigLanguage = `markdown/${defaultDialect}` as const;

  const recommendedConfigs = arraify(eslintPluginMarkdown.configs.recommended);
  const processorConfigs = arraify(eslintPluginMarkdown.configs.processor) as FlatConfigEntry[];

  const allowedFencedCodeBlocksLanguages =
    Array.isArray(codeBlocksAllowedLanguages) &&
    codeBlocksAllowedLanguages.length > 0 &&
    codeBlocksAllowedLanguages;

  // Legend:
  // 🟣 - in recommended

  if (lintMarkdown) {
    builder
      .addConfig(
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
      .addBulkRules(
        recommendedConfigs.reduce<RulesRecord>(
          (result, config) => Object.assign(result, config.rules),
          {},
        ),
      )
      .addRule(
        'fenced-code-language',
        allowedFencedCodeBlocksLanguages || codeBlocksAllowedLanguages === 'any-lang-required'
          ? ERROR
          : OFF,
        [
          {
            ...(allowedFencedCodeBlocksLanguages && {
              required: [...new Set(codeBlocksAllowedLanguages satisfies string[])],
            }),
          },
        ],
      ) // 🟣
      // .addRule('heading-increment', ERROR) // 🟣
      // .addRule('no-duplicate-headings', OFF)
      // .addRule('no-empty-links', ERROR) // 🟣
      .addRule('no-html', allowHtmlTags === true ? OFF : ERROR, [
        {
          ...(Array.isArray(allowHtmlTags) &&
            allowHtmlTags.length > 0 && {
              allowed: [...new Set(allowHtmlTags)],
            }),
        },
      ])
      // .addRule('no-invalid-label-refs', ERROR) // 🟣
      // .addRule('no-missing-label-refs', ERROR) // 🟣
      .addOverrides();

    if (Array.isArray(language)) {
      language.forEach((markdownLanguageSettings, i) => {
        builder.addConfig(
          [
            `markdown/language-override/${i}`,
            {
              doNotIgnoreMarkdown: true,
            },
          ],
          {
            files: markdownLanguageSettings.files,
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

  builder.addConfig(
    [
      'markdown/setup/code-blocks-processor',
      {
        filesFallback: DEFAULT_FILES,
        doNotIgnoreMarkdown: true,
      },
    ],
    {
      ...(typeof lintCodeBlocks === 'object' && lintCodeBlocks),
      processor: processorAllowingLintingBothMarkdownAndCodeBlocks,
    },
  );

  if (lintCodeBlocks) {
    builder
      .addConfig(
        [
          'markdown/code-blocks',
          {
            doNotIgnoreMarkdown: true,
          },
        ],
        // TODO way to ignore ````js some-property`? way to allow using `with`, which is not allowed in the strict mode?
        {
          files: DEFAULT_FILES_FOR_CODE_BLOCKS,
          languageOptions: {
            parserOptions: {
              ecmaFeatures: {
                impliedStrict: options.codeBlocksImpliedStrictMode ?? true,
              },
            },
          },
        },
      )
      .addBulkRules(
        // https://github.com/eslint/markdown/blob/e7e6f58f6a0181a0b6e61197d65ddd12ab32b443/src/index.js#L107
        processorConfigs.reduce<RulesRecord>(
          (result, config) => Object.assign(result, config.rules),
          {},
        ),
      )
      // 🟣 - in the default processor config
      .disableAnyRule('eol-last') // 🟣
      .disableAnyRule('max-classes-per-file') // [too-strict]
      .disableAnyRule('no-alert') // [runtime-only]
      .disableAnyRule('no-await-in-loop') // [runtime-only]
      .disableAnyRule('no-console') // [runtime-only]
      .disableAnyRule('no-duplicate-imports') // [imports]
      .disableAnyRule('no-empty-function') // [emptiness]
      .disableAnyRule('no-eval') // [eval]
      .disableAnyRule('no-extend-native') // [runtime-only]
      .disableAnyRule('no-implied-eval') // [eval]
      .disableAnyRule('no-lone-blocks') // [emptiness]
      .disableAnyRule('no-new-func') // [eval]
      .disableAnyRule('no-new') // [runtime-only]
      .disableAnyRule('no-unused-labels') // [unused]
      .disableAnyRule('no-unused-private-class-members') // [unused]
      .disableAnyRule('no-useless-assignment') // [unused]
      .disableAnyRule('prefer-const') // [too-strict]
      .disableAnyRule('strict') // 🟣
      .disableAnyRule('no-undef') // 🟣
      .disableAnyRule('no-unused-expressions') // 🟣
      .disableAnyRule('no-unused-vars') // 🟣
      .disableAnyRule('padded-blocks') // 🟣
      .disableAnyRule('unicode-bom') // 🟣

      // ts
      // won't disable: @typescript-eslint/consistent-type-imports, @typescript-eslint/no-useless-empty-export
      .disableAnyRule('@typescript-eslint/ban-ts-comment') // [runtime-only]
      .disableAnyRule('@typescript-eslint/class-methods-use-this') // [runtime-only]
      .disableAnyRule('@typescript-eslint/explicit-function-return-type') // [too-strict]
      .disableAnyRule('@typescript-eslint/no-empty-function') // [emptiness]
      .disableAnyRule('@typescript-eslint/no-explicit-any') // [too-strict]
      .disableAnyRule('@typescript-eslint/no-extraneous-class') // [too-strict]
      .disableAnyRule('@typescript-eslint/no-import-type-side-effects') // [runtime-only]
      .disableAnyRule('@typescript-eslint/no-namespace') // [too-strict]
      .disableAnyRule('@typescript-eslint/no-non-null-assertion') // [too-strict]
      .disableAnyRule('@typescript-eslint/no-require-imports') // [runtime-only]
      .disableAnyRule('@typescript-eslint/no-unused-expressions') // [unused]
      .disableAnyRule('@typescript-eslint/no-unused-vars') // [unused]
      .disableAnyRule('@typescript-eslint/no-use-before-define') // [runtime-only]
      .disableAnyRule('@typescript-eslint/no-unsafe-function-type') // [too-strict]

      // vue
      // TODO maybe disable?: vue/valid-define-emits, vue/valid-define-props, vue/no-duplicate-attr-inheritance
      // won't disable: vue/require-v-for-key, vue/no-setup-props-reactivity-loss, vue/require-macro-variable-name
      .disableAnyRule('vue/block-lang') // [too-strict]
      .disableAnyRule('vue/define-props-declaration') // [too-strict]
      .disableAnyRule('vue/no-console') // [runtime-only]
      .disableAnyRule('vue/no-undef-components') // [runtime-only]
      .disableAnyRule('vue/no-unsupported-features') // [runtime-only]
      .disableAnyRule('vue/no-unused-components') // [unused]
      .disableAnyRule('vue/no-unused-emit-declarations') // [unused]
      .disableAnyRule('vue/no-unused-properties') // [unused]
      .disableAnyRule('vue/no-unused-refs') // [unused]
      .disableAnyRule('vue/no-unused-vars') // [unused]
      .disableAnyRule('vue/require-prop-types') // [too-strict]

      // vue a11y, pinia - ignored all rules in corresponding configs

      // import
      // won't disable: import/no-absolute-path
      .disableAnyRule('import/dynamic-import-chunkname') // [imports]
      .disableAnyRule('import/max-dependencies') // [imports]
      .disableAnyRule('import/no-default-export') // [imports]
      .disableAnyRule('import/no-duplicates') // [imports]
      .disableAnyRule('import/no-extraneous-dependencies') // [imports]
      .disableAnyRule('import/no-mutable-exports') // [imports]
      .disableAnyRule('import/no-unresolved') // [imports]

      // node
      // TODO disable?: node/no-deprecated-api
      // won't disable: node/exports-style, import/no-webpack-loader-syntax
      .disableAnyRule('node/hashbang') // [runtime-only]
      .disableAnyRule('node/no-extraneous-require') // [imports]
      .disableAnyRule('node/no-missing-require') // [imports]
      .disableAnyRule('node/no-missing-import') // [imports]
      .disableAnyRule('node/no-process-exit') // [runtime-only]
      .disableAnyRule('node/no-unsupported-features/es-builtins') // [runtime-only]
      .disableAnyRule('node/no-unsupported-features/es-syntax') // [runtime-only]
      .disableAnyRule('node/no-unsupported-features/node-builtins') // [runtime-only]

      // unicorn
      // won't disable: unicorn/no-abusive-eslint-disable, unicorn/relative-url-style, unicorn/prefer-string-replace-all, unicorn/prefer-string-starts-ends-with, unicorn/prefer-code-point
      .disableAnyRule('unicorn/no-process-exit') // [runtime-only]
      .disableAnyRule('unicorn/prefer-top-level-await') // [runtime-only]
      .disableAnyRule('unicorn/no-static-only-class') // [too-strict]

      // regexp
      .disableAnyRule('regexp/no-unused-capturing-group') // [runtime-only]
      .disableAnyRule('regexp/no-useless-flag') // [runtime-only]
      .disableAnyRule('regexp/no-super-linear-backtracking') // [runtime-only]
      .disableAnyRule('regexp/optimal-quantifier-concatenation') // [runtime-only]

      // misc
      // won't disable: yml/file-extension, sonarjs/no-identical-functions, @eslint-community/eslint-comments/no-unlimited-disable
      .disableAnyRule('unused-imports/no-unused-imports') // [too-strict]
      .addBulkRules(options.overridesCodeBlocks);

    if (codeBlocksIgnoredLanguages?.length) {
      builder.addConfig('markdown/code-blocks/ignore', {
        ignores: [`**/*.md/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      });
    }
  }

  return builder.getAllConfigs();
};
