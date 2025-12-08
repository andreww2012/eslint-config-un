// cspell:ignore blockquotes autolinks setext
import {ERROR, GLOB_MARKDOWN, OFF} from '../constants';
import {pluginsLoaders} from '../loaders';
import {getKeysOfTruthyValues} from '../utils';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

type EnforceableCasing = GetRuleOptions<'markdown-preferences', 'heading-casing'>['style'] & {};

type CasingEnforcementPlace = 'headings' | 'tableHeaders';

// Copied from https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/82e0c36a269a77719906b6a1cac454e9f4ec193d/src/rules/heading-casing.ts#L88-L99
const DEFAULT_IGNORE_PATTERNS = [
  // Version numbers (e.g., v1.2.3, 2.0.1)
  String.raw`/^v\d+/u`,

  // File extensions and names
  String.raw`/\w+\.[a-z\d]+$/u`,

  // Common technical patterns
  /* eslint-disable case-police/string-check */
  String.raw`/\w+(?:API|Api)$/u`, // webAPI, restAPI, etc.
  String.raw`/\w+(?:SDK|Sdk)$/u`, // nodeSDK, etc.
  String.raw`/\w+(?:CLI|Cli)$/u`, // nodeCLI, etc.
  /* eslint-enable case-police/string-check */
];

export interface MarkdownPreferencesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'markdown-preferences'> {
  delimitersStyle?: {
    /**
     * Choose the style of emphasized, strong, or emphasized strong text. Possible values:
     * - `'*'`: use `*text*` for emphasized text and `**text**` for strong text (default);
     * - `'_'`: same as above, but use `_` instead of `*`;
     * - `object`: directly configure the rule's options;
     * - `false`: style not enforced.
     *
     * Note: style for emphasized strong text is automatically determined
     * from the emphasis and strong styles. See rules documentation for more info.
     *
     * Affected rule:
     * - [`emphasis-delimiters-style`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emphasis-delimiters-style.html)
     * @default '*'
     */
    emphasis?:
      | false
      | '*'
      | '_'
      | GetRuleOptions<'markdown-preferences', 'emphasis-delimiters-style'>;

    /**
     * Choose the style of emphasized for strikethrough. Set `false` to not enforce.
     *
     * Affected rule:
     * - [`strikethrough-delimiters-style`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/strikethrough-delimiters-style.html)
     * @default '~~'
     */
    strikethrough?:
      | false
      | GetRuleOptions<'markdown-preferences', 'strikethrough-delimiters-style'>['delimiter'];
  };

  /**
   * Enforces casing of heading and table headers.
   * - If casing is specified, it will be enforced.
   * - If `false` is specified, casing will not be enforced.
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
    | false
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
   * Word regular expression patterns that should be ignored during casing checks
   * in headings and table headers when capitalization is enforced.
   *
   * Will be merged with the plugin's [default patterns list](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/82e0c36a269a77719906b6a1cac454e9f4ec193d/src/rules/heading-casing.ts#L88-L99).
   *
   * You can use the array or the object syntax. The difference is that the object syntax allows to exclude some words from the default list by setting the value to `false`.
   *
   * Affected rules:
   * - [`heading-casing`](https://``ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html)
   * - [`table-header-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html)
   */
  casingEnforcementIgnorePatterns?: ArrayOrBooleanRecord<`/${string}/${string}`>;

  /**
   * Preserve the casing of the following words in headings and table headers
   * when capitalization is enforced.
   *
   * Will be merged with the plugin's [default words list](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/HEAD/src/resources/preserve-words.ts).
   *
   * You can use the array or the object syntax. The difference is that the object syntax allows to exclude some words from the default list by setting the value to `false`.
   *
   * Affected rules:
   * - [`heading-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html)
   * - [`table-header-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html)
   */
  wordsToPreserveCasingOf?: ArrayOrBooleanRecord;
}

