import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {
  ConfigEntryBuilder,
  EslintSeverity,
  FlatConfigEntry,
  UnFlagConfigEntry,
} from '../eslint';
import type {PluginPrefix} from '../plugins';
import type {PrettifyShallow, Promisable, SetRequired} from '../types';
import type {fetchPackageInfo} from '../utils';
import type {AngularEslintConfigOptions} from './angular';
import type {AstroEslintConfigOptions} from './astro';
import type {CasePoliceEslintConfigOptions} from './case-police';
import type {CssEslintConfigOptions} from './css';
import type {CssInJsEslintConfigOptions} from './css-in-js';
import type {DeMorganEslintConfigOptions} from './de-morgan';
import type {DependEslintConfigOptions} from './depend';
import type {ErasableSyntaxOnlyEslintConfigOptions} from './erasable-syntax-only';
import type {EsEslintConfigOptions} from './es';
import type {EslintCommentsEslintConfigOptions} from './eslint-comments';
import type {CliEslintConfigOptions} from './extra/cli';
import type {CloudfrontFunctionsEslintConfigOptions} from './extra/cloudfront-functions';
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
import type {MarkdownEslintConfigOptions} from './markdown';
import type {MathEslintConfigOptions} from './math';
import type {NextJsEslintConfigOptions} from './nextjs';
import type {NodeEslintConfigOptions} from './node';
import type {NodeDependenciesEslintConfigOptions} from './node-dependencies';
import type {PackageJsonEslintConfigOptions} from './package-json';
import type {PerfectionistEslintConfigOptions} from './perfectionist';
import type {PnpmEslintConfigOptions} from './pnpm';
import type {PreferArrowFunctionsEslintConfigOptions} from './prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './promise';
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
import type {TomlEslintConfigOptions} from './toml';
import type {TsEslintConfigOptions} from './ts';
import type {UnicornEslintConfigOptions} from './unicorn';
import type {UnusedImportsEslintConfigOptions} from './unused-imports';
import type {VitestEslintConfigOptions} from './vitest';
import type {VueEslintConfigOptions} from './vue';
import type {YamlEslintConfigOptions} from './yaml';

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
   * - [`package-json/require-name`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-name.md), [`package-json/require-version`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-version.md): enabled by default only in `lib` mode.
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
   * - `misc-enabled`: consider some configs disabled by default, conversely enabled: `security`, `yaml`,  `toml`, `json`, `packageJson`, `jsonSchemaValidator`, `casePolice`, `nodeDependencies`, `depend`.
   */
  defaultConfigsStatus?: 'all-disabled' | 'misc-enabled';
}

export type DisableAutofixMethod = 'unprefixed' | 'prefixed';

export interface UnConfigs {
  /**
   * @default true
   */
  js: JsEslintConfigOptions;

  /**
   * TypeScript specific rules.
   *
   * Note that if `files` is empty array, `typeAware` sub-config will be disabled too,
   * unless its `files` are explicitly specified.
   * @default true
   */
  ts: TsEslintConfigOptions;

  /**
   * @default true
   */
  unicorn: UnicornEslintConfigOptions;

  /**
   * @default true
   */
  import: ImportEslintConfigOptions;

  /**
   * @default true
   */
  node: NodeEslintConfigOptions;

  /**
   * @default true
   */
  promise: PromiseEslintConfigOptions;

  /**
   * @default true
   */
  sonar: SonarEslintConfigOptions;

  /**
   * `false` (do not enable Vue rules) <=> `vue` package is not installed (at any level) or `false` is explicitly passed
   */
  vue: VueEslintConfigOptions;

  /**
   * `false` (do not enable Tailwind rules) <=> `tailwindcss` package is not installed (at any level) or `false` is explicitly passed
   */
  tailwind: TailwindEslintConfigOptions;

  /**
   * @default true
   */
  regexp: RegexpEslintConfigOptions;

  /**
   * @default true
   */
  eslintComments: EslintCommentsEslintConfigOptions;

  /**
   * @default true
   */
  markdown: MarkdownEslintConfigOptions;

  /**
   * @default true
   */
  cssInJs: CssInJsEslintConfigOptions;

