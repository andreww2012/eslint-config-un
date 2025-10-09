// cspell:ignore blockquotes autolinks setext
import {ERROR, GLOB_MARKDOWN, OFF} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {assignDefaults, getKeysOfTruthyValues} from '../utils';
import type {UnConfigFn} from './index';

type EnforceableCasing = GetRuleOptions<'markdown-preferences', 'heading-casing'>[0]['style'] & {};

type CasingEnforcementPlace = 'headings' | 'tableHeaders';

export interface MarkdownPreferencesEslintConfigOptions
  extends UnConfigOptions<'markdown-preferences'> {
  /**
   * Enforces casing of heading and table headers.
   * - If casing is specified, it will be enforced.
   * - If `null` is specified, casing will not be enforced.
   * - If a literal value is used, it will apply to both headings and table headers.
   * - When an object syntax is used and some preferences are not specified, they will be set to the default value.
   *
   * Affected rules:
   * - [`heading-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html)
   * - [`table-header-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html)
   * @default 'Sentence case';
   */
  enforceCasing?:
    | EnforceableCasing
    | null
    | Partial<Record<CasingEnforcementPlace, EnforceableCasing>>;

  /**
   * Enable experimental support of some extended Markdown syntax:
   * - [Custom Containers](https://vitepress.dev/guide/markdown#custom-containers)
   * - [Mathematical Expressions](https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)
   * - [Import Code Snippets](https://vitepress.dev/guide/markdown#import-code-snippets)
   *
   * Technically, when enabled, sets `language: 'markdown-preferences/extended-syntax'` in the resulting flat config.
   *
   * This option is required for some rules, such as [`custom-container-marker-spacing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/custom-container-marker-spacing.html), to work, and for some rules, such as [`no-implicit-block-closing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-implicit-block-closing.html), to handle this custom syntax.
   *
   * Affected rules:
   * - [`emoji-notation`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emoji-notation.html)
   * - [`no-implicit-block-closing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-implicit-block-closing.html)
   * - [`custom-container-marker-spacing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/custom-container-marker-spacing.html)
   * - [`padded-custom-containers`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/padded-custom-containers.html)
   * - [`padding-line-between-blocks`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/padding-line-between-blocks.html)
   * @default true
   */
  extendedMarkdownSyntax?: boolean;

  /**
   * Preserve the casing of the following words in headings and table headers which capitalization is enforced.
   *
   * Will be merged with the plugin's [default words list](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/resources/preserve-words.ts).
   *
   * You can use the array or the object syntax. The difference is that the object syntax allows to exclude some words from the default list by setting the value to `false`.
   *
   * Affected rules:
   * - [`heading-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html)
   * - [`table-header-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html)
   */
  wordsToPreserveCasingOf?: string[] | Record<string, boolean>;
}

