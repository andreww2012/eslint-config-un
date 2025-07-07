/* eslint perfectionist/sort-interfaces: 2 */
/* eslint-disable perfectionist/sort-interfaces */
import type {ConsolaInstance} from 'consola';
import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {
  ConfigEntryBuilder,
  EslintPlugin,
  EslintSeverity,
  FlatConfigEntry,
  UnFlagConfigEntry,
} from '../eslint';
import type {ParserPrefix, PluginPrefix, pluginsLoaders} from '../plugins';
import type {PrettifyShallow, Promisable, SetRequired} from '../types';
import type {fetchPackageInfo} from '../utils';
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
import type {HtmlEslintConfigOptions} from './html';
import type {ImportEslintConfigOptions} from './import';
import type {JestEslintConfigOptions} from './jest';
import type {JsEslintConfigOptions} from './js';
import type {JsInlineEslintConfigOptions} from './js-inline';
import type {JsdocEslintConfigOptions} from './jsdoc';
import type {JsonSchemaValidatorEslintConfigOptions} from './json-schema-validator';
import type {JsoncEslintConfigOptions} from './jsonc';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {LitEslintConfigOptions} from './lit';
import type {MarkdownEslintConfigOptions} from './markdown';
import type {MathEslintConfigOptions} from './math';
import type {MdxEslintConfigOptions} from './mdx';
import type {MochaEslintConfigOptions} from './mocha';
import type {NextJsEslintConfigOptions} from './nextjs';
import type {NoOnlyTestsEslintConfigOptions} from './no-only-tests';
import type {NoUnsanitizedEslintConfigOptions} from './no-unsanitized';
import type {NodeEslintConfigOptions} from './node';
import type {NodeDependenciesEslintConfigOptions} from './node-dependencies';
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
import type {UnicornEslintConfigOptions} from './unicorn';
import type {UnusedImportsEslintConfigOptions} from './unused-imports';
import type {VitestEslintConfigOptions} from './vitest';
import type {VueEslintConfigOptions} from './vue';
import type {YamlEslintConfigOptions} from './yaml';
import type {YouDontNeedLodashUnderscoreEslintConfigOptions} from './you-dont-need-lodash-underscore';

export interface EslintConfigUnOptions {
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
    [Key in keyof UnConfigs]?: boolean | PrettifyShallow<UnConfigs[Key]>;
  };

  extraConfigs?: UnFlagConfigEntry[];

  /**
   * Only load ESLint plugins if they are actually used.
   * @default true
   */
  loadPluginsOnDemand?: boolean;

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
  pluginRenames?: PrettifyShallow<Partial<Record<Exclude<PluginPrefix, ''>, string>>>;

  /**
   * Defines a method of disabling autofix of plugins' fixable rules:
   * - `unprefixed`: will deeply copy the plugin and disable autofixes of all or specified rules.
   * This allows to disable autofix without changing the full rule name you won't be able
   * to re-enable autofix on per file basis.
   * - `prefixed`: will create a plugin with `disable-autofix` prefix and copy the rules into it.
   * Rules with disabled autofixes will have names starting with `disable-autofix/`.
   *
   * Empty key is a plugin with core ESLint rules.
   *
   * `default` specifies a default disabling method for all plugins.
   * @default {default: 'unprefixed'}
   */
  disableAutofixMethod?: PrettifyShallow<
    Partial<Record<'default' | PluginPrefix, DisableAutofixMethod>>
  >;

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
    [Plugin in Exclude<PluginPrefix, ''>]: Plugin extends keyof typeof pluginsLoaders
      ? Awaited<ReturnType<(typeof pluginsLoaders)[Plugin]>>['module'] & {}
      : EslintPlugin;
  };
}

export type DisableAutofixMethod = 'unprefixed' | 'prefixed';

/* eslint-enable perfectionist/sort-interfaces */
export interface UnConfigs {
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
  angular: AngularEslintConfigOptions;

