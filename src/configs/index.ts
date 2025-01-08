import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {FlatConfigEntry} from '../eslint';
import type {CssInJsEslintConfigOptions} from './css-in-js';
import type {EslintCommentsEslintConfigOptions} from './eslint-comments';
import type {ImportEslintConfigOptions} from './import';
import type {JestEslintConfigOptions} from './jest';
import type {JsEslintConfigOptions} from './js';
import type {JsdocEslintConfigOptions} from './jsdoc';
import type {JsoncEslintConfigOptions} from './jsonc';
import type {MarkdownEslintConfigOptions} from './markdown';
import type {NodeEslintConfigOptions} from './node';
import type {PackageJsonEslintConfigOptions} from './package-json';
import type {PreferArrowFunctionsEslintConfigOptions} from './prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './promise';
import type {RegexpEslintConfigOptions} from './regexp';
import type {SecurityEslintConfigOptions} from './security';
import type {TailwindEslintConfigOptions} from './tailwind';
import type {TomlEslintConfigOptions} from './toml';
import type {TsEslintConfigOptions} from './ts';
import type {UnicornEslintConfigOptions} from './unicorn';
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
   * @see https://github.com/prettier/eslint-config-prettier
   * @default true
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
    sonar?: boolean | Partial<PromiseEslintConfigOptions>;
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
  };
}

export interface InternalConfigOptions {
  globalOptions?: Omit<EslintConfigUnOptions, 'configs'>;
  isTypescriptEnabled?: boolean;
  vueOptions?: VueEslintConfigOptions;
}