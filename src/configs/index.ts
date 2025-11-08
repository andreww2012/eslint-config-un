/* eslint-disable perfectionist/sort-interfaces */
import type {ConsolaInstance} from 'consola';
import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {
  FastImportPluginSettings,
  ImportPluginReplaceableRules,
} from '../config-un/fast-import';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import {
  type AllEslintFixableRuleNames,
  ConfigEntryBuilder,
  type EslintPlugin,
  type EslintSeverity,
  type FlatConfigEntry,
  type RulesRecord,
  type UnConfigOptions,
  type UnFlagConfigEntry,
} from '../eslint';
import type {
  LoadablePackagePrefix,
  LoadablePluginPrefix,
  PackageToLoadInfo,
  ParserPrefix,
  PluginPrefix,
  pluginsLoaders,
} from '../loaders';
import type {OmitIndexSignature, OmitStrict, Promisable} from '../types';
import type {MaybeArray, MaybeFn, fetchPackageInfo} from '../utils';
import type {AngularEslintConfigOptions} from './angular';
import type {AstroEslintConfigOptions} from './astro';
import type {AvaEslintConfigOptions} from './ava';
import type {BetterTailwindEslintConfigOptions} from './better-tailwind';
import type {CasePoliceEslintConfigOptions} from './case-police';
import type {CompatEslintConfigOptions} from './compat';
import type {CspellEslintConfigOptions} from './cspell';
import type {CssEslintConfigOptions} from './css';
import type {CssInJsEslintConfigOptions} from './css-in-js';
import type {CypressEslintConfigOptions} from './cypress';
import type {DeMorganEslintConfigOptions} from './de-morgan';
import type {DependEslintConfigOptions} from './depend';
import type {EmberEslintConfigOptions} from './ember';
import type {ErasableSyntaxOnlyEslintConfigOptions} from './erasable-syntax-only';
import type {EsEslintConfigOptions} from './es';
import type {EslintCommentsEslintConfigOptions} from './eslint-comments';
import type {EslintPluginEslintConfigOptions} from './eslint-plugin';
import type {CliEslintConfigOptions} from './extra/cli';
import type {CloudfrontFunctionsEslintConfigOptions} from './extra/cloudfront-functions';
import type {NoStylisticRulesEslintConfigOptions} from './extra/no-stylistic-rules';
import type {FileProgressEslintConfigOptions} from './file-progress';
import type {GraphqlEslintConfigOptions} from './graphql';
import type {HeaderEslintConfigOptions} from './header';
import type {HeadersEslintConfigOptions} from './headers';
import type {HtmlEslintConfigOptions} from './html';
import type {ImportEslintConfigOptions} from './import';
import type {ImportZodEslintConfigOptions} from './import-zod';
import type {JestEslintConfigOptions} from './jest';
import type {JsEslintConfigOptions} from './js';
import type {JsInlineEslintConfigOptions} from './js-inline';
import type {JsdocEslintConfigOptions} from './jsdoc';
import type {JsonSchemaValidatorEslintConfigOptions} from './json-schema-validator';
import type {JsoncEslintConfigOptions} from './jsonc';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {LitEslintConfigOptions} from './lit';
import type {MarkdownEslintConfigOptions} from './markdown';
import type {MarkdownLinksEslintConfigOptions} from './markdown-links';
import type {MarkdownPreferencesEslintConfigOptions} from './markdown-preferences';
import type {MathEslintConfigOptions} from './math';
import type {MdxEslintConfigOptions} from './mdx';
import type {MochaEslintConfigOptions} from './mocha';
import type {NextJsEslintConfigOptions} from './nextjs';
import type {NoOnlyTestsEslintConfigOptions} from './no-only-tests';
import type {NoUnsanitizedEslintConfigOptions} from './no-unsanitized';
import type {NodeEslintConfigOptions} from './node';
import type {NodeDependenciesEslintConfigOptions} from './node-dependencies';
import type {NxEslintConfigOptions} from './nx';
import type {PackageJsonEslintConfigOptions} from './package-json';
import type {PerfectionistEslintConfigOptions} from './perfectionist';
import type {PlaywrightEslintConfigOptions} from './playwright';
import type {PnpmEslintConfigOptions} from './pnpm';
import type {PreferArrowFunctionsEslintConfigOptions} from './prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './promise';
import type {QunitEslintConfigOptions} from './qunit';
import type {QwikEslintConfigOptions} from './qwik';
import type {ReactEslintConfigOptions} from './react';
import type {RegexpEslintConfigOptions} from './regexp';
import type {RxjsEslintConfigOptions} from './rxjs';
import type {SecurityEslintConfigOptions} from './security';
import type {SolidEslintConfigOptions} from './solid';
import type {SonarEslintConfigOptions} from './sonar';
import type {StorybookEslintConfigOptions} from './storybook';
import type {SvelteEslintConfigOptions} from './svelte';
import type {TailwindEslintConfigOptions} from './tailwind';
import type {TanstackQueryEslintConfigOptions} from './tanstack-query';
import type {TestingLibraryEslintConfigOptions} from './testing-library';
import type {TomlEslintConfigOptions} from './toml';
import type {TsEslintConfigOptions} from './ts';
import type {TurboEslintConfigOptions} from './turbo';
import type {UnEslintConfigOptions} from './un';
import type {UnicornEslintConfigOptions} from './unicorn';
import type {UnnecessaryAbstractionsEslintConfigOptions} from './unnecessary-abstractions';
import type {UnocssEslintConfigOptions} from './unocss';
import type {UnusedImportsEslintConfigOptions} from './unused-imports';
import type {VitestEslintConfigOptions} from './vitest';
import type {VueEslintConfigOptions} from './vue';
import type {WebComponentsEslintConfigOptions} from './web-components';
import type {YamlEslintConfigOptions} from './yaml';
import type {YouDontNeedLodashUnderscoreEslintConfigOptions} from './you-dont-need-lodash-underscore';
import type {ZodEslintConfigOptions} from './zod';