  /**
   * [Astro](https://astro.build) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-astro`](https://npmjs.com/eslint-plugin-astro) ([docs](https://ota-meshi.github.io/eslint-plugin-astro))
   * @default true <=> `astro` package is installed
   */
  astro: AstroEslintConfigOptions;

  /**
   * [Ava test runner](https://avajs.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-ava`](https://npmjs.com/eslint-plugin-ava) ([docs](https://github.com/avajs/eslint-plugin-ava))
   * @default true <=> `ava` package is installed
   */
  ava: AvaEslintConfigOptions;

  /**
   * [TailwindCSS](https://tailwindcss.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss) ([docs](https://github.com/schoero/eslint-plugin-better-tailwindcss))
   * @default true <=> `tailwindcss` package is installed
   */
  betterTailwind: BetterTailwindEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-case-police`](https://npmjs.com/eslint-plugin-case-police) ([docs](https://github.com/antfu/case-police))
   *
   * NOTE: disabled by default
   * @default false
   */
  casePolice: CasePoliceEslintConfigOptions;

  /**
   * A config specific to files meant to be executed. By default, allows `process.exit()`
   * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
   * (on any level).
   * @default true
   */
  cli: CliEslintConfigOptions;

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
  cloudfrontFunctions: CloudfrontFunctionsEslintConfigOptions;

  /**
   * An ESLint plugin to lint the browser compatibility of the code.
   *
   * Used plugins:
   * - [`eslint-plugin-compat`](https://npmjs.com/eslint-plugin-compat) ([docs](https://github.com/amilajack/eslint-plugin-compat))
   *
   * NOTE: disabled by default
   * @default false
   */
  compat: CompatEslintConfigOptions;

  /**
   * CSpell spell checker.
   *
   * Used plugin:
   * - [`@cspell/eslint-plugin`](https://npmjs.com/package/@cspell/eslint-plugin) ([docs](https://github.com/streetsidesoftware/cspell/tree/HEAD/packages/cspell-eslint-plugin#readme))
   *
   * NOTE: disabled by default
   * @default false
   */
  cspell: CspellEslintConfigOptions;

  /**
   * CSS specific rules.
   *
   * Used plugin:
   * - [`@eslint/css`](https://npmjs.com/@eslint/css) ([docs](https://github.com/eslint/css))
   * @default true <=> `stylelint` package is NOT installed
   */
  css: CssEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-css`](https://npmjs.com/eslint-plugin-css) ([docs](https://ota-meshi.github.io/eslint-plugin-css))
   * @default true
   */
  cssInJs: CssInJsEslintConfigOptions;

  /**
   * [Cypress](https://www.cypress.io) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-cypress`](https://npmjs.com/eslint-plugin-cypress) ([docs](https://github.com/cypress-io/eslint-plugin-cypress))
   * @default true <=> `cypress` package is installed
   */
  cypress: CypressEslintConfigOptions;

  /**
   * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
   *
   * Used plugin:
   * - [`eslint-plugin-de-morgan`](https://npmjs.com/eslint-plugin-de-morgan) ([docs](https://github.com/azat-io/eslint-plugin-de-morgan))
   *
   * NOTE: disabled by default.
   * @default false
   */
  deMorgan: DeMorganEslintConfigOptions;

  /**
   * Enables rules from a plugin to help suggest alternatives to various dependencies.
   *
   * Used plugin:
   * - [`eslint-plugin-depend`](https://npmjs.com/eslint-plugin-depend) ([docs](https://github.com/es-tooling/eslint-plugin-depend))
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  depend: DependEslintConfigOptions;

  /**
   * [Ember](https://emberjs.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-ember`](https://npmjs.com/eslint-plugin-ember) ([docs](https://github.com/ember-cli/eslint-plugin-ember))
   * @default true <=> `ember-source` package is installed
   */
  ember: EmberEslintConfigOptions;

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
  erasableSyntaxOnly: ErasableSyntaxOnlyEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-es-x`](https://npmjs.com/eslint-plugin-es-x) ([docs](https://eslint-community.github.io/eslint-plugin-es-x))
   *
   * NOTE: disabled by default
   * @default false
   */
  es: EsEslintConfigOptions;

  /**
   * Used plugin:
   * - [`@eslint-community/eslint-plugin-eslint-comments`](https://npmjs.com/@eslint-community/eslint-plugin-eslint-comments) ([docs](https://eslint-community.github.io/eslint-plugin-eslint-comments))
   * @default true
   */
  eslintComments: EslintCommentsEslintConfigOptions;

  /**
   * An ESLint plugin for linting ESLint plugins.
   *
   * Used plugin:
   * - [`eslint-plugin-eslint-plugin`](https://npmjs.com/eslint-plugin-eslint-plugin) ([docs](https://github.com/eslint-community/eslint-plugin-eslint-plugin))
   * @default false
   */
  eslintPlugin: EslintPluginEslintConfigOptions;

  /**
   * An ESlint plugin to print file progress.
   *
   * Used plugin:
   * - [`eslint-plugin-file-progress`](https://npmjs.com/eslint-plugin-file-progress) ([docs](https://github.com/sibiraj-s/eslint-plugin-file-progress))
   * @default false
   */
  fileProgress: FileProgressEslintConfigOptions;

  /**
   * [GraphQL](https://graphql.org) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-graphql`](https://npmjs.com/@graphql-eslint/eslint-plugin) ([docs](https://the-guild.dev/graphql/eslint))
   * @default true <=> `graphql` package is installed
   */
  graphql: GraphqlEslintConfigOptions;

  /**
   * Rules for linting plain HTML files.
   *
   * Used plugin:
   * - [`@html-eslint/eslint-plugin`](https://npmjs.com/@html-eslint/eslint-plugin) ([docs](https://html-eslint.org/docs/getting-started))
   * @default true <=> `angular` config is **disabled**
   */
  html: HtmlEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-import-x`](https://npmjs.com/eslint-plugin-import-x) ([docs](https://github.com/un-ts/eslint-plugin-import-x))
   * @default true
   */
  import: ImportEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-jest`](https://npmjs.com/eslint-plugin-jest) ([docs](https://github.com/jest-community/eslint-plugin-jest))
   * @default true <=> `jest` package is installed
   */
  jest: JestEslintConfigOptions;

  /**
   * Built-in rules for linting JavaScript & TypeScript.
   * @default true
   */
  js: JsEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-jsdoc`](https://npmjs.com/eslint-plugin-jsdoc) ([docs](https://github.com/gajus/eslint-plugin-jsdoc))
   * @default true
   */
  jsdoc: JsdocEslintConfigOptions;

  /**
   * Plugin for linting `<script>` blocks inside HTML files. It does not have any
   * actual rules.
   *
   * Used plugin:
   * - [`eslint-plugin-html`](https://npmjs.com/eslint-plugin-html) ([docs](https://github.com/BenoitZugmeyer/eslint-plugin-html))
   * @default true
   */
  jsInline: JsInlineEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-jsonc`](https://npmjs.com/eslint-plugin-jsonc) ([docs](https://ota-meshi.github.io/eslint-plugin-jsonc))
   *
   * NOTE: disabled by default.
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  json: JsoncEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-json-schema-validator`](https://npmjs.com/eslint-plugin-json-schema-validator) ([the single rule docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md))
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  jsonSchemaValidator: JsonSchemaValidatorEslintConfigOptions;

  /**
   * Provides accessibility rules for JSX. Applied to all JSX files by default.
   *
   * Note: you may want to disable this config if you're not using JSX for performance reasons.
   *
   * Used plugin:
   * - [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y)
   * @default true
   */
  jsxA11y: JsxA11yEslintConfigOptions;

  /**
   * [Lit](https://lit.dev) specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-lit`](https://npmjs.com/eslint-plugin-lit) ([docs](https://github.com/43081j/eslint-plugin-lit))
   * @default true <=> `lit` package is installed
   */
  lit: LitEslintConfigOptions;

  /**
   * Used plugin:
   * - [`@eslint/markdown`](https://npmjs.com/@eslint/markdown) ([docs](https://github.com/eslint/markdown))
   * @default true
   */
  markdown: MarkdownEslintConfigOptions;

  /**
   * ESLint rules related to `Math` and `Number` objects.
   *
   * Used plugin:
   * - [`eslint-plugin-math`](https://npmjs.com/eslint-plugin-math) ([docs](https://ota-meshi.github.io/eslint-plugin-math))
   * @default true
   */
  math: MathEslintConfigOptions;

  /**
   * [MDX](https://mdxjs.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-mdx`](https://npmjs.com/eslint-plugin-mdx) ([docs](https://github.com/mdx-js/eslint-mdx))
   * @default true
   */
  mdx: MdxEslintConfigOptions;

  /**
   * [Mocha](https://mochajs.org) specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-mocha`](https://npmjs.com/eslint-plugin-mocha) ([docs](https://github.com/lo1tuma/eslint-plugin-mocha))
   * @default true
   */
  mocha: MochaEslintConfigOptions;

  /**
   * [Next.js](https://nextjs.org) specific rules.
   *
   * Used plugin:
   * - [`@next/eslint-plugin-next`](https://npmjs.com/@next/eslint-plugin-next) ([docs](https://nextjs.org/docs/app/api-reference/config/eslint))
   * @default true <=> `next` package is installed
   */
  nextJs: NextJsEslintConfigOptions;

  /**
   * Node.js code specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-n`](https://npmjs.com/eslint-plugin-n) ([docs](https://github.com/eslint-community/eslint-plugin-n))
   * @default true
   */
  node: NodeEslintConfigOptions;

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
  nodeDependencies: NodeDependenciesEslintConfigOptions;

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
  noOnlyTests: NoOnlyTestsEslintConfigOptions;

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
  noStylisticRules: NoStylisticRulesEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-no-unsanitized`](https://npmjs.com/eslint-plugin-no-unsanitized) ([docs](https://github.com/mozilla/eslint-plugin-no-unsanitized))
   * @default true
   */
  noUnsanitized: NoUnsanitizedEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-package-json`](https://npmjs.com/eslint-plugin-package-json) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json))
   *
   * NOTE: disabled by default.
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  packageJson: PackageJsonEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-perfectionist`](https://npmjs.com/eslint-plugin-perfectionist) ([docs](https://perfectionist.dev))
   *
   * NOTE: even if enabled, **all** the rules are still disabled by default.
   *
   * NOTE: disabled by default.
   * @default false
   */
  perfectionist: PerfectionistEslintConfigOptions;

  /**
   * [Playwright](https://playwright.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-playwright`](https://npmjs.com/eslint-plugin-playwright) ([docs](https://github.com/playwright-community/eslint-plugin-playwright))
   * @default true <=> `playwright` package is installed
   */
  playwright: PlaywrightEslintConfigOptions;

  /**
   * Rules specific to pnpm package manager.
   *
   * Used plugin:
   * - [`eslint-plugin-pnpm`](https://npmjs.com/eslint-plugin-pnpm)
   * @default true <=> pnpm is detected as a used package manager by [`package-manager-detector`](https://npmjs.com/package-manager-detector)
   */
  pnpm: PnpmEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-prefer-arrow-functions`](https://npmjs.com/eslint-plugin-prefer-arrow-functions) ([docs](https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions))
   *
   * NOTE: disabled by default
   * @default false
   */
  preferArrowFunctions: PreferArrowFunctionsEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-promise`](https://npmjs.com/eslint-plugin-promise) ([docs](https://github.com/eslint-community/eslint-plugin-promise))
   * @default true
   */
  promise: PromiseEslintConfigOptions;

  /**
   * [QUnit](https://qunitjs.com) specific rules.
   *
   * Used plugins:
   * - [`eslint-plugin-qunit`](https://npmjs.com/eslint-plugin-qunit) ([docs](https://github.com/platinumazure/eslint-plugin-qunit))
   * @default true <=> `qunit` package is installed
   */
  qunit: QunitEslintConfigOptions;

  /**
   * [qwik](https://qwik.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-qwik`](https://npmjs.com/eslint-plugin-qwik) ([docs](https://qwik.dev/docs/advanced/eslint))
   * @default true <=> `@builder.io/qwik` or `@qwik.dev/core` package is installed
   */
  qwik: QwikEslintConfigOptions;

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
   * - `compiler`: rules from `eslint-plugin-react-compiler`.
   * - `refresh`: rules from `eslint-plugin-react-refresh`.
   * - `youMightNotNeedAnEffect`: rules from `eslint-plugin-react-you-might-not-need-an-effect`.
   * @default true <=> `react` package is installed
   */
  react: ReactEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-regexp`](https://npmjs.com/eslint-plugin-regexp) ([docs](https://ota-meshi.github.io/eslint-plugin-regexp))
   * @default true
   */
  regexp: RegexpEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-security`](https://npmjs.com/eslint-plugin-security) ([docs](https://github.com/eslint-community/eslint-plugin-security))
   *
   * NOTE: disabled by default
   * @default true <=> `defaultConfigsStatus` is set to `misc-enabled`
   */
  security: SecurityEslintConfigOptions;

  /**
   * [SolidJS](https://svelte.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-solid`](https://npmjs.com/eslint-plugin-solid) ([docs](https://github.com/solidjs-community/eslint-plugin-solid))
   * @default true <=> `solid-js` package is installed
   */
  solid: SolidEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-sonarjs`](https://npmjs.com/eslint-plugin-sonarjs) ([docs](https://github.com/SonarSource/SonarJS/tree/master/packages/jsts/src/rules#eslint-plugin-sonarjs-))
   * @default true
   */
  sonar: SonarEslintConfigOptions;

  /**
   * [Storybook](https://storybook.js.org) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-storybook`](https://npmjs.com/eslint-plugin-storybook) ([docs](https://storybook.js.org/docs/configure/integration/eslint-plugin))
   * @default true <=> `storybook` package is installed
   */
  storybook: StorybookEslintConfigOptions;

  /**
   * [Svelte](https://svelte.dev) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-svelte`](https://npmjs.com/eslint-plugin-svelte) ([docs](https://sveltejs.github.io/eslint-plugin-svelte))
   * @default true <=> `svelte` package is installed
   */
  svelte: SvelteEslintConfigOptions;

  /**
   * [Tailwind CSS](https://tailwindcss.com) specific rules, "original" plugin.
   *
   * Used plugin:
   * - [`eslint-plugin-tailwindcss`](https://npmjs.com/eslint-plugin-tailwindcss) ([docs](https://github.com/francoismassart/eslint-plugin-tailwindcss))
   *
   * NOTE: disabled by default, superseded by `betterTailwind` config
   * @default false
   */
  tailwind: TailwindEslintConfigOptions;

  /**
   * [TanStack Query](https://tanstack.com/query) specific rules.
   *
   * Used plugin:
   * - [`@tanstack/eslint-plugin-query`](https://npmjs.com/@tanstack/eslint-plugin-query) ([docs](https://tanstack.com/query/v5/docs/eslint/eslint-plugin-query))
   * @default true <=> `@tanstack/query-core` package is installed (dependency of all `@tanstack/*-query` packages)
   */
  tanstackQuery: TanstackQueryEslintConfigOptions;

  /**
   * [Testing Library](https://testing-library.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-testing-library`](https://npmjs.com/eslint-plugin-testing-library) ([docs](https://github.com/testing-library/eslint-plugin-testing-library))
   * @default true <=> `@testing-library/dom` package is installed
   */
  testingLibrary: TestingLibraryEslintConfigOptions;

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
  toml: TomlEslintConfigOptions;

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
  ts: TsEslintConfigOptions;

  /**
   * [Turborepo](https://turborepo.com) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-turbo`](https://npmjs.com/eslint-plugin-turbo) ([docs](https://turborepo.com/docs/reference/eslint-plugin-turbo))
   * @default true <=> `turbo` package is installed
   */
  turbo: TurboEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-unicorn`](https://npmjs.com/eslint-plugin-unicorn) ([docs](https://github.com/sindresorhus/eslint-plugin-unicorn))
   * @default true
   */
  unicorn: UnicornEslintConfigOptions;

  /**
   * Provides an autofix to remove unused imports.
   *
   * Used plugin:
   * - [`eslint-plugin-unused-imports`](https://npmjs.com/eslint-plugin-unused-imports)
   * @default true
   */
  unusedImports: UnusedImportsEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-vitest`](https://npmjs.com/eslint-plugin-vitest) ([docs](https://github.com/veritem/eslint-plugin-vitest))
   * @default true <=> `vitest` package is installed
   */
  vitest: VitestEslintConfigOptions;

  /**
   * Used plugin:
   * - [`eslint-plugin-vue`](https://npmjs.com/eslint-plugin-vue) ([docs](https://eslint.vuejs.org))
   * @default true <=> `vue` package is installed
   */
  vue: VueEslintConfigOptions;

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
  yaml: YamlEslintConfigOptions;

  /**
   * Helps in identifying places in your codebase where you don't (may not) need Lodash/Underscore.
   *
   * Used plugins:
   * - [`eslint-plugin-you-dont-need-lodash-underscore`](https://npmjs.com/eslint-plugin-you-dont-need-lodash-underscore) ([docs](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore))
   * @default true <=> Any of the following packages are installed: `lodash`, `lodash-es`, `lodash.{assign,bind,capitalize,concat,contains,defaults,drop,every,fill,filter,find,first,flatten,get,head,includes,join,keys,last,map,omit,pairs,reduce,repeat,replace,reverse,size,slice,some,split,throttle,trim,uniq,values}`
   */
  youDontNeedLodashUnderscore: YouDontNeedLodashUnderscoreEslintConfigOptions;
}
/* eslint-disable perfectionist/sort-interfaces */