export default (async (context, optionsRaw) => {
  const markdownPreferencesPlugin = await pluginsLoaders['markdown-preferences'](context).then(
    ({module}) => module,
  );

  const optionsResolved = assignDefaults(optionsRaw, {
    extendedMarkdownSyntax: true,
  } satisfies MarkdownPreferencesEslintConfigOptions);

  const {
    delimitersStyle,
    enforceCasing = 'Sentence case',
    extendedMarkdownSyntax,
    casingEnforcementIgnorePatterns,
    wordsToPreserveCasingOf,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'markdown-preferences');

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

  const defaultIgnorePatterns = getKeysOfTruthyValues<Record<string, boolean>>({
    ...Object.fromEntries(DEFAULT_IGNORE_PATTERNS.map((defaultWord) => [defaultWord, true])),
    ...(!Array.isArray(casingEnforcementIgnorePatterns) && casingEnforcementIgnorePatterns),
  });
  if (Array.isArray(casingEnforcementIgnorePatterns)) {
    defaultIgnorePatterns.push(...casingEnforcementIgnorePatterns);
  }

  const getEnforcedCasing = (
    place: CasingEnforcementPlace,
  ): EnforceableCasing | null | undefined =>
    typeof enforceCasing === 'string' ? enforceCasing : enforceCasing ? enforceCasing[place] : null;
  const enforcedCasingForHeadings = getEnforcedCasing('headings');
  const enforcedCasingForTableHeaders = getEnforcedCasing('tableHeaders');

  const emphasisStyle = delimitersStyle?.emphasis ?? '*';
  const strikethroughStyle = delimitersStyle?.strikethrough ?? '~~';

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
    .markCategory('Preference')
    .addRule('canonical-code-block-language', ERROR) /** @since 0.9.0 */
    .addRule('emoji-notation', OFF) /** @since 0.13.0 */ // ⚠️
    .addRule('heading-casing', enforcedCasingForHeadings == null ? OFF : ERROR, [
      {
        preserveWords: defaultPreserveWords,
        ignorePatterns: defaultIgnorePatterns,
        ...(enforcedCasingForHeadings != null && {
          style: enforcedCasingForHeadings /* Default: 'Title Case' */,
        }),
      },
    ]) /** @since 0.9.0 */
    .addRule('no-heading-trailing-punctuation', ERROR) /** @since 0.38.0 */
    .addRule('ordered-list-marker-start', ERROR) /** @since 0.12.0 */ // 💅
    .addRule('prefer-inline-code-words', OFF) /** @since 0.4.0 */
    .addRule('prefer-linked-words', OFF) /** @since 0.1.0 */
    .addRule('table-header-casing', enforcedCasingForTableHeaders == null ? OFF : ERROR, [
      {
        preserveWords: defaultPreserveWords,
        ignorePatterns: defaultIgnorePatterns,
        ...(enforcedCasingForTableHeaders != null && {
          style: enforcedCasingForTableHeaders /* Default: 'Title Case' */,
        }),
      },
    ]) /** @since 0.14.0 */
    .markCategory('Notation')
    .addRule('bullet-list-marker-style', ERROR) /** @since 0.18.0 */ // 💅
    .addRule('code-fence-style', ERROR) /** @since 0.20.0 */ // 💅
    .addRule('definitions-last', ERROR) /** @since 0.7.0 */
    .addRule(
      'emphasis-delimiters-style',
      emphasisStyle === false ? OFF : ERROR,
      emphasisStyle === false
        ? []
        : typeof emphasisStyle === 'string'
          ? [{emphasis: emphasisStyle, strong: emphasisStyle === '*' ? '**' : '__'}]
          : [emphasisStyle],
    ) /** @since 0.19.0 */ // 💅
    .addRule('hard-linebreak-style', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('level1-heading-style', ERROR) /** @since 0.18.0 */ // 💅
    .addRule('level2-heading-style', ERROR) /** @since 0.18.0 */ // 💅
    .addRule('link-destination-style', ERROR) /** @since 0.22.0 */ // 💅
    .addRule('link-title-style', ERROR, [
      {style: 'single' /* Default: 'double' */},
    ]) /** @since 0.22.0 */ // 💅
    .addRule('no-implicit-block-closing', ERROR) /** @since 0.28.0 */ // 🟢⚠️
    .addRule('no-text-backslash-linebreak', ERROR) /** @since 0.2.0 */ // 🟢
    .addRule('ordered-list-marker-style', ERROR) /** @since 0.18.0 */ // 💅
    .addRule('prefer-autolinks', ERROR) /** @since 0.11.0 */ // 🟢
    .addRule('prefer-fenced-code-blocks', ERROR) /** @since 0.11.0 */ // 🟢
    .addRule('prefer-link-reference-definitions', ERROR, [
      {minLinks: 3 /* Default: 2 */},
    ]) /** @since 0.6.0 */
    .addRule(
      'strikethrough-delimiters-style',
      strikethroughStyle === false ? OFF : ERROR,
      strikethroughStyle === false ? [] : [{delimiter: strikethroughStyle}],
    ) /** @since 0.19.0 */ // 💅
    .addRule('thematic-break-character-style', ERROR) /** @since 0.17.0 */ // 💅
    .markCategory('Whitespace')
    .addRule('blockquote-marker-alignment', ERROR) /** @since 0.15.0 */ // 🟢
    .addRule('code-fence-spacing', ERROR) /** @since 0.30.0 */ // 💅
    .addRule('custom-container-marker-spacing', ERROR) /** @since 0.30.0 */ // 💅⚠️
    .addRule('indent', ERROR) /** @since 0.24.0 */ // 💅
    .addRule('link-bracket-newline', ERROR) /** @since 0.22.0 */ // 💅
    .addRule('link-bracket-spacing', ERROR) /** @since 0.22.0 */ // 💅
    .addRule('link-paren-newline', ERROR) /** @since 0.23.0 */ // 💅
    .addRule('link-paren-spacing', ERROR) /** @since 0.23.0 */ // 💅
    .addRule('list-marker-alignment', ERROR) /** @since 0.15.0 */ // 🟢
    .addRule('no-multi-spaces', ERROR) /** @since 0.21.0 */ // 💅
    .addRule('no-multiple-empty-lines', ERROR) /** @since 0.10.0 */ // 💅
    .addRule('no-tabs', ERROR, [
      {
        ignoreCodeBlocks: ['*'], // Default: `[]`
        codeBlockTabWidth: 2, // Default: 4
      },
    ]) /** @since 0.37.0 */ // 💅
    .addRule('no-trailing-spaces', ERROR) /** @since 0.3.0 */ // 💅
    .addRule('padded-custom-containers', ERROR) /** @since 0.29.0 */ // 💅⚠️
    .addRule('padding-line-between-blocks', ERROR) /** @since 0.16.0 */ // 💅⚠️
    .addRule('table-pipe-spacing', ERROR) /** @since 0.25.0 */ // 💅
    .markCategory('Decorative')
    .addRule('atx-heading-closing-sequence', ERROR) /** @since 0.13.0 */ // 💅
    .addRule('atx-heading-closing-sequence-length', ERROR) /** @since 0.13.0 */ // 💅
    .addRule('code-fence-length', ERROR) /** @since 0.20.0 */ // 💅
    .addRule('no-laziness-blockquotes', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('ordered-list-marker-sequence', ERROR) /** @since 0.12.0 */ // 💅
    .addRule('setext-heading-underline-length', ERROR) /** @since 0.17.0 */ // 💅
    .addRule('sort-definitions', OFF) /** @since 0.8.0 */ // 💅
    .addRule('table-leading-trailing-pipes', ERROR) /** @since 0.25.0 */ // 💅
    .addRule('table-pipe-alignment', ERROR) /** @since 0.25.0 */ // 💅
    .addRule('thematic-break-length', ERROR) /** @since 0.17.0 */ // 💅
    .addRule('thematic-break-sequence-pattern', ERROR) /** @since 0.17.0 */ // 💅
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'markdownPreferences'>;