  /**
   * @default true <=> `jest` package is installed
   */
  jest: JestEslintConfigOptions;

  /**
   * @default true <=> `vitest` package is installed
   */
  vitest: VitestEslintConfigOptions;

  /**
   * @default true
   */
  jsdoc: JsdocEslintConfigOptions;

  /**
   * [qwik](https://qwik.dev/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-qwik`](https://npmjs.com/eslint-plugin-qwik) ([docs](https://qwik.dev/docs/advanced/eslint))
   * @default true <=> `@builder.io/qwik` or `@qwik.dev/core` package is installed
   */
  qwik: QwikEslintConfigOptions;

  /* eslint-disable jsdoc/check-indentation */

  /**
   * [Angular](https://angular.dev/) specific rules. Supported versions: 13 to 19 (inclusive).
   *
   * Resolved Angular version is the most important factor for determining
   * which rules are enabled and how they are configured.
   *
   * The resolve algorithm is as follows:
   * - By default, the major version of the installed `@angular/core` package is used.
   * - If it's not installed or not within the supported range, the config will be disabled.
   * - If the config is explicitly enabled by passing `true` or options but the package is not installed, the latest supported version will be used.
   * - You can also manually specify the version using `angularVersion` option, which always takes precedence.
   *
   * Under the hood the config uses [`@angular-eslint/eslint-plugin`](https://npmjs.com/@angular-eslint/eslint-plugin) and [`@angular-eslint/eslint-plugin-template`](https://npmjs.com/@angular-eslint/eslint-plugin-template) packages, but not directly.
   *
   * All the rules from all the supported versions of each of the plugins are merged
   * into one plugin, but only those that are available in the same major version
   * of the corresponding plugin will actually work. Others will be present, but do nothing, unless specified in `portRules` option.
   *
   * If the rule is present in multiple major versions of its plugin, the implementation
   * from the most recent version will be used.
   *
   * **NOTE**: if the config is disabled, despite the rules being available in
   * TypeScript types, the plugin will not be generated and they cannot be used.
   *
   * Examples:
   * - If the resolved Angular version is 18:
   *   - Any rule from `@angular-eslint/eslint-plugin(-template)` of version 18 will be available.
   *    - [`@angular-eslint/prefer-signals`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-signals.md) will do nothing, since it was added in v19 of `@angular-eslint/eslint-plugin`. Specify it in `portRules` to make it work for Angular 18 code.
   *     - [`@angular-eslint/component-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-class-suffix.md) will use the implementation from v19 of `@angular-eslint/eslint-plugin`.
   * - If the resolved Angular version is 19:
   *   - Any rule from `@angular-eslint/eslint-plugin(-template)` of version 19 will be available.
   *   - [`@angular-eslint/no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/v18.4.3/packages/eslint-plugin/docs/rules/no-host-metadata-property.md) rule will do nothing, since it was removed in v18 of `@angular-eslint/eslint-plugin`. Specify it in `portRules` to make it work again.
   */
  angular: AngularEslintConfigOptions;
  /* eslint-enable jsdoc/check-indentation */

  /**
   * CSS specific rules.
   *
   * Used plugin:
   * - [`@eslint/css`](https://npmjs.com/@eslint/css)
   * @default true unless `stylelint` package is installed
   */
  css: CssEslintConfigOptions;

  /**
   * Provides an autofix to remove unused imports.
   *
   * Used plugin:
   * - [`eslint-plugin-unused-imports`](https://npmjs.com/eslint-plugin-unused-imports)
   * @default true
   */
  unusedImports: UnusedImportsEslintConfigOptions;

