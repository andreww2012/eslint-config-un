import eslintPluginMarkdown from '@eslint/markdown';
import {mergeProcessors, processorPassThrough} from 'eslint-merge-processors';
import type {BundledLanguage as ShikiLanguageCodesList} from 'shiki';
import {ERROR, GLOB_MARKDOWN, GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS, OFF} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  FlatConfigEntryFiles,
  FlatConfigEntryFilesOrIgnores,
  RuleOverrides,
  RulesRecord,
} from '../eslint';
import {ConfigEntryBuilder} from '../eslint';
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
   * @example {files: ['**\/*.md'], ignores: ['CHANGELOG.md'], ignoreLanguages: ['yml']}
   * @default true
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
   * @example ['js', 'ts', 'vue']
   * @default all languages are allowed, including no language
   */
  codeBlocksAllowedLanguages?: [CodeBlockLanguage, ...CodeBlockLanguage[]] | 'any-lang-required';
  /**
   * Lint fenced code blocks as if its code assumed to be running in JavaScript's [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).
   *
   * Likely you don't want to change this.
   * @see https://github.com/eslint/markdown/blob/main/docs/processors/markdown.md
   * @default true
   */
  codeBlocksImpliedStrictMode?: boolean;
  overridesCodeBlocks?: RuleOverrides<string>;
}

