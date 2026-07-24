import {ERROR, GLOB_TS_X, OFF, WARNING} from '../constants';
import {getKeysOfTruthyValues} from '../utils';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type NormalizeSeeLinksRuleOptions = GetRuleOptions<'jsdoc', 'normalize-see-links'>;

interface EslintPluginJsdocSettings {
  /**
   * Disables all rules for the comment block on which a `@private` tag
   * (or `@access private`) occurs.
   * @default false
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#allow-tags-private-or-internal-to-disable-rules-for-that-comment-block
   */
  ignorePrivate?: boolean;

  /**
   * Disables all rules for the comment block on which a `@internal` tag occurs.
   * @default false
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#allow-tags-private-or-internal-to-disable-rules-for-that-comment-block
   */
  ignoreInternal?: boolean;

  /**
   * Indicates how many line breaks (if any) will be checked to find a jsdoc comment block
   * before the given code block.
   * @default 0
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#maxlines-and-minlines
   */
  minLines?: number;

  /**
   * Indicates how many line breaks (if any) will be checked to find a jsdoc comment block
   * before the given code block.
   * @default 1
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#maxlines-and-minlines
   */
  maxLines?: number;

  /**
   * Impacts the behavior of certain rules.
   * @default 'typescript'
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#mode
   */
  mode?: 'typescript' | 'clojure' | 'jsdoc';

  /**
   * Preferred alias name for a JSDoc tag. The format of the configuration is:
   * `<primary tag name>`: `<preferred alias name>`
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#alias-preference
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#default-preferred-aliases for the default list of aliases
   */
  tagNamePreference?: Record<string, string | {message: string; replacement?: string} | false>;

  /**
   * Allows the omission of the tags corresponding to `require-*` rules if `@ignore` is present.
   * @default true
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#overrideaugmentsextendsimplementsignore-without-accompanying-paramdescriptionexamplereturnsthrowsyields
   */
  ignoreReplacesDocs?: boolean;

  /**
   * Allows the omission of the tags corresponding to `require-*` rules if `@override` is present.
   * @default true
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#overrideaugmentsextendsimplementsignore-without-accompanying-paramdescriptionexamplereturnsthrowsyields
   */
  overrideReplacesDocs?: boolean;

  /**
   * Allows the omission of the tags corresponding to `require-*` rules if `@augments`
   * or its alias `@extends` is present.
   * @default false
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#overrideaugmentsextendsimplementsignore-without-accompanying-paramdescriptionexamplereturnsthrowsyields
   */
  augmentsExtendsReplacesDocs?: boolean;

  /**
   * Allows the omission of the tags corresponding to `require-*` rules if `@implements` is present.
   * @default false
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#overrideaugmentsextendsimplementsignore-without-accompanying-paramdescriptionexamplereturnsthrowsyields
   */
  implementsReplacesDocs?: boolean;

  /**
   * Configures [`jsdoc/check-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/check-types.md)
   * and [`jsdoc/no-undefined-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-undefined-types.md) rules.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#settings-to-configure-check-types-and-no-undefined-types
   */
  preferredTypes?: Partial<
    Record<
      '*' | '[]' | '.<>' | '.' | '<>' | (string & {}),
      | false
      | string
      | {
          /**
           * Provides a specific error message when encountering the discouraged type
           */
          message: string;

          /**
           * Use string to specify the type to be preferred in its place (and which fix mode
           * can replace). Use `false` for forbidding the type
           */
          replacement?: string | false;

          /**
           * Allow for this type in the context of a root (i.e., a parent object of some child type)
           */
          skipRootChecking?: boolean;
        }
    >
  >;

  /**
   * Set to `true` to allow JSDoc blocks to be found across invocations such
   * as call expressions and `new` expressions. Used by
   * [`jsdoc/require-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-jsdoc.md).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/.README/settings.md#skipinvokedexpressionsforcommentfinding
   */
  skipInvokedExpressionsForCommentFinding?: boolean;