  /**
   * [React](https://react.dev/) specific rules.
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
   * - `reactX`: runtime agnostic ("X") and "Name Convention" rules from `@eslint-react/eslint-plugin`.
   * - `hooks`: rules from `eslint-plugin-react-hooks` as well as "Hooks Extra" rules from `@eslint-react/eslint-plugin`.
   * - `dom`: DOM specific rules from both `@eslint-react/eslint-plugin` and `eslint-plugin-react`.
   * - `allowDefaultExportsInJsxFiles`: micro config to allow default exports in all JSX files.
   * @default true <=> `react` package is installed
   */
  react: ReactEslintConfigOptions;

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
   * Rules specific to pnpm package manager.
   *
   * Used plugin:
   * - [`eslint-plugin-pnpm`](https://npmjs.com/eslint-plugin-pnpm)
   * @default true <=> pnpm is detected as a used package manager by [`package-manager-detector`](https://npmjs.com/package-manager-detector)
   */
  pnpm: PnpmEslintConfigOptions;

  /**
   * [Next.js](https://nextjs.org/) specific rules.
   *
   * Used plugin:
   * - [`@next/eslint-plugin-next`](https://npmjs.com/@next/eslint-plugin-next) ([docs](https://nextjs.org/docs/app/api-reference/config/eslint))
   * @default true <=> `next` package is installed
   */
  nextJs: NextJsEslintConfigOptions;

  /**
   * [Astro](https://astro.build/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-astro`](https://npmjs.com/eslint-plugin-astro) ([docs](https://ota-meshi.github.io/eslint-plugin-astro/))
   * @default true <=> `astro` package is installed
   */
  astro: AstroEslintConfigOptions;

  /**
   * [Svelte](https://svelte.dev/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-svelte`](https://npmjs.com/eslint-plugin-svelte) ([docs](https://sveltejs.github.io/eslint-plugin-svelte/))
   * @default true <=> `svelte` package is installed
   */
  svelte: SvelteEslintConfigOptions;

  /**
   * [SolidJS](https://svelte.dev/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-solid`](https://npmjs.com/eslint-plugin-solid) ([docs](https://github.com/solidjs-community/eslint-plugin-solid/tree/main?tab=readme-ov-file))
   * @default true <=> `solid-js` package is installed
   */
  solid: SolidEslintConfigOptions;

  /**
   * Plugin for linting `<script>` blocks inside HTML files. It does not have any
   * actual rules.
   *
   * Used plugins:
   * - [`eslint-plugin-html`](https://npmjs.com/eslint-plugin-html) ([docs](https://github.com/BenoitZugmeyer/eslint-plugin-html?tab=ISC-1-ov-file#))
   * @default true
   */
  jsInline: JsInlineEslintConfigOptions;

  /**
   * Rules for linting plain HTML files.
   *
   * Used plugins:
   * - [`@html-eslint/eslint-plugin`](https://npmjs.com/@html-eslint/eslint-plugin) ([docs](https://html-eslint.org/docs/getting-started))
   * @default true <=> `angular` config is **disabled**
   */
  html: HtmlEslintConfigOptions;

  /**
   * ESLint rules related to `Math` and `Number` objects.
   *
   * Used plugins:
   * - [`eslint-plugin-math`](https://npmjs.com/eslint-plugin-math) ([docs](https://ota-meshi.github.io/eslint-plugin-math/))
   * @default true
   */
  math: MathEslintConfigOptions;

  /**
   * ESLint rules related to [GraphQL](https://graphql.org/).
   *
   * Used plugins:
   * - [`eslint-plugin-graphql`](https://npmjs.com/@graphql-eslint/eslint-plugin) ([docs](https://the-guild.dev/graphql/eslint))
   * @default true <=> `graphql` package is installed
   */
  graphql: GraphqlEslintConfigOptions;

  /**
   * ESLint rules related to [TanStack Query](https://tanstack.com/query).
   *
   * Used plugins:
   * - [`@tanstack/eslint-plugin-query`](https://npmjs.com/@tanstack/eslint-plugin-query) ([docs](https://tanstack.com/query/v5/docs/eslint/eslint-plugin-query))
   * @default true <=> `@tanstack/query-core` package is installed (dependency of all `@tanstack/*-query` packages)
   */
  tanstackQuery: TanstackQueryEslintConfigOptions;

  /**
   * ESLint rules related to [Storybook](https://storybook.js.org/).
   *
   * Used plugins:
   * - [`eslint-plugin-storybook`](https://npmjs.com/eslint-plugin-storybook) ([docs](https://storybook.js.org/docs/configure/integration/eslint-plugin))
   * @default true <=> `storybook` package is installed
   */
  storybook: StorybookEslintConfigOptions;

  /**
   * NOTE: disabled by default
   * @default false
   */
  security: SecurityEslintConfigOptions;

  /**
   * NOTE: disabled by default
   * @default false
   */
  preferArrowFunctions: PreferArrowFunctionsEslintConfigOptions;

  /**
   * If enabled, lockfiles (`yarn.lock`, `pnpm-lock.yaml`) will be ignored by default
   *
   * NOTE: disabled by default.
   * @default false
   */
  yaml: YamlEslintConfigOptions;

  /**
   * If enabled, a Rust lockfile (`Cargo.lock`) will be ignored by default
   *
   * NOTE: disabled by default.
   * @default false
   */
  toml: TomlEslintConfigOptions;

  /**
   * NOTE: disabled by default.
   * @default false
   */
  json: JsoncEslintConfigOptions;

  /**
   * NOTE: disabled by default.
   * @default false
   */
  packageJson: PackageJsonEslintConfigOptions;

  /**
   * NOTE: even if enabled, **all** the rules are still disabled by default.
   *
   * NOTE: disabled by default.
   * @default false
   */
  perfectionist: PerfectionistEslintConfigOptions;

  /**
   * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
   *
   * NOTE: disabled by default.
   * @default false
   * @see https://npmjs.com/eslint-plugin-de-morgan
   */
  deMorgan: DeMorganEslintConfigOptions;

  /**
   * Used plugins:
   * - [`eslint-plugin-json-schema-validator`](https://npmjs.com/eslint-plugin-json-schema-validator) ([the single rule docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md))
   *
   * NOTE: disabled by default
   * @default false
   */
  jsonSchemaValidator: JsonSchemaValidatorEslintConfigOptions;

  /**
   * Used plugins:
   * - [`eslint-plugin-case-police`](https://npmjs.com/eslint-plugin-case-police) ([docs](https://github.com/antfu/case-police?tab=coc-ov-file))
   *
   * NOTE: disabled by default
   * @default false
   */
  casePolice: CasePoliceEslintConfigOptions;

  /**
   * Used plugins:
   * - [`eslint-plugin-es-x`](https://npmjs.com/eslint-plugin-es-x) ([docs](https://eslint-community.github.io/eslint-plugin-es-x/))
   *
   * NOTE: disabled by default
   * @default false
   */
  es: EsEslintConfigOptions;

  /**
   * Used plugins:
   * - [`eslint-plugin-node-dependencies`](https://npmjs.com/eslint-plugin-node-dependencies) ([docs](https://ota-meshi.github.io/eslint-plugin-node-dependencies))
   *
   * Note that this plugin is considered experimental.
   *
   * By default will be applied to all `package.json` files.
   * You may only specify JSON files for this config.
   *
   * NOTE: disabled by default
   * @default false
   */
  nodeDependencies: NodeDependenciesEslintConfigOptions;

  /**
   * Enables rules from a plugin to help suggest alternatives to various dependencies.
   *
   * Used plugins:
   * - [`eslint-plugin-depend`](https://npmjs.com/eslint-plugin-depend) ([docs](https://github.com/es-tooling/eslint-plugin-depend?tab=MIT-1-ov-file))
   *
   * NOTE: disabled by default
   * @default false
   */
  depend: DependEslintConfigOptions;

  /**
   * ESLint plugin to granularly enforce TypeScript's [`erasableSyntaxOnly`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-rc/#the---erasablesyntaxonly-option) flag.
   *
   * By default, applied to all TypeScript files.
   *
   * Used plugins:
   * - [`eslint-plugin-erasable-syntax-only`](https://npmjs.com/eslint-plugin-erasable-syntax-only) ([docs](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only?tab=coc-ov-file))
   *
   * NOTE: disabled by default
   * @default false
   */
  erasableSyntaxOnly: ErasableSyntaxOnlyEslintConfigOptions;

  /**
   * A config specific to files meant to be executed. By default, allows `process.exit()`
   * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
   * (on any level).
   * @default true
   */
  cli: CliEslintConfigOptions;

  /**
   * Rules specific to [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html).
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
}

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

  usedPackageManager: Awaited<ReturnType<typeof detectPackageManager>>;
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
