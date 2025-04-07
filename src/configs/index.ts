import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {FlatConfigEntry} from '../eslint';
import type {PackageInfo} from '../utils';
import type {AngularEslintConfigOptions} from './angular';
import type {CssInJsEslintConfigOptions} from './css-in-js';
import type {DeMorganEslintConfigOptions} from './de-morgan';
import type {EslintCommentsEslintConfigOptions} from './eslint-comments';
import type {CliEslintConfigOptions} from './extra/cli';
import type {ImportEslintConfigOptions} from './import';
import type {JestEslintConfigOptions} from './jest';
import type {JsEslintConfigOptions} from './js';
import type {JsdocEslintConfigOptions} from './jsdoc';
import type {JsonSchemaValidatorEslintConfigOptions} from './json-schema-validator';
import type {JsoncEslintConfigOptions} from './jsonc';
import type {MarkdownEslintConfigOptions} from './markdown';
import type {NodeEslintConfigOptions} from './node';
import type {PackageJsonEslintConfigOptions} from './package-json';
import type {PerfectionistEslintConfigOptions} from './perfectionist';
import type {PreferArrowFunctionsEslintConfigOptions} from './prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './promise';
import type {QwikEslintConfigOptions} from './qwik';
import type {ReactEslintConfigOptions} from './react';
import type {RegexpEslintConfigOptions} from './regexp';
import type {SecurityEslintConfigOptions} from './security';
import type {SonarEslintConfigOptions} from './sonar';
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
  configs?: {
    /**
     * A config specific to files meant to be executed. By default, allows `process.exit()`
     * and `console` methods in files placed in `bin`, `scripts` and `cli` directories
     * (on any level).
     * @default true
     */
    cli?: boolean | Partial<CliEslintConfigOptions>;

    /**
     * @default true
     */
    js?: boolean | Partial<JsEslintConfigOptions>;

    /**
     * @default true
     */
    ts?: boolean | Partial<TsEslintConfigOptions>;

    /**
     * @default true
     */
    unicorn?: boolean | Partial<UnicornEslintConfigOptions>;

    /**
     * @default true
     */
    import?: boolean | Partial<ImportEslintConfigOptions>;

    /**
     * @default true
     */
    node?: boolean | Partial<NodeEslintConfigOptions>;

    /**
     * @default true
     */
    promise?: boolean | Partial<PromiseEslintConfigOptions>;

    /**
     * @default true
     */
    sonar?: boolean | Partial<SonarEslintConfigOptions>;

    /**
     * `false` (do not enable Vue rules) <=> `vue` package is not installed (at any level) or `false` is explicitly passed
     */
    vue?: boolean | Partial<VueEslintConfigOptions>;

    /**
     * `false` (do not enable Tailwind rules) <=> `tailwindcss` package is not installed (at any level) or `false` is explicitly passed
     */
    tailwind?: boolean | Partial<TailwindEslintConfigOptions>;

    /**
     * @default true
     */
    regexp?: boolean | Partial<RegexpEslintConfigOptions>;

    /**
     * @default true
     */
    eslintComments?: boolean | Partial<EslintCommentsEslintConfigOptions>;

    /**
     * @default true
     */
    markdown?: boolean | Partial<MarkdownEslintConfigOptions>;

    /**
     * @default true
     */
    cssInJs?: boolean | Partial<CssInJsEslintConfigOptions>;

    /**
     * @default true if `jest` package is installed
     */
    jest?: boolean | Partial<JestEslintConfigOptions>;

    /**
     * @default true if `vitest` package is installed
     */
    vitest?: boolean | Partial<VitestEslintConfigOptions>;

    /**
     * @default true
     */
    jsdoc?: boolean | Partial<JsdocEslintConfigOptions>;

    /**
     * [qwik](https://qwik.dev/) specific rules.
     *
     * Used plugin:
     * - [`eslint-plugin-qwik`](https://www.npmjs.com/package/eslint-plugin-qwik) ([docs](https://qwik.dev/docs/advanced/eslint))
     * @default true if `@builder.io/qwik` or `@qwik.dev/core` package is installed
     */
    qwik?: boolean | Partial<QwikEslintConfigOptions>;

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
    angular?: boolean | Partial<AngularEslintConfigOptions>;
    /* eslint-enable jsdoc/check-indentation */

    /**
     * CSS specific rules.
     *
     * Used plugin:
     * - [`@eslint/css`](https://www.npmjs.com/package/@eslint/css)
     * @default true unless `stylelint` package is installed
     */
    css?: boolean | Partial<AngularEslintConfigOptions>;

    /**
     * Provides an autofix to remove unused imports.
     *
     * Used plugin:
     * - [`eslint-plugin-unused-imports`](https://www.npmjs.com/package/eslint-plugin-unused-imports)
     * @default true
     */
    unusedImports?: boolean | Partial<UnusedImportsEslintConfigOptions>;

    /**
     * [React](https://react.dev/) specific rules.
     *
     * Used plugin:
     * - [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react)
     * @default true if `react` package is installed
     */
    react?: boolean | Partial<ReactEslintConfigOptions>;

    /**
     * NOTE: disabled by default
     * @default false
     */
    security?: boolean | Partial<SecurityEslintConfigOptions>;

    /**
     * NOTE: disabled by default
     * @default false
     */
    preferArrowFunctions?: boolean | Partial<PreferArrowFunctionsEslintConfigOptions>;

    /**
     * NOTE: disabled by default.
     * If enabled, lockfiles (`yarn.lock`, `pnpm-lock.yaml`) will be ignored by default
     * @default false
     */
    yaml?: boolean | Partial<YamlEslintConfigOptions>;

    /**
     * NOTE: disabled by default.
     * If enabled, a Rust lockfile (`Cargo.lock`) will be ignored by default
     * @default false
     */
    toml?: boolean | Partial<TomlEslintConfigOptions>;

    /**
     * NOTE: disabled by default.
     * @default false
     */
    json?: boolean | Partial<JsoncEslintConfigOptions>;

    /**
     * NOTE: disabled by default.
     * @default false
     */
    packageJson?: boolean | Partial<PackageJsonEslintConfigOptions>;

    /**
     * NOTE: disabled by default.
     *
     * NOTE: even if enabled, **all** the rules are still disabled by default.
     * @default false
     */
    perfectionist?: boolean | Partial<PerfectionistEslintConfigOptions>;

    /**
     * Enforce logical consistency by transforming negated boolean expressions according to De Morgan’s laws.
     *
     * NOTE: disabled by default.
     * @default false
     * @see https://www.npmjs.com/package/eslint-plugin-de-morgan
     */
    deMorgan?: boolean | Partial<DeMorganEslintConfigOptions>;

    /**
     * NOTE: disabled by default
     *
     * Used plugins:
     * - [`eslint-plugin-json-schema-validator`](https://www.npmjs.com/package/eslint-plugin-json-schema-validator) ([the single rule docs](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/main/docs/rules/no-invalid.md))
     * @default false
     */
    jsonSchemaValidator?: boolean | Partial<JsonSchemaValidatorEslintConfigOptions>;
  };
}

export interface InternalConfigOptions {
  globalOptions?: EslintConfigUnOptions;
  isTypescriptEnabled?: boolean;
  typescriptPackageInfo?: PackageInfo;
  vueOptions?: VueEslintConfigOptions;
  isTailwindEnabled?: boolean;
}