  /**
   * An object indicating tags whose types and names/namepaths (whether defining or referencing
   * namepaths) will be checked, subject to configuration.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#structuredtags
   */
  structuredTags?: Record<
    string,
    {
      /**
       * @default 'text'
       */
      name?:
        | 'text'
        | 'namepath-defining'
        | 'namepath-referencing'
        | 'namepath-or-url-referencing'
        | false;

      /**
       * @default true
       */
      type?: boolean | string[];

      /**
       * @default []
       */
      required?: ('name' | 'type' | 'typeOrNameRequired')[];
    }
  >;

  /**
   * Can be used as the default for any rules with a `contexts` property option
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#contexts
   */
  contexts?: (
    | string
    | {
        disallowName?: string;
        allowName?: string;
        context?: string;
        comment?: string;
        tags?: string[];
        replacement?: string;
        minimum?: number;
        message?: string;
        forceRequireReturn?: boolean;
      }
  )[];

  /**
   * Configures [`jsdoc/require-param-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-param-type.md)
   * and [`jsdoc/require-param-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-param-description.md) rules.
   */
  // Note: undocumented on the settings readme, only on rule-specific docs:
  // https://github.com/gajus/eslint-plugin-jsdoc/blob/d2c60403bb55a14eadbf49fc9937caad14a29cde/docs/rules/require-param-type.md?plain=1#L17
  exemptDestructuredRootsFromChecks?: boolean;
}

export interface JsdocEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'jsdoc'> {
  /**
   * [`eslint-plugin-jsdoc`](https://npmx.dev/eslint-plugin-jsdoc) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `jsdoc` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: EslintPluginJsdocSettings;

  /**
   * Explicitly specify or ignore files written in TypeScript. Will be used to disable certain rules like [`jsdoc/no-undefined-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-undefined-types.md) or [`jsdoc/require-param-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-param-type.md), and enable some rules like [`jsdoc/no-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-types.md).
   *
   * Will create a separate ESLint config which by default will use `settings` from the root `jsdoc` config, if specified, and will only be applied to TypeScript files.
   * @default true <=> `ts` config is enabled
   */
  configTypescript?:
    | boolean
    | (UnFlatConfigEntryBase<ExtraPlugins, 'jsdoc'> & Pick<JsdocEslintConfigOptions, 'settings'>);

  /**
   * Recognize the specified tags as valid JSDoc tags.
   *
   * Affected rule:
   * - [`jsdoc/check-tag-names`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/check-tag-names.md)
   */
  customTags?: ArrayOrBooleanRecord;

  /**
   * Will be merged with the default list. When object notation is used, a default entry
   * can be disabled by setting it to `false` (e.g. `{'ts-nocheck': false}`); when array
   * notation is used, all elements are added to the default list.
   *
   * Affected rule:
   * - [`jsdoc/no-bad-blocks`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-bad-blocks.md)
   * @default {'ts-check': true, 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, '__PURE__': true, '__NO_SIDE_EFFECTS__': true, 'vite-ignore': true}
   */
  extraMultilineCommentsStartingWithToIgnore?: ArrayOrBooleanRecord;

  /**
   * Affected rule:
   * - [`jsdoc/type-formatting`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/type-formatting.md)
   * @default true
   */
  formatTypeValues?: boolean;

  /**
   * Rewrites labeled links inside `@see` tags to a single canonical `@link` form,
   * so different styles don't get mixed within a codebase.
   * Only two forms [officially supported by plain JSDoc](https://jsdoc.app/tags-inline-link)
   * are supported:
   *
   * - The "prefix" one, where the label goes first, in square brackets:
   *   <code>[label]&#123;@link url}</code>.
   * - The "pipe" one, where the label goes last, after a pipe:
   *   <code>&#123;@link url|label}</code>.
   *
   * Note that neither of them is a Markdown link (`[label](url)`), and the rule provides
   * no way to enforce that form.
   *
   * Accepted values:
   * - A string (`'prefix'` or `'pipe'`) is a shortcut for picking the canonical form.
   * - A boolean enables or disables the rule with its default options, i.e. the pipe form.
   * - An object is passed to the rule as its options as-is.
   *
   * Affected rule:
   * - [`jsdoc/normalize-see-links`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/normalize-see-links.md)
   * @default false
   */
  normalizeSeeLinks?:
    boolean | NormalizeSeeLinksRuleOptions['canonicalForm'] | NormalizeSeeLinksRuleOptions;
}