export type {
  GetRuleOptions,
  RuleNamesForPlugin,
  RulesRecordPartial,
  UnConfigOptions,
} from '../eslint';
export {assignDefaults} from '../utils';

export type ExtraPluginsType = Record<string, () => Promisable<EslintPlugin>>;

export interface EslintConfigUnOptions<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * **Global** ignore patterns. By default will be merged with our ignore patterns, unless `overrideIgnores` is set to `true`
   */
  ignores?: FlatConfigEntry['ignores'];

  /**
   * `ignores` patterns override, not merge with the ignore patterns suggested by our config
   * @default false
   */
  overrideIgnores?: boolean;

  /**
   * Automatically add gitignore'd files to `ignores` array.
   * @default true <=> `.gitignore` exists
   */
  gitignore?: boolean | FlatGitignoreOptions;

  /**
   * Type of your project. Depending on the value, will affect the following rules:
   * - [`import/no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md): importing from `devDependencies` will be forbidden in `lib` mode.
   * @default 'app'
   */
  mode?: 'app' | 'lib';

  /**
   * Enables `eslint-config-prettier` at the end of the ruleset.
   * @default true
   * @see https://github.com/prettier/eslint-config-prettier
   */
  disablePrettierIncompatibleRules?: boolean;

  /**
   * Force non-zero severity of all the rules to be `error` or `warning`.
   * This can also be configured per-config.
   */
  forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;

  configs?: {
    [Key in keyof UnConfigs<ExtraPlugins>]?: boolean | UnConfigs<ExtraPlugins>[Key];
  };

  extraConfigs?: UnFlagConfigEntry<ExtraPlugins>[];

  /**
   * Only load ESLint plugins if they are actually used.
   *
   * If an object is used, all plugins except the ones specified in `alwaysLoad`
   * will be lazy-loaded.
   * @default true
   */
  loadPluginsOnDemand?:
    | boolean
    | {
        /**
         * These plugins will always be loaded. This can be useful if you only enable certain
         * plugin rules using [configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments).
         */
        alwaysLoad: LoadablePluginPrefix[];
      };

  /**
   * Allows to change a plugin prefix. Keys are the default prefixes, value cannot be empty
   * string (or it will be ignored anyway).
   *
   * You have to still use **OLD** prefixes in `overrides`, and they will be automatically renamed.
   * @example
   * To make all the rules from `@eslint-react` plugin have `react-x` prefix:
   * ```ts
   * {'@eslint-react': 'react-x'}
   * ```
   */
  pluginRenames?: Partial<Record<Exclude<PluginPrefix, ''>, string>>;

  /**
   * Defines for which rules and/or plugins autofix will be disabled globally.
   *
   * If you set `plugins.<pluginName>: false` (default), all the fixable plugin's rules will remain
   * being autofixable, expect for the ones set to `true` in `rules`.
   *
   * If you set `plugins.<pluginName>: true`, all the fixable plugin's rules will stop
   * being autofixable, expect for the ones set to `false` in `rules`.
   *
   * `rules` object will be merged with the following default value:
   * ```ts
   * {
   *   'case-police/string-check': true,
   *   'ts/method-signature-style': true,
   *   'ts/no-unnecessary-type-arguments': true,
   *   'unicorn/catch-error-name': true,
   *   'unicorn/consistent-existence-index-check': true,
   *   'unicorn/explicit-length-check': true,
   *   'unicorn/no-useless-undefined': true,
   *   'unicorn/prefer-spread': true,
   *   'zod/require-schema-suffix': true,
   * }
   * ```
   *
   * Other special values:
   * - `true`: autofix will be disabled for all the fixable rules in all the plugins.
   * - `false`: no autofixes will be disabled.
   */
  autofixDisabledGloballyFor?:
    | boolean
    | {
        plugins?: Partial<Record<PluginPrefix, boolean>>;
        rules?: Partial<Record<AllEslintFixableRuleNames, boolean>>;
      };

  /**
   * This option overrides if certain configs are enabled or disabled by default.
   * - `all-disabled`: consider all top level configs disabled unless explicitly enabled.
   * - `misc-enabled`: consider some configs disabled by default, conversely enabled: `security`, `yaml`,  `toml`, `json`, `packageJson`, `jsonSchemaValidator`, `nodeDependencies`, `depend`.
   */
  defaultConfigsStatus?: 'all-disabled' | 'misc-enabled';

  /**
   * This option allows you to override any of the used plugins. This can be useful in case
   * this config is used to lint a repository itself of one of the plugins to provide
   * development version of the plugin.
   */
  pluginsOverrides?: {
    [Plugin in Exclude<PluginPrefix, ''>]?: Plugin extends keyof typeof pluginsLoaders
      ? Awaited<ReturnType<(typeof pluginsLoaders)[Plugin]>>['module'] & {}
      : EslintPlugin;
  };

  /**
   * Globally disables all the rules that may perform network requests for validation.
   * @default true <=> `ESLINT_CONFIG_UN_OFFLINE_MODE` environment variable is set to non-empty string
   */
  offlineMode?: boolean;

  /**
   * Replaces the implementation of certain [`import`](https://npmjs.com/eslint-plugin-import-x) plugin rules with implementations from [`fast-import`](https://npmjs.com/eslint-plugin-fast-import).
   *
   * ⚠️ The latter plugin doesn't support the rule options from the former plugin.
   * It'll be made by us that they will be silently ignored.
   *
   * The replaced rules' list (their name will actually be preserved):
   * - `no-cycle`
   * - `no-named-as-default`
   * - `no-unresolved` (replaced with `no-unresolved-imports`)
   * @default false
   */
  useFastImport?:
    | boolean
    | {
        pluginSettings?: Partial<FastImportPluginSettings>;
        replaceRules?: Partial<Record<ImportPluginReplaceableRules, boolean>>;
      };

  /**
   * Attempt to cache the resolved flat config. This might fail if it contains
   * unserializable data, such as functions. Enabled by default when running in editor.
   *
   * It will be stored in `node_modules/.cache/eslint-config-un/config.json` and considered
   * fresh for 1 hour, unless one of the following is changed:
   * - Current git revision (`git rev-parse HEAD`) or root `.gitignore` contents
   * - `package.json`, lockfile contents or package manager
   * - ESLint config file contents
   * - Node.JS version
   * @default true <=> running in editor (detected by [`is-in-editor`](https://npmjs.com/is-in-editor))
   */
  cacheConfigs?: boolean;

  /**
   * Allows to provide additional ESLint plugins. Their prefixes and possibly rule names
   * will appear in configs' `rules` property type. They will be lazy-loaded only if used.
   *
   * Note that their prefixes must not match the built-it/known ones (like `ts` or `unicorn`)
   * or even prefixes you've renamed via `pluginRenames`.
   */
  extraPlugins?: ExtraPlugins;
}