export const markdownPreferencesUnConfig: UnConfigFn<'markdownPreferences'> = async (context) => {
  const markdownPreferencesPlugin = await pluginsLoaders['markdown-preferences'](context).then(
    ({module}) => module,
  );

  const optionsRaw = context.rootOptions.configs?.markdownPreferences;
  const optionsResolved = assignDefaults(optionsRaw, {
    extendedMarkdownSyntax: true,
  } satisfies MarkdownPreferencesEslintConfigOptions);

  const {
    enforceCasing = 'Sentence case',
    extendedMarkdownSyntax,
    wordsToPreserveCasingOf,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'markdown-preferences');

  const defaultPreserveWords = getKeysOfTruthyValues({
    ...Object.fromEntries(
      markdownPreferencesPlugin.resources.defaultPreserveWords.map((defaultWord) => [
        defaultWord,
        true,
      ]),
    ),
    ...(!Array.isArray(wordsToPreserveCasingOf) && wordsToPreserveCasingOf),
  });
  if (Array.isArray(wordsToPreserveCasingOf)) {
    defaultPreserveWords.push(...wordsToPreserveCasingOf);
  }

  const getEnforcedCasing = (
    place: CasingEnforcementPlace,
  ): EnforceableCasing | null | undefined =>
    typeof enforceCasing === 'string'
      ? enforceCasing
      : enforceCasing === null
        ? null
        : enforceCasing[place];
  const enforcedCasingForHeadings = getEnforcedCasing('headings');
  const enforcedCasingForTableHeaders = getEnforcedCasing('tableHeaders');

  // Legend:
  // 🟢 - in recommended AND standard
  // 💅 - in standard
  // ⚠️ - supports (or only works with) non-standard syntax

  configBuilder
    ?.addConfig(
      [
        'markdown-preferences',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_MARKDOWN],
          doNotIgnoreMarkdown: true,
        },
      ],
      {
        ...(extendedMarkdownSyntax && {
          language: 'markdown-preferences/extended-syntax',
        }),
      },
    )
    /* Category: Preference */
    .addRule('canonical-code-block-language', ERROR) // >=0.9.0
    .addRule('emoji-notation', OFF) // ⚠️ >=0.13.0
    .addRule('heading-casing', enforcedCasingForHeadings == null ? OFF : ERROR, [
      {
        preserveWords: defaultPreserveWords,
        ...(enforcedCasingForHeadings != null && {
          style: enforcedCasingForHeadings /* Default: 'Title Case' */,
        }),
      },
    ]) // >=0.9.0
    .addRule('ordered-list-marker-start', ERROR) // 💅 >=0.12.0
    .addRule('prefer-inline-code-words', OFF) // >=0.4.0
    .addRule('prefer-linked-words', OFF) // >=0.1.0
    .addRule('table-header-casing', enforcedCasingForTableHeaders == null ? OFF : ERROR, [
      {
        preserveWords: defaultPreserveWords,
        ...(enforcedCasingForTableHeaders != null && {
          style: enforcedCasingForTableHeaders /* Default: 'Title Case' */,
        }),
      },
    ]) // >=0.14.0
    /* Category: Notation */
    .addRule('bullet-list-marker-style', ERROR) // 💅 >=0.18.0
    .addRule('code-fence-style', ERROR) // 💅 >=0.20.0
    .addRule('definitions-last', ERROR) // >=0.7.0
    .addRule('emphasis-delimiters-style', ERROR, [{emphasis: '*' /* Default: '_' */}]) // 💅 >=0.19.0
    .addRule('hard-linebreak-style', ERROR) // 🟢 >=0.1.0
    .addRule('level1-heading-style', ERROR) // 💅 >=0.18.0
    .addRule('level2-heading-style', ERROR) // 💅 >=0.18.0
    .addRule('link-destination-style', ERROR) // 💅 >=0.22.0
    .addRule('link-title-style', ERROR, [{style: 'single' /* Default: 'double' */}]) // 💅 >=0.22.0
    .addRule('no-implicit-block-closing', ERROR) // 🟢⚠️ >=0.28.0
    .addRule('no-text-backslash-linebreak', ERROR) // 🟢 >=0.2.0
    .addRule('ordered-list-marker-style', ERROR) // 💅 >=0.18.0
    .addRule('prefer-autolinks', ERROR) // 🟢 >=0.11.0
    .addRule('prefer-fenced-code-blocks', ERROR) // 🟢 >=0.11.0
    .addRule('prefer-link-reference-definitions', ERROR, [{minLinks: 3 /* Default: 2 */}]) // >=0.6.0
    .addRule('strikethrough-delimiters-style', ERROR) // 💅 >=0.19.0
    .addRule('thematic-break-character-style', ERROR) // 💅 >=0.17.0
    /* Category: Whitespace */
    .addRule('blockquote-marker-alignment', ERROR) // 🟢 >=0.15.0
    .addRule('code-fence-spacing', ERROR) // 💅 >=0.30.0
    .addRule('custom-container-marker-spacing', ERROR) // 💅⚠️ >=0.30.0
    .addRule('indent', ERROR) // 💅 >=0.24.0
    .addRule('link-bracket-newline', ERROR) // 💅 >=0.22.0
    .addRule('link-bracket-spacing', ERROR) // 💅 >=0.22.0
    .addRule('link-paren-newline', ERROR) // 💅 >=0.23.0
    .addRule('link-paren-spacing', ERROR) // 💅 >=0.23.0
    .addRule('list-marker-alignment', ERROR) // 🟢 >=0.15.0
    .addRule('no-multi-spaces', ERROR) // 💅 >=0.21.0
    .addRule('no-multiple-empty-lines', ERROR) // 💅 >=0.10.0
    .addRule('no-trailing-spaces', ERROR) // 💅 >=0.3.0
    .addRule('padded-custom-containers', ERROR) // 💅⚠️ >=0.29.0
    .addRule('padding-line-between-blocks', ERROR) // 💅⚠️ >=0.16.0
    .addRule('table-pipe-spacing', ERROR) // 💅 >=0.25.0
    /* Category: Decorative */
    .addRule('atx-heading-closing-sequence', ERROR) // 💅 >=0.13.0
    .addRule('atx-heading-closing-sequence-length', ERROR) // 💅 >=0.13.0
    .addRule('code-fence-length', ERROR) // 💅 >=0.20.0
    .addRule('no-laziness-blockquotes', ERROR) // 🟢 >=0.10.0
    .addRule('ordered-list-marker-sequence', ERROR) // 💅 >=0.12.0
    .addRule('setext-heading-underline-length', ERROR) // 💅 >=0.17.0
    .addRule('sort-definitions', OFF) // 💅 >=0.8.0
    .addRule('table-leading-trailing-pipes', ERROR) // 💅 >=0.25.0
    .addRule('table-pipe-alignment', ERROR) // 💅 >=0.25.0
    .addRule('thematic-break-length', ERROR) // 💅 >=0.17.0
    .addRule('thematic-break-sequence-pattern', ERROR) // 💅 >=0.17.0
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
