import {ERROR, GLOB_TSX, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

interface EslintPluginJsdocSettings {
  /**
   * Disables all rules for the comment block on which a `@private` tag (or `@access private`) occurs.
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
   * Indicates how many line breaks (if any) will be checked to find a jsdoc comment block before the given code block
   * @default 0
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md#maxlines-and-minlines
   */
  minLines?: number;

  /**
   * Indicates how many line breaks (if any) will be checked to find a jsdoc comment block before the given code block
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
   * Preferred alias name for a JSDoc tag. The format of the configuration is: `<primary tag name>`: `<preferred alias name>`
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
   * Allows the omission of the tags corresponding to `require-*` rules if `@augments` or its alias `@extends` is present.
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
   * Configures [`check-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/check-types.md) and [`no-undefined-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-undefined-types.md) rules.
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
           * Use string to specify the type to be preferred in its place (and which fix mode can replace). Use `false` for forbidding the type
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
   * An object indicating tags whose types and names/namepaths (whether defining or referencing namepaths) will be checked, subject to configuration.
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
   * Configures [`require-param-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-param-type.md) and [`require-param-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-param-description.md) rules.
   */
  // Note: undocumented on the settings readme, only on rule-specific docs:
  // https://github.com/gajus/eslint-plugin-jsdoc/blob/d2c60403bb55a14eadbf49fc9937caad14a29cde/docs/rules/require-param-type.md?plain=1#L17
  exemptDestructuredRootsFromChecks?: boolean;
}

export interface JsdocEslintConfigOptions extends UnConfigOptions<'jsdoc'> {
  /**
   * [`eslint-plugin-jsdoc` plugin settings](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/settings.md) that will be applied to the specified `files` and `ignores`.
   */
  settings?: EslintPluginJsdocSettings;

  /**
   * Explicitly specify or ignore files written in TypeScript. Will be used to disable certain rules like [`no-undefined-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-undefined-types.md) or [`require-param-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-param-type.md), and enable some rules like [`no-types`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-types.md).
   *
   * Will create a separate ESLint config which by default will use `settings` from the root `jsdoc` config, if specified, and will only be applied to TypeScript files.
   * @default true <=> `ts` config is enabled
   */
  configTypescript?: boolean | UnConfigOptions<'jsdoc', Pick<JsdocEslintConfigOptions, 'settings'>>;

  /**
   * With be merged with the default list: `['ts-check', 'ts-expect-error', 'ts-ignore', 'ts-nocheck', '__PURE__', '__NO_SIDE_EFFECTS__', 'vite-ignore]`.
   *
   * Used in rules:
   * - [`no-bad-blocks`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-bad-blocks.md)
   */
  extraMultilineCommentsStartingWithToIgnore?: string[];
}

export const jsdocUnConfig: UnConfigFn<'jsdoc'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.jsdoc;
  const optionsResolved = assignDefaults(optionsRaw, {
    configTypescript: context.configsMeta.ts.enabled,
  } satisfies JsdocEslintConfigOptions);

  const {
    settings: pluginSettings,
    configTypescript,
    extraMultilineCommentsStartingWithToIgnore,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'jsdoc');

  // Legend:
  // 🟢 - in recommended
  // 🔵 - in recommended-typescript
  // 1️⃣ - in Contents
  // 2️⃣ - in Logical
  // 3️⃣ - in Requirements
  // 4️⃣ - in Stylistic

  configBuilder
    ?.addConfig(['jsdoc', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}], {
      ...(pluginSettings && {
        settings: {
          jsdoc: pluginSettings,
        },
      }),
    })
    .addRule('check-access', ERROR) // 🟢2️⃣
    .addRule('check-alignment', ERROR) // 🟢4️⃣
    .addRule('check-examples', OFF) // Doesn't work in ESLint 9
    .addRule('check-indentation', ERROR)
    .addRule('check-line-alignment', ERROR) // 4️⃣
    .addRule('check-param-names', ERROR) // 🟢2️⃣
    .addRule('check-property-names', ERROR) // 🟢2️⃣
    .addRule('check-syntax', ERROR) // 2️⃣
    .addRule('check-tag-names', ERROR) // 🟢2️⃣
    .addRule('check-template-names', ERROR) // 2️⃣
    .addRule('check-types', ERROR) // 🟢2️⃣
    .addRule('check-values', ERROR) // 🟢2️⃣
    .addRule('convert-to-jsdoc-comments', OFF) // Experimental rule
    .addRule('empty-tags', ERROR) // 🟢2️⃣
    .addRule('implements-on-classes', ERROR) // 🟢2️⃣
    .addRule('imports-as-dependencies', OFF)
    .addRule('informative-docs', OFF) // 1️⃣
    .addRule('lines-before-block', ERROR) // 4️⃣
    .addRule('match-description', OFF) // 1️⃣
    .addRule('match-name', OFF)
    .addRule('multiline-blocks', ERROR) // 🟢4️⃣
    .addRule('no-bad-blocks', ERROR, [
      {
        ignore: [
          // TypeScript directives
          'ts-check',
          'ts-expect-error',
          'ts-ignore',
          'ts-nocheck',
          // https://github.com/javascript-compiler-hints/compiler-notations-spec
          '__PURE__',
          '__NO_SIDE_EFFECTS__',
          'vite-ignore',
          ...(extraMultilineCommentsStartingWithToIgnore || []),
        ],
      },
    ]) // 2️⃣
    .addRule('no-blank-block-descriptions', ERROR) // 1️⃣
    .addRule('no-blank-blocks', ERROR) // 1️⃣
    .addRule('no-defaults', ERROR) // TODO why is this recommended? 🟢2️⃣
    .addRule('no-missing-syntax', OFF)
    .addRule('no-multi-asterisks', ERROR, [{allowWhitespace: true}]) // 🟢4️⃣
    .addRule('no-restricted-syntax', OFF)
    .addRule('no-types', OFF) // 2️⃣
    .addRule('no-undefined-types', ERROR) // 🟢2️⃣
    .addRule('require-asterisk-prefix', ERROR) // 4️⃣
    .addRule('require-description-complete-sentence', OFF)
    .addRule('require-description', OFF)
    .addRule('require-example', OFF) // 3️⃣
    .addRule('require-file-overview', OFF)
    .addRule('require-hyphen-before-param-description', OFF) // 4️⃣
    .addRule('require-jsdoc', OFF) // 🟢3️⃣
    .addRule('require-param-description', WARNING) // 🟢3️⃣ (error by default)
    .addRule('require-param-name', ERROR) // 🟢3️⃣
    .addRule('require-param-type', ERROR) // 🟢
    .addRule('require-param', ERROR, [{ignoreWhenAllParamsMissing: true}]) // 🟢3️⃣
    .addRule('require-property-description', WARNING) // 🟢3️⃣ (error by default)
    .addRule('require-property-name', ERROR) // 🟢3️⃣
    .addRule('require-property-type', ERROR) // 🟢
    .addRule('require-property', ERROR) // 🟢3️⃣
    .addRule('require-returns-check', ERROR) // 🟢2️⃣
    .addRule('require-returns-description', WARNING) // 🟢3️⃣ (error by default)
    .addRule('require-returns-type', ERROR) // 🟢
    .addRule('require-returns', OFF) // 🟢3️⃣
    .addRule('require-template', OFF)
    .addRule('require-throws', OFF)
    .addRule('require-yields-check', ERROR) // 🟢2️⃣
    .addRule('require-yields', ERROR) // 🟢3️⃣
    .addRule('sort-tags', ERROR)
    .addRule('tag-lines', ERROR) // 🟢4️⃣
    .addRule('text-escaping', OFF) // 1️⃣
    .addRule('valid-types', ERROR) // 🟢2️⃣
    .addOverrides();

  const configBuilderTypescript = createConfigBuilder(context, configTypescript, 'jsdoc');
  const configTypescriptOptions = typeof configTypescript === 'object' ? configTypescript : {};
  const pluginSettingsForTs = configTypescriptOptions.settings || pluginSettings;

  configBuilderTypescript
    ?.addConfig(
      [
        'jsdoc/ts',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_TSX],
        },
      ],
      {
        ...(pluginSettingsForTs && {
          settings: {
            jsdoc: pluginSettingsForTs,
          },
        }),
      },
    )
    .addRule('no-types', ERROR) // 🔵
    .addRule('no-undefined-types', OFF) // 🔵(off)
    .addRule('require-param-type', OFF) // 🔵(off)
    .addRule('require-property-type', OFF) // 🔵(off)
    .addRule('require-returns-type', OFF) // 🔵(off)
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderTypescript],
    optionsResolved,
  };
};