export const markdownEslintConfig = (
  options: MarkdownEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'markdown'>(options, internalOptions);

  const {
    lintMarkdown = true,
    language = 'commonmark',
    allowHtmlTags = true,

    lintCodeBlocks = true,
    codeBlocksIgnoredLanguages,
    codeBlocksAllowedLanguages,
  } = options;

  const defaultDialect: MarkdownDialect = typeof language === 'string' ? language : 'commonmark';
  const defaultConfigLanguage = `markdown/${defaultDialect}` as const;

  const recommendedConfigs = arraify(eslintPluginMarkdown.configs?.recommended);
  const processorConfigs = arraify(eslintPluginMarkdown.configs?.processor) as FlatConfigEntry[];

  const allowedFencedCodeBlocksLanguages =
    Array.isArray(codeBlocksAllowedLanguages) &&
    codeBlocksAllowedLanguages.length > 0 &&
    codeBlocksAllowedLanguages;

  // Legend:
  // 🟣 - in recommended

  builder.addConfig(['markdown/setup', {doNotIgnoreMarkdown: true}], {
    plugins: {
      markdown: eslintPluginMarkdown,
    },
  });

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
        },
      )
      .addBulkRules(
        recommendedConfigs.reduce<RulesRecord>(
          (result, config) => Object.assign(result, config.rules),
          {},
        ),
      )
      .addRule(
        'markdown/fenced-code-language',
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
      // .addRule('markdown/heading-increment', ERROR) // 🟣
      // .addRule('markdown/no-duplicate-headings', OFF)
      // .addRule('markdown/no-empty-links', ERROR) // 🟣
      .addRule('markdown/no-html', allowHtmlTags === true ? OFF : ERROR, [
        {
          ...(Array.isArray(allowHtmlTags) &&
            allowHtmlTags.length > 0 && {
              allowed: [...new Set(allowHtmlTags)],
            }),
        },
      ])
      // .addRule('markdown/no-invalid-label-refs', ERROR) // 🟣
      // .addRule('markdown/no-missing-label-refs', ERROR) // 🟣
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    eslintPluginMarkdown.processors!.markdown!,
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
      // .addAnyRule('eol-last', OFF) // 🟣
      .addAnyRule('max-classes-per-file', OFF) // [too-strict]
      .addAnyRule('no-alert', OFF) // [runtime-only]
      .addAnyRule('no-await-in-loop', OFF) // [runtime-only]
      .addAnyRule('no-console', OFF) // [runtime-only]
      .addAnyRule('no-duplicate-imports', OFF) // [imports]
      .addAnyRule('no-empty-function', OFF) // [emptiness]
      .addAnyRule('no-eval', OFF) // [eval]
      .addAnyRule('no-extend-native', OFF) // [runtime-only]
      .addAnyRule('no-implied-eval', OFF) // [eval]
      .addAnyRule('no-lone-blocks', OFF) // [emptiness]
      .addAnyRule('no-new-func', OFF) // [eval]
      .addAnyRule('no-new', OFF) // [runtime-only]
      .addAnyRule('no-unused-labels', OFF) // [unused]
      .addAnyRule('no-unused-private-class-members', OFF) // [unused]
      .addAnyRule('no-useless-assignment', OFF) // [unused]
      .addAnyRule('prefer-const', OFF) // [too-strict]
      // .addAnyRule('strict', OFF) // 🟣
      // .addAnyRule("no-undef", OFF) // 🟣
      // .addAnyRule("no-unused-expressions", OFF) // 🟣
      // .addAnyRule("no-unused-vars", OFF) // 🟣
      // .addAnyRule("padded-blocks", OFF) // 🟣
      // .addAnyRule("unicode-bom", OFF) // 🟣

      // ts
      // won't disable: @typescript-eslint/consistent-type-imports, @typescript-eslint/no-useless-empty-export
      .addAnyRule('@typescript-eslint/ban-ts-comment', OFF) // [runtime-only]
      .addAnyRule('@typescript-eslint/class-methods-use-this', OFF) // [runtime-only]
      .addAnyRule('@typescript-eslint/explicit-function-return-type', OFF) // [too-strict]
      .addAnyRule('@typescript-eslint/no-empty-function', OFF) // [emptiness]
      .addAnyRule('@typescript-eslint/no-explicit-any', OFF) // [too-strict]
      .addAnyRule('@typescript-eslint/no-extraneous-class', OFF) // [too-strict]
      .addAnyRule('@typescript-eslint/no-import-type-side-effects', OFF) // [runtime-only]
      .addAnyRule('@typescript-eslint/no-namespace', OFF) // [too-strict]
      .addAnyRule('@typescript-eslint/no-non-null-assertion', OFF) // [too-strict]
      .addAnyRule('@typescript-eslint/no-require-imports', OFF) // [runtime-only]
      .addAnyRule('@typescript-eslint/no-unused-expressions', OFF) // [unused]
      .addAnyRule('@typescript-eslint/no-unused-vars', OFF) // [unused]
      .addAnyRule('@typescript-eslint/no-use-before-define', OFF) // [runtime-only]
      .addAnyRule('@typescript-eslint/no-unsafe-function-type', OFF) // [too-strict]

      // vue
      // TODO maybe disable?: vue/valid-define-emits, vue/valid-define-props, vue/no-duplicate-attr-inheritance
      // won't disable: vue/require-v-for-key, vue/no-setup-props-reactivity-loss, vue/require-macro-variable-name
      .addAnyRule('vue/block-lang', OFF) // [too-strict]
      .addAnyRule('vue/define-props-declaration', OFF) // [too-strict]
      .addAnyRule('vue/no-console', OFF) // [runtime-only]
      .addAnyRule('vue/no-undef-components', OFF) // [runtime-only]
      .addAnyRule('vue/no-unsupported-features', OFF) // [runtime-only]
      .addAnyRule('vue/no-unused-components', OFF) // [unused]
      .addAnyRule('vue/no-unused-emit-declarations', OFF) // [unused]
      .addAnyRule('vue/no-unused-properties', OFF) // [unused]
      .addAnyRule('vue/no-unused-refs', OFF) // [unused]
      .addAnyRule('vue/no-unused-vars', OFF) // [unused]
      .addAnyRule('vue/require-prop-types', OFF) // [too-strict]

      // vue a11y, pinia - ignored all rules in corresponding configs

      // import
      // won't disable: import/no-absolute-path
      .addAnyRule('import/dynamic-import-chunkname', OFF) // [imports]
      .addAnyRule('import/max-dependencies', OFF) // [imports]
      .addAnyRule('import/no-default-export', OFF) // [imports]
      .addAnyRule('import/no-duplicates', OFF) // [imports]
      .addAnyRule('import/no-extraneous-dependencies', OFF) // [imports]
      .addAnyRule('import/no-mutable-exports', OFF) // [imports]
      .addAnyRule('import/no-unresolved', OFF) // [imports]

      // node
      // TODO disable?: node/no-deprecated-api
      // won't disable: node/exports-style, import/no-webpack-loader-syntax
      .addAnyRule('node/hashbang', OFF) // [runtime-only]
      .addAnyRule('node/no-extraneous-require', OFF) // [imports]
      .addAnyRule('node/no-missing-require', OFF) // [imports]
      .addAnyRule('node/no-missing-import', OFF) // [imports]
      .addAnyRule('node/no-process-exit', OFF) // [runtime-only]
      .addAnyRule('node/no-unsupported-features/es-builtins', OFF) // [runtime-only]
      .addAnyRule('node/no-unsupported-features/es-syntax', OFF) // [runtime-only]
      .addAnyRule('node/no-unsupported-features/node-builtins', OFF) // [runtime-only]

      // unicorn
      // won't disable: unicorn/no-abusive-eslint-disable, unicorn/relative-url-style, unicorn/prefer-string-replace-all, unicorn/prefer-string-starts-ends-with, unicorn/prefer-code-point
      .addAnyRule('unicorn/no-process-exit', OFF) // [runtime-only]
      .addAnyRule('unicorn/prefer-top-level-await', OFF) // [runtime-only]
      .addAnyRule('unicorn/no-static-only-class', OFF) // [too-strict]

      // regexp
      .addAnyRule('regexp/no-unused-capturing-group', OFF) // [runtime-only]
      .addAnyRule('regexp/no-useless-flag', OFF) // [runtime-only]
      .addAnyRule('regexp/no-super-linear-backtracking', OFF) // [runtime-only]
      .addAnyRule('regexp/optimal-quantifier-concatenation', OFF) // [runtime-only]

      // misc
      // won't disable: yml/file-extension, sonarjs/no-identical-functions, @eslint-community/eslint-comments/no-unlimited-disable
      .addAnyRule('unused-imports/no-unused-imports', OFF) // [too-strict]
      .addBulkRules(options.overridesCodeBlocks);

    if (codeBlocksIgnoredLanguages?.length) {
      builder.addConfig('markdown/code-blocks/ignore', {
        ignores: [`**/*.md/**/*.{${codeBlocksIgnoredLanguages.join(',')}}`],
      });
    }
  }

  return builder.getAllConfigs();
};
