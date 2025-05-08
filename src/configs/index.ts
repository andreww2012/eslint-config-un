import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {FlatConfigEntry} from '../eslint';
import type {Promisable} from '../types';
import type {fetchPackageInfo} from '../utils';
import type {AngularEslintConfigOptions} from './angular';
import type {AstroEslintConfigOptions} from './astro';
import type {CasePoliceEslintConfigOptions} from './case-police';
import type {CssEslintConfigOptions} from './css';
import type {CssInJsEslintConfigOptions} from './css-in-js';
import type {DeMorganEslintConfigOptions} from './de-morgan';
import type {EsEslintConfigOptions} from './es';
import type {EslintCommentsEslintConfigOptions} from './eslint-comments';
import type {CliEslintConfigOptions} from './extra/cli';
import type {CloudfrontFunctionsEslintConfigOptions} from './extra/cloudfront-functions';
import type {ImportEslintConfigOptions} from './import';
import type {JestEslintConfigOptions} from './jest';
import type {JsEslintConfigOptions} from './js';
import type {JsdocEslintConfigOptions} from './jsdoc';
import type {JsonSchemaValidatorEslintConfigOptions} from './json-schema-validator';
import type {JsoncEslintConfigOptions} from './jsonc';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {MarkdownEslintConfigOptions} from './markdown';
import type {NextJsEslintConfigOptions} from './nextjs';
import type {NodeEslintConfigOptions} from './node';
import type {PackageJsonEslintConfigOptions} from './package-json';
import type {PerfectionistEslintConfigOptions} from './perfectionist';
import type {PnpmEslintConfigOptions} from './pnpm';
import type {PreferArrowFunctionsEslintConfigOptions} from './prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './promise';
import type {QwikEslintConfigOptions} from './qwik';
import type {ReactEslintConfigOptions} from './react';
import type {RegexpEslintConfigOptions} from './regexp';
import type {SecurityEslintConfigOptions} from './security';
import type {SonarEslintConfigOptions} from './sonar';
import type {SvelteEslintConfigOptions} from './svelte';
import type {TailwindEslintConfigOptions} from './tailwind';
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
   * @default true if `.gitignore` exists
   */
  gitignore?: boolean | FlatGitignoreOptions;

  /**
   * Enables `eslint-config-prettier` at the end of the ruleset.
   * @default true
   * @see https://github.com/prettier/eslint-config-prettier
   */
  disablePrettierIncompatibleRules?: boolean;

  /**
   * Some rules have "warning" level set by default.
   * - Passing here `true` would change the level to "error" for all such rules.
   * - You can also pass an array with rule names to change their level to "error".
   * - Passing `false` does nothing.
   */
  errorsInsteadOfWarnings?: boolean | string[];

  extraConfigs?: FlatConfigEntry[];

  // TODO note about plugins that can be used in multiple places?
  configs?: Partial<UnConfigs>;

  /**
   * Only load ESLint plugins if they are actually used.
   * @default true
   */
  loadPluginsOnDemand?: boolean;
}

export type UnConfigOptions<T extends object> = boolean | Partial<T>;

interface UnConfigs {
  /**
   * @default true
   */
  js: UnConfigOptions<JsEslintConfigOptions>;

  /**
   * @default true
   */
  ts: UnConfigOptions<TsEslintConfigOptions>;

  /**
   * @default true
   */
  unicorn: UnConfigOptions<UnicornEslintConfigOptions>;

  /**
   * @default true
   */
  import: UnConfigOptions<ImportEslintConfigOptions>;

  /**
   * @default true
   */
  node: UnConfigOptions<NodeEslintConfigOptions>;

  /**
   * @default true
   */
  promise: UnConfigOptions<PromiseEslintConfigOptions>;

  /**
   * @default true
   */
  sonar: UnConfigOptions<SonarEslintConfigOptions>;

  /**
   * `false` (do not enable Vue rules) <=> `vue` package is not installed (at any level) or `false` is explicitly passed
   */
  vue: UnConfigOptions<VueEslintConfigOptions>;

  /**
   * `false` (do not enable Tailwind rules) <=> `tailwindcss` package is not installed (at any level) or `false` is explicitly passed
   */
  tailwind: UnConfigOptions<TailwindEslintConfigOptions>;