/* eslint-enable perfectionist/sort-interfaces */
export interface UnConfigs<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * [Angular](https://angular.dev) specific rules. Supported versions: 13 to 20 (inclusive).
   *
   * You are expected to install `@angular-eslint/eslint-plugin` and
   * `@angular-eslint/eslint-plugin-template` packages of the same major version
   * as your Angular version, but installing a greater version would also likely work.
   *
   * The list of available rules will depend on the installed version of the packages.
   * @default true <=> `@angular/core` package is installed
   */
  angular: AngularEslintConfigOptions<ExtraPlugins>;

  /**
   * [Astro](https://astro.build) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-astro`](https://npmjs.com/eslint-plugin-astro) ([docs](https://ota-meshi.github.io/eslint-plugin-astro))
   * @default true <=> `astro` package is installed
   */
  astro: AstroEslintConfigOptions<ExtraPlugins>;

  /**
   * [Ava test runner](https://avajs.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-ava`](https://npmjs.com/eslint-plugin-ava) ([docs](https://github.com/avajs/eslint-plugin-ava))
   * @default true <=> `ava` package is installed
   */
  ava: AvaEslintConfigOptions<ExtraPlugins>;

  /**
   * [TailwindCSS](https://tailwindcss.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss) ([docs](https://github.com/schoero/eslint-plugin-better-tailwindcss))
   * @default true <=> `tailwindcss` package is installed
   */
  betterTailwind: BetterTailwindEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-case-police`](https://npmjs.com/eslint-plugin-case-police) ([docs](https://github.com/antfu/case-police))
   *
   * NOTE: disabled by default
   * @default false
   */
  casePolice: CasePoliceEslintConfigOptions<ExtraPlugins>;

  /**
   * A config specific to files meant to be executed. By default, allows `process.exit()`
   * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
   * (on any level).
   * @default true
   */
  cli: CliEslintConfigOptions<ExtraPlugins>;

  /**
   * [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) specific rules.
   *
   * [JavaScript runtime 2.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html) is assumed by default.
   * For functions written for [JavaScript runtime 1.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-10.html),
   * use `configV1` sub-config.
   *
   * Note that if neither `files` or `ignores` are specified or is an empty array in the main
   * or a sub-config, the config won't be generated.
   *
   * NOTE: disabled by default
   * @default false
   */
  cloudfrontFunctions: CloudfrontFunctionsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to lint the browser compatibility of the code.
   *
   * Used plugins:
   * - [`eslint-plugin-compat`](https://npmjs.com/eslint-plugin-compat) ([docs](https://github.com/amilajack/eslint-plugin-compat))
   *
   * NOTE: disabled by default
   * @default false
   */
  compat: CompatEslintConfigOptions<ExtraPlugins>;

  /**
   * CSpell spell checker.
   *
   * Used plugin:
   * - [`@cspell/eslint-plugin`](https://npmjs.com/package/@cspell/eslint-plugin) ([docs](https://github.com/streetsidesoftware/cspell/tree/HEAD/packages/cspell-eslint-plugin#readme))
   *
   * NOTE: disabled by default
   * @default false
   */
  cspell: CspellEslintConfigOptions<ExtraPlugins>;

  /**
   * CSS specific rules.
   *
   * Used plugin:
   * - [`@eslint/css`](https://npmjs.com/@eslint/css) ([docs](https://github.com/eslint/css))
   * @default true <=> `stylelint` package is NOT installed
   */
  css: CssEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-css`](https://npmjs.com/eslint-plugin-css) ([docs](https://ota-meshi.github.io/eslint-plugin-css))
   * @default true
   */
  cssInJs: CssInJsEslintConfigOptions<ExtraPlugins>;

  /**
   * [Cypress](https://www.cypress.io) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-cypress`](https://npmjs.com/eslint-plugin-cypress) ([docs](https://github.com/cypress-io/eslint-plugin-cypress))
   * @default true <=> `cypress` package is installed
   */
  cypress: CypressEslintConfigOptions<ExtraPlugins>;

  /**
   * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
   *
   * Used plugin:
   * - [`eslint-plugin-de-morgan`](https://npmjs.com/eslint-plugin-de-morgan) ([docs](https://github.com/azat-io/eslint-plugin-de-morgan))
   *
   * NOTE: disabled by default.
   * @default false
   */
  deMorgan: DeMorganEslintConfigOptions<ExtraPlugins>;

  /**
   * Enables rules from a plugin to help suggest alternatives to various dependencies.
   *
   * Used plugin:
   * - [`eslint-plugin-depend`](https://npmjs.com/eslint-plugin-depend) ([docs](https://github.com/es-tooling/eslint-plugin-depend))
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  depend: DependEslintConfigOptions<ExtraPlugins>;

  /**
   * [Ember](https://emberjs.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-ember`](https://npmjs.com/eslint-plugin-ember) ([docs](https://github.com/ember-cli/eslint-plugin-ember))
   * @default true <=> `ember-source` package is installed
   */
  ember: EmberEslintConfigOptions<ExtraPlugins>;

  /**
   * ESLint plugin to granularly enforce TypeScript's [`erasableSyntaxOnly`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-rc/#the---erasablesyntaxonly-option) flag.
   *
   * By default, applied to all TypeScript files.
   *
   * Used plugin:
   * - [`eslint-plugin-erasable-syntax-only`](https://npmjs.com/eslint-plugin-erasable-syntax-only) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only))
   *
   * NOTE: disabled by default
   * @default false
   */
  erasableSyntaxOnly: ErasableSyntaxOnlyEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-es-x`](https://npmjs.com/eslint-plugin-es-x) ([docs](https://eslint-community.github.io/eslint-plugin-es-x))
   *
   * NOTE: disabled by default
   * @default false
   */
  es: EsEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`@eslint-community/eslint-plugin-eslint-comments`](https://npmjs.com/@eslint-community/eslint-plugin-eslint-comments) ([docs](https://eslint-community.github.io/eslint-plugin-eslint-comments))
   * @default true
   */
  eslintComments: EslintCommentsEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin for linting ESLint plugins.
   *
   * Used plugin:
   * - [`eslint-plugin-eslint-plugin`](https://npmjs.com/eslint-plugin-eslint-plugin) ([docs](https://github.com/eslint-community/eslint-plugin-eslint-plugin))
   * @default false
   */
  eslintPlugin: EslintPluginEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESlint plugin to print file progress.
   *
   * Even if enabled, it will be disabled by default when it's detected ESLint running
   * in CI or in editor by `ci-info` and `is-in-editor` packages respectively.
   *
   * Used plugin:
   * - [`eslint-plugin-file-progress`](https://npmjs.com/eslint-plugin-file-progress) ([docs](https://github.com/sibiraj-s/eslint-plugin-file-progress))
   * @default false
   */
  fileProgress: FileProgressEslintConfigOptions<ExtraPlugins>;

  /**
   * [GraphQL](https://graphql.org) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-graphql`](https://npmjs.com/@graphql-eslint/eslint-plugin) ([docs](https://the-guild.dev/graphql/eslint))
   * @default true <=> `graphql` package is installed
   */
  graphql: GraphqlEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to ensure that files begin with the given comment.
   *
   * There is also an alternative config, `headers`, which is powered by [`eslint-plugin-headers`](https://npmjs.com/eslint-plugin-headers).
   *
   * Used plugins:
   * - [`eslint-plugin-header`](https://npmjs.com/eslint-plugin-header) ([docs](https://github.com/Stuk/eslint-plugin-header))
   * @default false
   */
  header: HeaderEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to ensure that files begin with the given comment.
   *
   * There is also an alternative config, `header`, which is powered by [`eslint-plugin-header`](https://npmjs.com/eslint-plugin-header).
   *
   * Used plugins:
   * - [`eslint-plugin-headers`](https://npmjs.com/eslint-plugin-headers) ([docs](https://github.com/robmisasi/eslint-plugin-headers))
   * @default false
   */
  headers: HeadersEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules for linting plain HTML files.
   *
   * Used plugin:
   * - [`@html-eslint/eslint-plugin`](https://npmjs.com/@html-eslint/eslint-plugin) ([docs](https://html-eslint.org/docs/getting-started))
   * @default true <=> `angular` config is **disabled**
   */
  html: HtmlEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-import-x`](https://npmjs.com/eslint-plugin-import-x) ([docs](https://github.com/un-ts/eslint-plugin-import-x))
   * @default true
   */
  import: ImportEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to enforce namespace imports for zod.
   * See [this Zod issue comment](https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831) why this might be needed.
   *
   * **Note:** you should probably use `zod` config instead, which includes the similar rule
   * and bunch of others zod rules.
   *
   * Used plugins:
   * - [`eslint-plugin-import-zod`](https://npmjs.com/eslint-plugin-import-zod) ([docs](https://github.com/samchungy/eslint-plugin-import-zod))
   * @default false
   */
  importZod: ImportZodEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-jest`](https://npmjs.com/eslint-plugin-jest) ([docs](https://github.com/jest-community/eslint-plugin-jest))
   * @default true <=> `jest` package is installed
   */
  jest: JestEslintConfigOptions<ExtraPlugins>;

  /**
   * Built-in rules for linting JavaScript & TypeScript.
   * @default true
   */
  js: JsEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-jsdoc`](https://npmjs.com/eslint-plugin-jsdoc) ([docs](https://github.com/gajus/eslint-plugin-jsdoc))
   * @default true
   */
  jsdoc: JsdocEslintConfigOptions<ExtraPlugins>;

  /**
   * Plugin for linting `<script>` blocks inside HTML files. It does not have any
   * actual rules.
   *
   * Used plugin:
   * - [`eslint-plugin-html`](https://npmjs.com/eslint-plugin-html) ([docs](https://github.com/BenoitZugmeyer/eslint-plugin-html))
   * @default true
   */
  jsInline: JsInlineEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-jsonc`](https://npmjs.com/eslint-plugin-jsonc) ([docs](https://ota-meshi.github.io/eslint-plugin-jsonc))
   *
   * NOTE: disabled by default.
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  json: JsoncEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-json-schema-validator`](https://npmjs.com/eslint-plugin-json-schema-validator) ([the single rule docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md))
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  jsonSchemaValidator: JsonSchemaValidatorEslintConfigOptions<ExtraPlugins>;

  /**
   * Provides accessibility rules for JSX. Applied to all JSX files by default.
   *
   * Note: you may want to disable this config if you're not using JSX for performance reasons.
   *
   * Used plugin:
   * - [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y)
   * @default true
   */
  jsxA11y: JsxA11yEslintConfigOptions<ExtraPlugins>;

  /**
   * [Lit](https://lit.dev) specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-lit`](https://npmjs.com/eslint-plugin-lit) ([docs](https://github.com/43081j/eslint-plugin-lit))
   * @default true <=> `lit` package is installed
   */
  lit: LitEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`@eslint/markdown`](https://npmjs.com/@eslint/markdown) ([docs](https://github.com/eslint/markdown))
   * @default true
   */
  markdown: MarkdownEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that provides rules for checking the validity of links and URLs in Markdown files.
   *
   * Used plugin:
   * - [`eslint-plugin-markdown-links`](https://npmjs.com/eslint-plugin-markdown-links) ([docs](https://ota-meshi.github.io/eslint-plugin-markdown-links))
   * @default true
   */
  markdownLinks: MarkdownLinksEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin that helps enforce consistent writing style and formatting conventions in Markdown files.
   *
   * Used plugin:
   * - [`eslint-plugin-markdown-preferences`](https://npmjs.com/eslint-plugin-markdown-preferences) ([docs](https://ota-meshi.github.io/eslint-plugin-markdown-preferences))
   * @default true
   */
  markdownPreferences: MarkdownPreferencesEslintConfigOptions<ExtraPlugins>;

  /**
   * ESLint rules related to `Math` and `Number` objects.
   *
   * Used plugin:
   * - [`eslint-plugin-math`](https://npmjs.com/eslint-plugin-math) ([docs](https://ota-meshi.github.io/eslint-plugin-math))
   * @default true
   */
  math: MathEslintConfigOptions<ExtraPlugins>;

  /**
   * [MDX](https://mdxjs.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-mdx`](https://npmjs.com/eslint-plugin-mdx) ([docs](https://github.com/mdx-js/eslint-mdx))
   * @default true
   */
  mdx: MdxEslintConfigOptions<ExtraPlugins>;

  /**
   * [Mocha](https://mochajs.org) specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-mocha`](https://npmjs.com/eslint-plugin-mocha) ([docs](https://github.com/lo1tuma/eslint-plugin-mocha))
   * @default true
   */
  mocha: MochaEslintConfigOptions<ExtraPlugins>;

  /**
   * [Next.js](https://nextjs.org) specific rules.
   *
   * Used plugin:
   * - [`@next/eslint-plugin-next`](https://npmjs.com/@next/eslint-plugin-next) ([docs](https://nextjs.org/docs/app/api-reference/config/eslint))
   * @default true <=> `next` package is installed
   */
  nextJs: NextJsEslintConfigOptions<ExtraPlugins>;

  /**
   * Node.js code specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-n`](https://npmjs.com/eslint-plugin-n) ([docs](https://github.com/eslint-community/eslint-plugin-n))
   * @default true
   */
  node: NodeEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-node-dependencies`](https://npmjs.com/eslint-plugin-node-dependencies) ([docs](https://ota-meshi.github.io/eslint-plugin-node-dependencies))
   *
   * Note that this plugin is considered experimental.
   *
   * By default will be applied to all `package.json` files.
   * You may only specify JSON files for this config.
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  nodeDependencies: NodeDependenciesEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to prevent focused (`.only`) tests. Also included in
   * testing framework's configs as a sub-config.
   *
   * If enabled, by default will be applied to all test files.
   *
   * Used plugins:
   * - [`eslint-plugin-no-only-tests`](https://npmjs.com/eslint-plugin-no-only-tests) ([docs](https://github.com/levibuzolic/no-only-tests))
   *
   * NOTE: disabled by default
   * @default false
   */
  noOnlyTests: NoOnlyTestsEslintConfigOptions<ExtraPlugins>;

  /**
   * If you integrate eslint-config-un into an existing project, you might encounter a lot of
   * reports from rules that are merely about stylistic and other choices, not the ones
   * that can potentially find bugs and other kind of problems in your code.
   * Use this config to globally disable all such rules, or conversely enable only them,
   * or some of them.
   *
   * NOTE: disabled by default
   * @default false
   */
  noStylisticRules: NoStylisticRulesEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-no-unsanitized`](https://npmjs.com/eslint-plugin-no-unsanitized) ([docs](https://github.com/mozilla/eslint-plugin-no-unsanitized))
   * @default true
   */
  noUnsanitized: NoUnsanitizedEslintConfigOptions<ExtraPlugins>;

  /**
   * [Nx](https://nx.dev) specific rules.
   *
   * Used plugins:
   * - [`@nx/eslint-plugin`](https://npmjs.com/@nx/eslint-plugin) ([docs](https://nx.dev/technologies/eslint/eslint-plugin))
   * @default true <=> `nx` package is installed
   */
  nx: NxEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugins:
   * - [`eslint-plugin-package-json`](https://npmjs.com/eslint-plugin-package-json) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json))
   * - (if `enforceAbsoluteVersion` option is used) [`eslint-plugin-node-dependencies`](https://npmjs.com/eslint-plugin-node-dependencies) ([docs](https://ota-meshi.github.io/eslint-plugin-node-dependencies))
   *
   * NOTE: disabled by default.
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  packageJson: PackageJsonEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-perfectionist`](https://npmjs.com/eslint-plugin-perfectionist) ([docs](https://perfectionist.dev))
   *
   * NOTE: even if enabled, **all** the rules are still disabled by default.
   *
   * NOTE: disabled by default.
   * @default false
   */
  perfectionist: PerfectionistEslintConfigOptions<ExtraPlugins>;

  /**
   * [Playwright](https://playwright.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-playwright`](https://npmjs.com/eslint-plugin-playwright) ([docs](https://github.com/playwright-community/eslint-plugin-playwright))
   * @default true <=> `playwright` package is installed
   */
  playwright: PlaywrightEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules specific to pnpm package manager.
   *
   * Used plugin:
   * - [`eslint-plugin-pnpm`](https://npmjs.com/eslint-plugin-pnpm)
   * @default true <=> pnpm is detected as a used package manager by [`package-manager-detector`](https://npmjs.com/package-manager-detector)
   */
  pnpm: PnpmEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-prefer-arrow-functions`](https://npmjs.com/eslint-plugin-prefer-arrow-functions) ([docs](https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions))
   *
   * NOTE: disabled by default
   * @default false
   */
  preferArrowFunctions: PreferArrowFunctionsEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-promise`](https://npmjs.com/eslint-plugin-promise) ([docs](https://github.com/eslint-community/eslint-plugin-promise))
   * @default true
   */
  promise: PromiseEslintConfigOptions<ExtraPlugins>;

  /**
   * [QUnit](https://qunitjs.com) specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-qunit`](https://npmjs.com/eslint-plugin-qunit) ([docs](https://github.com/platinumazure/eslint-plugin-qunit))
   * @default true <=> `qunit` package is installed
   */
  qunit: QunitEslintConfigOptions<ExtraPlugins>;

  /**
   * [qwik](https://qwik.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-qwik`](https://npmjs.com/eslint-plugin-qwik) ([docs](https://qwik.dev/docs/advanced/eslint))
   * @default true <=> `@builder.io/qwik` or `@qwik.dev/core` package is installed
   */
  qwik: QwikEslintConfigOptions<ExtraPlugins>;

  /**
   * [React](https://react.dev) specific rules.
   *
   * ### Used plugins
   * - [`eslint-plugin-react`](https://npmjs.com/eslint-plugin-react)
   * - [`@eslint-react/eslint-plugin`](https://npmjs.com/@eslint-react/eslint-plugin)
   * **with `@eslint-react` prefix**
   * - [`eslint-plugin-react-hooks`](https://npmjs.com/eslint-plugin-react-hooks)
   *
   * Since `eslint-plugin-react` and `@eslint-react/eslint-plugin` have some overlapping rules,
   * and `eslint-plugin-react` has some rules that are not relevant in modern codebases,
   * there exists an option to control which rules from which plugins, if any, will be used.
   * Refer to `pluginX` option JSDoc for more details.
   *
   * ### Sub-configs
   * - `allowDefaultExportsInJsxFiles`: micro config to allow default exports in all JSX files.
   * - `reactX`: runtime agnostic ("X") and "Name Convention" rules from `@eslint-react/eslint-plugin`.
   * - `hooks`: rules from `eslint-plugin-react-hooks` as well as "Hooks Extra" rules from `@eslint-react/eslint-plugin`.
   * - `dom`: DOM specific rules from both `@eslint-react/eslint-plugin` and `eslint-plugin-react`.
   * - `refresh`: rules from `eslint-plugin-react-refresh`.
   * - `youMightNotNeedAnEffect`: rules from `eslint-plugin-react-you-might-not-need-an-effect`.
   * @default true <=> `react` package is installed
   */
  react: ReactEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-regexp`](https://npmjs.com/eslint-plugin-regexp) ([docs](https://ota-meshi.github.io/eslint-plugin-regexp))
   * @default true
   */
  regexp: RegexpEslintConfigOptions<ExtraPlugins>;

  /**
   * [RxJS](https://rxjs.dev) specific rules.
   *
   * Used plugins:
   * - [`@smarttools/eslint-plugin-rxjs`](https://npmjs.com/@smarttools/eslint-plugin-rxjs) ([docs](https://github.com/DaveMBush/eslint-plugin-rxjs))
   * @default true <=> `rxjs` package is installed
   */
  rxjs: RxjsEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-security`](https://npmjs.com/eslint-plugin-security) ([docs](https://github.com/eslint-community/eslint-plugin-security))
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  security: SecurityEslintConfigOptions<ExtraPlugins>;

  /**
   * [SolidJS](https://svelte.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-solid`](https://npmjs.com/eslint-plugin-solid) ([docs](https://github.com/solidjs-community/eslint-plugin-solid))
   * @default true <=> `solid-js` package is installed
   */
  solid: SolidEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-sonarjs`](https://npmjs.com/eslint-plugin-sonarjs) ([docs](https://github.com/SonarSource/SonarJS/tree/master/packages/jsts/src/rules#eslint-plugin-sonarjs-))
   * @default true
   */
  sonar: SonarEslintConfigOptions<ExtraPlugins>;

  /**
   * [Storybook](https://storybook.js.org) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-storybook`](https://npmjs.com/eslint-plugin-storybook) ([docs](https://storybook.js.org/docs/configure/integration/eslint-plugin))
   * @default true <=> `storybook` package is installed
   */
  storybook: StorybookEslintConfigOptions<ExtraPlugins>;

  /**
   * [Svelte](https://svelte.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-svelte`](https://npmjs.com/eslint-plugin-svelte) ([docs](https://sveltejs.github.io/eslint-plugin-svelte))
   * @default true <=> `svelte` package is installed
   */
  svelte: SvelteEslintConfigOptions<ExtraPlugins>;

  /**
   * [Tailwind CSS](https://tailwindcss.com) specific rules, "original" plugin.
   *
   * Used plugin:
   * - [`eslint-plugin-tailwindcss`](https://npmjs.com/eslint-plugin-tailwindcss) ([docs](https://github.com/francoismassart/eslint-plugin-tailwindcss))
   *
   * NOTE: disabled by default, superseded by `betterTailwind` config
   * @default false
   */
  tailwind: TailwindEslintConfigOptions<ExtraPlugins>;

  /**
   * [TanStack Query](https://tanstack.com/query) specific rules.
   *
   * Used plugin:
   * - [`@tanstack/eslint-plugin-query`](https://npmjs.com/@tanstack/eslint-plugin-query) ([docs](https://tanstack.com/query/v5/docs/eslint/eslint-plugin-query))
   * @default true <=> `@tanstack/query-core` package is installed (dependency of all `@tanstack/*-query` packages)
   */
  tanstackQuery: TanstackQueryEslintConfigOptions<ExtraPlugins>;

  /**
   * [Testing Library](https://testing-library.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-testing-library`](https://npmjs.com/eslint-plugin-testing-library) ([docs](https://github.com/testing-library/eslint-plugin-testing-library))
   * @default true <=> `@testing-library/dom` package is installed
   */
  testingLibrary: TestingLibraryEslintConfigOptions<ExtraPlugins>;

  /**
   * TOML specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-toml`](https://npmjs.com/eslint-plugin-toml) ([docs](https://ota-meshi.github.io/eslint-plugin-toml))
   *
   * If enabled, a Rust lockfile (`Cargo.lock`) will be ignored by default
   *
   * NOTE: disabled by default.
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  toml: TomlEslintConfigOptions<ExtraPlugins>;

  /**
   * TypeScript specific rules.
   *
   * Used plugin:
   * - [`typescript-eslint`](https://npmjs.com/typescript-eslint) ([docs](https://typescript-eslint.io))
   *
   * Note that if `files` is empty array, `typeAware` sub-config will be disabled too,
   * unless its `files` are explicitly specified.
   * @default true
   */
  ts: TsEslintConfigOptions<ExtraPlugins>;

  /**
   * [Turborepo](https://turborepo.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-turbo`](https://npmjs.com/eslint-plugin-turbo) ([docs](https://turborepo.com/docs/reference/eslint-plugin-turbo))
   * @default true <=> `turbo` package is installed
   */
  turbo: TurboEslintConfigOptions<ExtraPlugins>;

  /**
   * Rules not included in any other plugins, provided by us and collected under `un` prefix.
   *
   * Used plugins:
   * - Built-in eslint-plugin-un
   * @default true
   */
  un: UnEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-unicorn`](https://npmjs.com/eslint-plugin-unicorn) ([docs](https://github.com/sindresorhus/eslint-plugin-unicorn))
   * @default true
   */
  unicorn: UnicornEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin with rules to detect and prevent some unnecessary code abstractions.
   *
   * Used plugins:
   * - [`eslint-plugin-unnecessary-abstractions`](https://npmjs.com/eslint-plugin-unnecessary-abstractions) ([docs](https://github.com/personalyisus/eslint-plugin-unnecessary-abstractions#readme))
   * @default true
   */
  unnecessaryAbstractions: UnnecessaryAbstractionsEslintConfigOptions<ExtraPlugins>;

  /**
   * [UnoCSS](https://unocss.dev) specific rules.
   *
   * Used plugins:
   * - [`@unocss/eslint-plugin`](https://npmjs.com/@unocss/eslint-plugin) ([docs](https://unocss.dev/integrations/eslint))
   * @default true <=> `unocss` package is installed
   */
  unocss: UnocssEslintConfigOptions<ExtraPlugins>;

  /**
   * Provides an autofix to remove unused imports.
   *
   * Used plugin:
   * - [`eslint-plugin-unused-imports`](https://npmjs.com/eslint-plugin-unused-imports)
   * @default true
   */
  unusedImports: UnusedImportsEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-vitest`](https://npmjs.com/eslint-plugin-vitest) ([docs](https://github.com/veritem/eslint-plugin-vitest))
   * @default true <=> `vitest` package is installed
   */
  vitest: VitestEslintConfigOptions<ExtraPlugins>;

  /**
   * Used plugin:
   * - [`eslint-plugin-vue`](https://npmjs.com/eslint-plugin-vue) ([docs](https://eslint.vuejs.org))
   * @default true <=> `vue` package is installed
   */
  vue: VueEslintConfigOptions<ExtraPlugins>;

  /**
   * Web components specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-wc`](https://npmjs.com/eslint-plugin-wc) ([docs](https://github.com/43081j/eslint-plugin-wc))
   * @default false
   */
  webComponents: WebComponentsEslintConfigOptions<ExtraPlugins>;

  /**
   * YAML specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-yml`](https://npmjs.com/eslint-plugin-yml) ([docs](https://ota-meshi.github.io/eslint-plugin-yml))
   *
   * If enabled, lockfiles (`yarn.lock`, `pnpm-lock.yaml`) will be ignored by default
   *
   * NOTE: disabled by default.
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  yaml: YamlEslintConfigOptions<ExtraPlugins>;

  /**
   * Helps in identifying places in your codebase where you don't (may not) need Lodash/Underscore.
   *
   * Used plugins:
   * - [`eslint-plugin-you-dont-need-lodash-underscore`](https://npmjs.com/eslint-plugin-you-dont-need-lodash-underscore) ([docs](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore))
   * @default true <=> Any of the following packages are installed: `lodash`, `lodash-es`, `lodash.{assign,bind,capitalize,concat,contains,defaults,drop,every,fill,filter,find,first,flatten,get,head,includes,join,keys,last,map,omit,pairs,reduce,repeat,replace,reverse,size,slice,some,split,throttle,trim,uniq,values}`
   */
  youDontNeedLodashUnderscore: YouDontNeedLodashUnderscoreEslintConfigOptions<ExtraPlugins>;

  /**
   * An ESLint plugin to enforce best practices when using Zod.
   *
   * **Claims to only support zod v4.**
   *
   * Used plugins:
   * - [`eslint-plugin-zod-x`](https://npmjs.com/eslint-plugin-zod-x) ([docs](https://github.com/marcalexiei/eslint-plugin-zod-x#readme))
   * @default true <=> `zod` package is installed and its version is >=4
   */
  zod: ZodEslintConfigOptions<ExtraPlugins>;
}
/* eslint-disable perfectionist/sort-interfaces */

export interface EslintConfigUnInternalOptions {
  disableAutofixForAllFixableRulesOnly?: boolean;
  testMode?: boolean;
}

export function createConfigBuilder<
  ExtraPlugins extends ExtraPluginsType,
  P extends PluginPrefix | null,
>(
  this: UnConfigContext<ExtraPlugins>,
  options: NoInfer<
    UnConfigOptions<ExtraPlugins, P extends null ? OmitIndexSignature<RulesRecord> : P> | boolean
  >,
  rulesPrefix: P,
  disabledIfEmptyFiles = true,
) {
  const optionsResolved = typeof options === 'object' ? options : {};
  if (
    !options ||
    (Array.isArray(optionsResolved.files) &&
      optionsResolved.files.length === 0 &&
      disabledIfEmptyFiles)
  ) {
    return null;
  }
  return new ConfigEntryBuilder<ExtraPlugins, P>(
    rulesPrefix,
    // eslint-disable-next-line ts/no-unnecessary-condition
    options && typeof options === 'object' ? options : {},
    this,
  );
}

export interface UnConfigContext<ExtraPlugins extends ExtraPluginsType = ExtraPluginsType> {
  rootOptions: EslintConfigUnOptions<ExtraPlugins>;
  internalOptions: EslintConfigUnInternalOptions;
  packagesInfo: Record<
    (typeof PACKAGES_TO_GET_INFO_FOR)[number],
    Awaited<ReturnType<typeof fetchPackageInfo>>
  >;
  configsMeta: Record<keyof UnConfigs<ExtraPlugins>, {enabled: boolean}>;
  resolvedConfigs?: Partial<UnConfigs<ExtraPlugins>>;

  /**
   * NOTE: mutable. Rule names must be UNprefixed
   */
  disabledAutofixes: Partial<Record<PluginPrefix, string[]>>;

  /**
   * NOTE: mutable
   */
  usedPlugins: Set<PluginPrefix | (string & {})>;

  /**
   * NOTE: mutable
   */
  usedParsers: Map<ParserPrefix, FlatConfigEntry[]>;

  /**
   * NOTE: mutable
   */
  usedPackages: Map<
    LoadablePackagePrefix,
    {config: FlatConfigEntry; path: string; info: PackageToLoadInfo}[]
  >;

  /**
   * NOTE: mutable
   */
  missingPackages: Set<string>;

  meta: {
    usedPackageManager: Awaited<ReturnType<typeof detectPackageManager>>;
  };

  logger: ConsolaInstance;
  debug: debug.Debugger;
  isTestMode: boolean;
  tests: MaybeFn<
    MaybeArray<string | {message: string; severity: 'error' | 'warn'}> | null,
    [
      data: {
        plugins: Partial<Record<PluginPrefix, EslintPlugin>>;
      },
    ]
  >[];
  createConfigBuilder: typeof createConfigBuilder;
}

export type UnConfigFn<
  ConfigKey extends keyof UnConfigs,
  ExtraArgument = unknown,
  ExtraReturnedData = unknown,
> = <ExtraPlugins extends ExtraPluginsType>(
  context: Readonly<UnConfigContext<ExtraPlugins>>,
  configOptions:
    | boolean
    | OmitStrict<UnConfigs<ExtraPlugins>[ConfigKey], 'overrides' | 'overridesAny'>
    | undefined,
  extraArgument: ExtraArgument,
) => Promisable<
  | null
  | ({
      configs: (ConfigEntryBuilder<ExtraPlugins> | null)[];
      optionsResolved: Record<string, unknown>;
    } & ExtraReturnedData)
>;

/* eslint-enable perfectionist/sort-interfaces */