export interface UnConfigContext {
  rootOptions: PrettifyShallow<
    EslintConfigUnOptions & {
      disableAutofixMethod: SetRequired<
        EslintConfigUnOptions['disableAutofixMethod'] & {},
        'default'
      >;
    }
  >;
  packagesInfo: Record<
    (typeof PACKAGES_TO_GET_INFO_FOR)[number],
    Awaited<ReturnType<typeof fetchPackageInfo>>
  >;
  configsMeta: Record<keyof UnConfigs, {enabled: boolean}>;
  resolvedConfigs?: Partial<UnConfigs>;

  /**
   * NOTE: mutable. Rule names must be UNprefixed
   */
  disabledAutofixes: Partial<
    Record<PluginPrefix, (string | {ruleName: string; method: DisableAutofixMethod})[]>
  >;

  /**
   * NOTE: mutable
   */
  usedPlugins: Set<PluginPrefix>;

  /**
   * NOTE: mutable
   */
  usedParsers: Map<ParserPrefix, FlatConfigEntry[]>;

  usedPackageManager: Awaited<ReturnType<typeof detectPackageManager>>;

  logger: ConsolaInstance;
  debug: debug.Debugger;
}

export type UnConfigFn<
  T extends keyof UnConfigs,
  ExtraReturnedData = unknown,
  ExtraArguments extends readonly unknown[] = unknown[],
> = (
  context: UnConfigContext,
  ...extraArg: ExtraArguments
) => Promisable<
  | null
  | ({
      configs: (ConfigEntryBuilder | null)[];
      optionsResolved: UnConfigs[T] & {};
    } & ExtraReturnedData)
>;

/* eslint-enable perfectionist/sort-interfaces */