  /**
   * @default true
   */
  regexp: UnConfigOptions<RegexpEslintConfigOptions>;

  /**
   * @default true
   */
  eslintComments: UnConfigOptions<EslintCommentsEslintConfigOptions>;

  /**
   * @default true
   */
  markdown: UnConfigOptions<MarkdownEslintConfigOptions>;

  /**
   * @default true
   */
  cssInJs: UnConfigOptions<CssInJsEslintConfigOptions>;

  /**
   * @default true if `jest` package is installed
   */
  jest: UnConfigOptions<JestEslintConfigOptions>;

  /**
   * @default true if `vitest` package is installed
   */
  vitest: UnConfigOptions<VitestEslintConfigOptions>;

  /**
   * @default true
   */
  jsdoc: UnConfigOptions<JsdocEslintConfigOptions>;

  /**
   * [qwik](https://qwik.dev/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-qwik`](https://www.npmjs.com/package/eslint-plugin-qwik) ([docs](https://qwik.dev/docs/advanced/eslint))
   * @default true if `@builder.io/qwik` or `@qwik.dev/core` package is installed
   */
  qwik: UnConfigOptions<QwikEslintConfigOptions>;

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
   * Under the hood the config uses [`@angular-eslint/eslint-plugin`](https://www.npmjs.com/package/@angular-eslint/eslint-plugin) and [`@angular-eslint/eslint-plugin-template`](https://www.npmjs.com/package/@angular-eslint/eslint-plugin-template) packages, but not directly.
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
  angular: UnConfigOptions<AngularEslintConfigOptions>;
  /* eslint-enable jsdoc/check-indentation */

  /**
   * CSS specific rules.
   *
   * Used plugin:
   * - [`@eslint/css`](https://www.npmjs.com/package/@eslint/css)
   * @default true unless `stylelint` package is installed
   */
  css: UnConfigOptions<CssEslintConfigOptions>;

  /**
   * Provides an autofix to remove unused imports.
   *
   * Used plugin:
   * - [`eslint-plugin-unused-imports`](https://www.npmjs.com/package/eslint-plugin-unused-imports)
   * @default true
   */
  unusedImports: UnConfigOptions<UnusedImportsEslintConfigOptions>;

  /**
   * [React](https://react.dev/) specific rules.
   *
   * ### Used plugins
   * - [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react)
   * - [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin)
   * **with `@eslint-react` prefix**
   * - [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks)
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
   * @default true if `react` package is installed
   */
  react: UnConfigOptions<ReactEslintConfigOptions>;

  /**
   * Provides accessibility rules for JSX. Applied to all JSX files by default.
   *
   * Note: you may want to disable this config if you're not using JSX for performance reasons.
   *
   * Used plugin:
   * - [`eslint-plugin-jsx-a11y`](https://www.npmjs.com/package/eslint-plugin-jsx-a11y)
   * @default true
   */
  jsxA11y: UnConfigOptions<JsxA11yEslintConfigOptions>;

  /**
   * Rules specific to pnpm package manager.
   *
   * Used plugin:
   * - [`eslint-plugin-pnpm`](https://www.npmjs.com/package/eslint-plugin-pnpm)
   * @default true <=> pnpm is detected as a used package manager by [`package-manager-detector`](https://www.npmjs.com/package/package-manager-detector)
   */
  pnpm: UnConfigOptions<PnpmEslintConfigOptions>;

  /**
   * [Next.js](https://nextjs.org/) specific rules.
   *
   * Used plugin:
   * - [`@next/eslint-plugin-next`](https://www.npmjs.com/package/@next/eslint-plugin-next) ([docs](https://nextjs.org/docs/app/api-reference/config/eslint))
   * @default true <=> `next` package is installed
   */
  nextJs: UnConfigOptions<NextJsEslintConfigOptions>;

  /**
   * [Astro](https://astro.build/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-astro`](https://www.npmjs.com/package/eslint-plugin-astro) ([docs](https://ota-meshi.github.io/eslint-plugin-astro/))
   * @default true <=> `astro` package is installed
   */
  astro: UnConfigOptions<AstroEslintConfigOptions>;

  /**
   * [Svelte](https://svelte.dev/) specific rules.
   *
   * Used plugin:
   * - [`eslint-plugin-svelte`](https://www.npmjs.com/package/eslint-plugin-svelte) ([docs](https://sveltejs.github.io/eslint-plugin-svelte/))
   * @default true <=> `svelte` package is installed
   */
  svelte: UnConfigOptions<SvelteEslintConfigOptions>;

  /**
   * NOTE: disabled by default
   * @default false
   */
  security: UnConfigOptions<SecurityEslintConfigOptions>;

  /**
   * NOTE: disabled by default
   * @default false
   */
  preferArrowFunctions: UnConfigOptions<PreferArrowFunctionsEslintConfigOptions>;

  /**
   * NOTE: disabled by default.
   * If enabled, lockfiles (`yarn.lock`, `pnpm-lock.yaml`) will be ignored by default
   * @default false
   */
  yaml: UnConfigOptions<YamlEslintConfigOptions>;

  /**
   * NOTE: disabled by default.
   * If enabled, a Rust lockfile (`Cargo.lock`) will be ignored by default
   * @default false
   */
  toml: UnConfigOptions<TomlEslintConfigOptions>;

  /**
   * NOTE: disabled by default.
   * @default false
   */
  json: UnConfigOptions<JsoncEslintConfigOptions>;

  /**
   * NOTE: disabled by default.
   * @default false
   */
  packageJson: UnConfigOptions<PackageJsonEslintConfigOptions>;

  /**
   * NOTE: disabled by default.
   *
   * NOTE: even if enabled, **all** the rules are still disabled by default.
   * @default false
   */
  perfectionist: UnConfigOptions<PerfectionistEslintConfigOptions>;

  /**
   * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
   *
   * NOTE: disabled by default.
   * @default false
   * @see https://www.npmjs.com/package/eslint-plugin-de-morgan
   */
  deMorgan: UnConfigOptions<DeMorganEslintConfigOptions>;

  /**
   * NOTE: disabled by default
   *
   * Used plugins:
   * - [`eslint-plugin-json-schema-validator`](https://www.npmjs.com/package/eslint-plugin-json-schema-validator) ([the single rule docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/main/docs/rules/no-invalid.md))
   * @default false
   */
  jsonSchemaValidator: UnConfigOptions<JsonSchemaValidatorEslintConfigOptions>;

  /**
   * NOTE: disabled by default
   *
   * Used plugins:
   * - [`eslint-plugin-case-police`](https://www.npmjs.com/package/eslint-plugin-case-police) ([docs](https://github.com/antfu/case-police?tab=coc-ov-file))
   * @default false
   */
  casePolice: UnConfigOptions<CasePoliceEslintConfigOptions>;

  /**
   * NOTE: disabled by default
   *
   * Used plugins:
   * - [`eslint-plugin-es-x`](https://www.npmjs.com/package/eslint-plugin-es-x) ([docs](https://eslint-community.github.io/eslint-plugin-es-x/))
   * @default false
   */
  es: UnConfigOptions<EsEslintConfigOptions>;

  /**
   * A config specific to files meant to be executed. By default, allows `process.exit()`
   * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
   * (on any level).
   * @default true
   */
  cli: UnConfigOptions<CliEslintConfigOptions>;

  /**
   * Rules specific to [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html).
   * [JavaScript runtime 2.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html) is assumed by default.
   * For functions written for [JavaScript runtime 1.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-10.html),
   * use `configV1` sub-config.
   *
   * Note that if neither `files` or `ignores` are specified or is an empty array in the main
   * or a sub-config, the config won't be generated.
   * @default false
   */
  cloudfrontFunctions: UnConfigOptions<CloudfrontFunctionsEslintConfigOptions>;
}

export interface UnConfigContext {
  packagesInfo: Record<
    (typeof PACKAGES_TO_GET_INFO_FOR)[number],
    Awaited<ReturnType<typeof fetchPackageInfo>>
  >;
  rootOptions: EslintConfigUnOptions;
  configsMeta: Record<keyof UnConfigs, {enabled: boolean}>;
  resolvedConfigs?: Partial<UnConfigs>;
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
      configs: FlatConfigEntry[];
      optionsResolved: UnConfigs[T] & object & {};
    } & ExtraReturnedData)
>;