const DEFAULT_MULTILINE_COMMENTS_STARTING_WITH_TO_IGNORE = {
  // TypeScript directives
  'ts-check': true,
  'ts-expect-error': true,
  'ts-ignore': true,
  'ts-nocheck': true,
  // https://github.com/javascript-compiler-hints/compiler-notations-spec
  __PURE__: true,
  __NO_SIDE_EFFECTS__: true,
  'vite-ignore': true,
} satisfies Partial<Record<string, boolean>>;

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configTypescript: context.configsMeta.ts.enabled,
    formatTypeValues: true,
    normalizeSeeLinks: false,
  });

  const {
    settings: pluginSettings,
    configTypescript,
    customTags,
    extraMultilineCommentsStartingWithToIgnore,
    formatTypeValues,
    normalizeSeeLinks,
  } = optionsResolved;

  const customTagsList = getKeysOfTruthyValues(customTags);

  const multilineCommentsStartingWithToIgnore = getKeysOfTruthyValues({
    ...DEFAULT_MULTILINE_COMMENTS_STARTING_WITH_TO_IGNORE,
    ...(Array.isArray(extraMultilineCommentsStartingWithToIgnore)
      ? Object.fromEntries(extraMultilineCommentsStartingWithToIgnore.map((name) => [name, true]))
      : extraMultilineCommentsStartingWithToIgnore),
  });

  const configBuilder = context.createConfigBuilder(optionsResolved, 'jsdoc');

  // Legend:
  // 🟢 - in recommended
  // 🔵 - in recommended-typescript
  // 1️⃣ - in Contents
  // 2️⃣ - in Logical
  // 3️⃣ - in Requirements
  // 4️⃣ - in Stylistic

  configBuilder
    ?.addConfig([
      'jsdoc',
      {
        includeDefaultFilesAndIgnores: true,
        // TODO why?
        ignoresInternal: {
          html: false,
        },
        settings: {
          // @ts-expect-error TS is crazy - if an interface is inlined, it won't error
          jsdoc: pluginSettings,
        },
      },
    ])
    .addRule('check-access', ERROR) /** @since 18.0.0 */ // 🟢2️⃣
    .addRule('check-alignment', ERROR) /** @since 4.8.0 */ // 🟢4️⃣
    .addRule('check-indentation', ERROR, [
      {allowIndentedSections: true /** @since 61.3.0 */},
    ]) /** @since 4.8.0 */
    .addRule('check-line-alignment', ERROR) /** @since 30.5.1 */ // 4️⃣
    .addRule('check-param-names', ERROR) /** @since 0.0.1 */ // 🟢2️⃣
    .addRule('check-property-names', ERROR) /** @since 30.5.1 */ // 🟢2️⃣
    .addRule('check-syntax', ERROR) /** @since 4.8.0 */ // 2️⃣
    .addRule(
      'check-tag-names',
      ERROR,
      customTagsList.length > 0 ? [{definedTags: customTagsList}] : [],
    ) /** @since 2.0.1 */ // 🟢2️⃣
    .addRule('check-template-names', ERROR) /** @since 48.8.0 */ // 2️⃣
    .addRule('check-types', ERROR) /** @since 1.1.0 */ // 🟢2️⃣
    .addRule('check-values', ERROR) /** @since 18.0.0 */ // 🟢2️⃣
    .addRule('convert-to-jsdoc-comments', OFF) /** @since 48.6.0 */ // Experimental rule
    .addRule('empty-tags', ERROR) /** @since 18.0.0 */ // 🟢2️⃣
    .addRule('escape-inline-tags', ERROR) /** @since 60.6.0 */ // 🔵2️⃣
    .addRule('implements-on-classes', ERROR) /** @since 7.0.0 */ // 🟢2️⃣
    .addRule('imports-as-dependencies', OFF) /** @since 46.2.0 */
    .addRule('informative-docs', OFF) /** @since 41.1.0 */ // 1️⃣
    .addRule('lines-before-block', ERROR) /** @since 49.0.0 */ // 4️⃣
    .addRule('match-description', OFF) /** @since 7.0.0 */ // 1️⃣
    .addRule('match-name', OFF) /** @since 35.3.0 */
    .addRule('multiline-blocks', ERROR) /** @since 34.5.0 */ // 🟢4️⃣
    .addRule(
      'no-bad-blocks',
      ERROR,
      multilineCommentsStartingWithToIgnore.length > 0
        ? [{ignore: multilineCommentsStartingWithToIgnore}]
        : [],
    ) /** @since 20.3.0 */ // 2️⃣
    .addRule('no-blank-block-descriptions', ERROR) /** @since 40.3.0 */ // 1️⃣
    .addRule('no-blank-blocks', ERROR) /** @since 43.1.0 */ // 1️⃣
    .addRule('no-defaults', ERROR) /** @since 20.2.0 */ // TODO why is this recommended? 🟢2️⃣
    .addRule('no-missing-syntax', OFF) /** @since 33.1.0 */
    .addRule('no-multi-asterisks', ERROR, [{allowWhitespace: true}]) /** @since 34.6.0 */ // 🟢4️⃣
    .addRule('no-restricted-syntax', OFF) /** @since 33.1.0 */
    .addRule('no-types', OFF) /** @since 7.0.0 */ // 2️⃣
    .addRule('no-undefined-types', ERROR) /** @since 3.6.0 */ // 🟢2️⃣
    .addRule('normalize-see-links', normalizeSeeLinks === false ? OFF : ERROR, [
      typeof normalizeSeeLinks === 'object'
        ? normalizeSeeLinks
        : {canonicalForm: typeof normalizeSeeLinks === 'string' ? normalizeSeeLinks : 'pipe'},
    ]) /** @since 63.1.0 */
    .addRule('prefer-import-tag', OFF) /** @since 60.2.0 */
    .addRule('reject-any-type', OFF) /** @since 58.0.0 */ // 🟢
    .addRule('reject-function-type', OFF) /** @since 58.0.0 */ // 🟢
    .addRule('require-asterisk-prefix', ERROR) /** @since 33.2.0 */ // 4️⃣
    .addRule('require-description', OFF) /** @since 3.9.0 */
    .addRule('require-description-complete-sentence', OFF) /** @since 0.0.1 */
    .addRule('require-example', OFF) /** @since 3.1.0 */ // 3️⃣
    .addRule('require-file-overview', OFF) /** @since 18.7.0 */
    .addRule('require-hyphen-before-param-description', OFF) /** @since 2.3.0 */ // 4️⃣
    .addRule('require-jsdoc', OFF) /** @since 4.8.4 */ // 🟢3️⃣
    .addRule('require-next-description', OFF) /** @since 59.0.0 */
    .addRule('require-next-type', WARNING) /** @since 57.0.0 */ // 🟢3️⃣
    .addRule('require-param', ERROR, [{ignoreWhenAllParamsMissing: true}]) /** @since 1.1.0 */ // 🟢3️⃣
    .addRule('require-param-description', WARNING) /** @since 0.0.1 */ // 🟢3️⃣ (error by default)
    .addRule('require-param-name', ERROR) /** @since 3.2.0 */ // 🟢3️⃣
    .addRule('require-param-type', ERROR) /** @since 2.0.1 */ // 🟢
    .addRule('require-property', ERROR) /** @since 19.0.0 */ // 🟢3️⃣
    .addRule('require-property-description', WARNING) /** @since 19.0.0 */ // 🟢3️⃣ (error by default)
    .addRule('require-property-name', ERROR) /** @since 19.0.0 */ // 🟢3️⃣
    .addRule('require-property-type', ERROR) /** @since 19.0.0 */ // 🟢
    .addRule('require-rejects', OFF) /** @since 61.4.0 */
    .addRule('require-returns', OFF) /** @since 3.15.0 */ // 🟢3️⃣
    .addRule('require-returns-check', ERROR) /** @since 4.0.0 */ // 🟢2️⃣
    .addRule('require-returns-description', WARNING) /** @since 1.1.0 */ // 🟢3️⃣ (error by default)
    .addRule('require-returns-type', ERROR) /** @since 2.0.1 */ // 🟢
    .addRule('require-tags', OFF) /** @since 59.1.0 */ // Renamed to the actual name in 60.0.0
    .addRule('require-template', OFF) /** @since 48.7.0 */
    .addRule('require-template-description', OFF) /** @since 60.5.0 */
    .addRule('require-throws', OFF) /** @since 27.1.0 */
    .addRule('require-throws-description', OFF) /** @since 59.0.0 */
    .addRule('require-throws-type', WARNING) /** @since 57.0.0 */ // 🟢3️⃣
    .addRule('require-yields', ERROR) /** @since 31.1.0 */ // 🟢3️⃣
    .addRule('require-yields-check', ERROR) /** @since 31.2.0 */ // 🟢2️⃣
    .addRule('require-yields-description', OFF) /** @since 59.0.0 */
    .addRule('require-yields-type', WARNING) /** @since 57.0.0 */ // 🟢3️⃣
    .addRule('sort-tags', ERROR) /** @since 37.8.0 */
    .addRule('tag-lines', ERROR) /** @since 34.4.0 */ // 🟢4️⃣
    .addRule('text-escaping', OFF) /** @since 39.5.0 */ // 1️⃣
    .addRule('ts-method-signature-style', ERROR, ['property' /* Default */]) /** @since 61.1.0 */
    .addRule('ts-no-empty-object-type', ERROR) /** @since 61.1.0 */ // 🟢
    .addRule('ts-no-unnecessary-template-expression', ERROR) /** @since 61.1.0 */
    .addRule('ts-prefer-function-type', ERROR) /** @since 61.1.0 */
    .addRule('type-formatting', formatTypeValues ? ERROR : OFF, [
      {stringQuotes: 'single', methodQuotes: 'single', objectFieldSeparator: 'semicolon'},
    ]) /** @since 55.3.0 */
    .addRule('valid-types', ERROR) /** @since 3.6.0 */ // 🟢2️⃣
    .markCategory('Deprecated')
    .addRule('check-examples', OFF) /** @since 3.13.0 */ // Doesn't work in ESLint 9, deprecated since 59.0.1
    .enableConfigTesterForPlugin('jsdoc')
    .addOverrides();

  const configBuilderTypescript = context.createConfigBuilder(configTypescript, 'jsdoc');
  const configTypescriptOptions = typeof configTypescript === 'object' ? configTypescript : {};
  const pluginSettingsForTs = configTypescriptOptions.settings || pluginSettings;

  configBuilderTypescript
    ?.addConfig([
      'jsdoc/ts',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_TS_X],
        settings: {
          // @ts-expect-error TS is crazy - if an interface is inlined, it won't error
          jsdoc: pluginSettingsForTs,
        },
      },
    ])
    .addRule('no-types', ERROR) /** @since 7.0.0 */ // 🔵
    .addRule('no-undefined-types', OFF) /** @since 3.6.0 */ // 🔵(off)
    .addRule('require-param-type', OFF) /** @since 2.0.1 */ // 🔵(off)
    .addRule('require-property-type', OFF) /** @since 19.0.0 */ // 🔵(off)
    .addRule('require-returns-type', OFF) /** @since 2.0.1 */ // 🔵(off)
    .enableConfigTesterForPlugin('jsdoc', {
      /* v8 ignore next */
      rulesToSkipInConfig: () => true,
    })
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderTypescript],
    optionsResolved,
  };
}) satisfies UnConfigFn<'jsdoc'>;
