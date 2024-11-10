import fs from 'node:fs';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import type {ESLint} from 'eslint';
import eslintGitignore, {type FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import eslintConfigPrettier from 'eslint-config-prettier';
// @ts-expect-error no typings
import pluginDisableAutofix from 'eslint-plugin-disable-autofix';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import {getPackageInfoSync, isPackageExists} from 'local-pkg';
import {
  type EslintCommentsEslintConfigOptions,
  eslintCommentsEslintConfig,
} from './configs/eslint-comments';
import {type ImportEslintConfigOptions, importEslintConfig} from './configs/import';
import {type JsEslintConfigOptions, jsEslintConfig} from './configs/js';
import {type JsoncEslintConfigOptions, jsoncEslintConfig} from './configs/jsonc';
import {type NodeEslintConfigOptions, nodeEslintConfig} from './configs/node';
import {type PackageJsonEslintConfigOptions, packageJsonEslintConfig} from './configs/package-json';
import {
  type PreferArrowFunctionsEslintConfigOptions,
  preferArrowFunctionsEslintConfig,
} from './configs/prefer-arrow-functions';
import {type PromiseEslintConfigOptions, promiseEslintConfig} from './configs/promise';
import {type RegexpEslintConfigOptions, regexpEslintConfig} from './configs/regexp';
import {type SecurityEslintConfigOptions, securityEslintConfig} from './configs/security';
import {type SonarEslintConfigOptions, sonarEslintConfig} from './configs/sonar';
import {type TailwindEslintConfigOptions, tailwindEslintConfig} from './configs/tailwind';
import {type TomlEslintConfigOptions, tomlEslintConfig} from './configs/toml';
import {type TsEslintConfigOptions, tsEslintConfig} from './configs/ts';
import {type UnicornEslintConfigOptions, unicornEslintConfig} from './configs/unicorn';
import {type VueEslintConfigOptions, vueEslintConfig} from './configs/vue';
import {type YamlEslintConfigOptions, yamlEslintConfig} from './configs/yaml';
import {GLOB_CONFIG_FILES, OFF} from './constants';
import type {FlatConfigEntry, InternalConfigOptions} from './types/eslint';
import {assignOptions, genFlatConfigEntryName} from './utils';

export interface EslintConfigUnOptions {
  /**
   * **Global** ignore patterns
   */
  ignores?: FlatConfigEntry['ignores'];

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

// TODO debug
// TODO getPackageInfo async?

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set(['curly', 'unicorn/template-indent']);

export const eslintConfig = (options: EslintConfigUnOptions = {}): FlatConfigEntry[] => {
  const configsOptions = options.configs || {};

  const isVueEnabled =
    configsOptions.vue !== false && (Boolean(configsOptions.vue) || isPackageExists('vue'));

  const typescriptPackageInfo = getPackageInfoSync('typescript');
  const isTypescriptEnabled =
    configsOptions.ts !== false && Boolean(configsOptions.ts || typescriptPackageInfo);

  /* 🔵 GITIGNORE */

  const gitignoreConfig =
    typeof options.gitignore === 'object'
      ? eslintGitignore(options.gitignore)
      : fs.existsSync('.gitignore')
        ? eslintGitignore()
        : null;

  /* 🔵 JAVASCRIPT */

  const jsOptions: JsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'js'),
  };

  /* 🔵 TYPESCRIPT */

  const tsOptions: TsEslintConfigOptions = {
    extraFileExtensions: [isVueEnabled && 'vue'].filter((v) => v !== false),
    typescriptVersion: typescriptPackageInfo?.version,
    ...assignOptions(configsOptions, 'ts'),
  };

  /* 🔵 VUE */

  const vueFullVersion = getPackageInfoSync('vue')?.version;
  const vueMajorVersionStr = vueFullVersion?.split('.')[0];
  const vueMajorVersion =
    vueMajorVersionStr === '2' ? 2 : vueMajorVersionStr === '3' ? 3 : undefined;

  const nuxtMajorVersionStr = getPackageInfoSync('nuxt')?.version?.split('.')[0];
  const nuxtMajorVersion = nuxtMajorVersionStr === '3' ? 3 : undefined;

  const vueOptions: VueEslintConfigOptions = {
    majorVersion: vueMajorVersion ?? 3,
    fullVersion: vueFullVersion,
    nuxtMajorVersion,
    pinia: isPackageExists('pinia'),
    enforceTypescriptInScriptSection: isTypescriptEnabled,
    ...assignOptions(configsOptions, 'vue'),
  };

  /* 🔵 UNICORN */

  const isUnicornEnabled = Boolean(configsOptions.unicorn ?? true);
  const unicornOptions: UnicornEslintConfigOptions = {
    ...assignOptions(configsOptions, 'unicorn'),
  };

  /* 🔵 IMPORT */

  const isImportEnabled = Boolean(configsOptions.import ?? true);
  const importOptions: ImportEslintConfigOptions = {
    isTypescriptEnabled,
    ...assignOptions(configsOptions, 'import'),
  };

  /* 🔵 NODE */

  const isNodeEnabled = Boolean(configsOptions.node ?? true);
  const nodeOptions: NodeEslintConfigOptions = {
    ...assignOptions(configsOptions, 'node'),
  };

  /* 🔵 PROMISE */

  const isPromiseEnabled = Boolean(configsOptions.promise ?? true);
  const promiseOptions: PromiseEslintConfigOptions = {
    ...assignOptions(configsOptions, 'promise'),
  };

  /* 🔵 SONARJS */

  const isSonarEnabled = Boolean(configsOptions.sonar ?? true);
  const sonarOptions: SonarEslintConfigOptions = {
    ...assignOptions(configsOptions, 'sonar'),
  };

  /* 🔵 TAILWIND */

  const isTailwindEnabled =
    configsOptions.tailwind === false
      ? false
      : configsOptions.tailwind
        ? true
        : isPackageExists('tailwindcss');
  const tailwindOptions: TailwindEslintConfigOptions = {
    ...assignOptions(configsOptions, 'tailwind'),
  };

  /* 🔵 REGEXP */

  const isRegexpEnabled = Boolean(configsOptions.regexp ?? true);
  const regexpOptions: RegexpEslintConfigOptions = {
    ...assignOptions(configsOptions, 'regexp'),
  };

  /* 🔵 ESLINT COMMENTS */

  const isEslintCommentsEnabled = Boolean(configsOptions.eslintComments ?? true);
  const eslintCommentsOptions: EslintCommentsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'eslintComments'),
  };

  /* 🔵 SECURITY */

  const isSecurityEnabled = Boolean(configsOptions.security ?? false);
  const securityOptions: SecurityEslintConfigOptions = {
    ...assignOptions(configsOptions, 'security'),
  };

  /* 🔵 PREFER ARROW FUNCTIONS */

  const isPreferArrowFunctionsEnabled = Boolean(configsOptions.preferArrowFunctions ?? false);
  const preferArrowFunctionsOptions: PreferArrowFunctionsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'preferArrowFunctions'),
  };

  /* 🔵 YAML */

  const isYamlEnabled = Boolean(configsOptions.yaml ?? false);
  const yamlOptions: YamlEslintConfigOptions = {
    ...assignOptions(configsOptions, 'yaml'),
  };

  /* 🔵 TOML */

  const isTomlEnabled = Boolean(configsOptions.toml ?? false);
  const tomlOptions: TomlEslintConfigOptions = {
    ...assignOptions(configsOptions, 'toml'),
  };

  /* 🔵 JSONC */

  const isJsoncEnabled = Boolean(configsOptions.json ?? false);
  const jsoncOptions: JsoncEslintConfigOptions = {
    ...assignOptions(configsOptions, 'json'),
  };

  /* 🔵 PACKAGE-JSON */

  const isPackageJsonEnabled = Boolean(configsOptions.packageJson ?? false);
  const packageJsonOptions: PackageJsonEslintConfigOptions = {
    ...assignOptions(configsOptions, 'packageJson'),
  };

  const internalOptions: InternalConfigOptions = {
    globalOptions: options,
    isTypescriptEnabled,
    vueOptions,
  };

  return (
    [
      // According to ESLint docs: "If `ignores` is used without any other keys in the configuration object, then the patterns act as global ignores <...> Patterns are added after the default patterns, which are ["**/node_modules/", ".git/"]." - https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
      {
        ignores: options.ignores || ['**/dist'],
        name: genFlatConfigEntryName('ignores-global'),
      },
      {
        ...gitignoreConfig,
        name: genFlatConfigEntryName('ignores-gitignore'),
      },
      {
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          'disable-autofix': pluginDisableAutofix,
          // Used in multiple configs and we can't define plugin multiple times
          unicorn: eslintPluginUnicorn,
          '@stylistic': eslintPluginStylistic as ESLint.Plugin,
        },
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          parserOptions: {
            ecmaVersion: 'latest',
            ecmaFeatures: {
              jsx: true,
            },
            sourceType: 'module',
          },
          globals: {
            ...(isNodeEnabled && globals.node),
          },
        } as const,
        name: genFlatConfigEntryName('global-setup'),
      },

      jsEslintConfig(jsOptions, internalOptions),
      isUnicornEnabled && unicornEslintConfig(unicornOptions, internalOptions),
      isImportEnabled && importEslintConfig(importOptions, internalOptions),
      isNodeEnabled && nodeEslintConfig(nodeOptions, internalOptions),
      isPromiseEnabled && promiseEslintConfig(promiseOptions, internalOptions),
      isSonarEnabled && sonarEslintConfig(sonarOptions, internalOptions),
      isTailwindEnabled && tailwindEslintConfig(tailwindOptions, internalOptions),
      isRegexpEnabled && regexpEslintConfig(regexpOptions, internalOptions),
      isEslintCommentsEnabled && eslintCommentsEslintConfig(eslintCommentsOptions, internalOptions),
      isSecurityEnabled && securityEslintConfig(securityOptions, internalOptions),
      isPreferArrowFunctionsEnabled &&
        preferArrowFunctionsEslintConfig(preferArrowFunctionsOptions, internalOptions),
      isYamlEnabled && yamlEslintConfig(yamlOptions, internalOptions),
      isTomlEnabled && tomlEslintConfig(tomlOptions, internalOptions),
      isJsoncEnabled && jsoncEslintConfig(jsoncOptions, internalOptions),
      isPackageJsonEnabled && packageJsonEslintConfig(packageJsonOptions, internalOptions),
      isTypescriptEnabled && tsEslintConfig(tsOptions, internalOptions), // Must come after all rulesets for vanilla JS
      isVueEnabled && vueEslintConfig(vueOptions, internalOptions), // Must come after ts

      {
        files: GLOB_CONFIG_FILES,
        rules: {
          'import/no-default-export': OFF,
          'import/no-extraneous-dependencies': OFF,

          'n/no-unpublished-require': OFF,
        },
        name: genFlatConfigEntryName('config-files'),
      },

      ...(options.extraConfigs || []),

      // MUST be last
      !options.disablePrettierIncompatibleRules && {
        rules: Object.fromEntries(
          Object.entries(eslintConfigPrettier.rules).filter(
            ([k]) => !RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER.has(k),
          ),
        ),
        name: genFlatConfigEntryName('eslint-config-prettier'),
      },
    ]
      // eslint-disable-next-line no-implicit-coercion
      .filter((v) => !!v)
      .flat()
  );
};
