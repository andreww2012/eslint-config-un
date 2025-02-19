import fs from 'node:fs';
import type {ESLint} from 'eslint';
import eslintGitignore from 'eslint-config-flat-gitignore';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import {getPackageInfoSync, isPackageExists} from 'local-pkg';
import type {EslintConfigUnOptions, InternalConfigOptions} from './configs';
import {type CssInJsEslintConfigOptions, cssInJsEslintConfig} from './configs/css-in-js';
import {
  type EslintCommentsEslintConfigOptions,
  eslintCommentsEslintConfig,
} from './configs/eslint-comments';
import {type CliEslintConfigOptions, cliEslintConfig} from './configs/extra/cli';
import {type ImportEslintConfigOptions, importEslintConfig} from './configs/import';
import {type JestEslintConfigOptions, jestEslintConfig} from './configs/jest';
import {type JsEslintConfigOptions, jsEslintConfig} from './configs/js';
import {type JsdocEslintConfigOptions, jsdocEslintConfig} from './configs/jsdoc';
import {type JsoncEslintConfigOptions, jsoncEslintConfig} from './configs/jsonc';
import {type MarkdownEslintConfigOptions, markdownEslintConfig} from './configs/markdown';
import {type NodeEslintConfigOptions, nodeEslintConfig} from './configs/node';
import {type PackageJsonEslintConfigOptions, packageJsonEslintConfig} from './configs/package-json';
import {
  type PerfectionistEslintConfigOptions,
  perfectionistEslintConfig,
} from './configs/perfectionist';
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
import {type VitestEslintConfigOptions, vitestEslintConfig} from './configs/vitest';
import {type VueEslintConfigOptions, vueEslintConfig} from './configs/vue';
import {type YamlEslintConfigOptions, yamlEslintConfig} from './configs/yaml';
import {DEFAULT_GLOBAL_IGNORES, GLOB_CONFIG_FILES, GLOB_JS_TS_X_EXTENSION, OFF} from './constants';
import {
  type FlatConfigEntry,
  disableAutofixForAllRulesInPlugin,
  genFlatConfigEntryName,
} from './eslint';
import {ALL_ESLINT_PLUGINS} from './plugins';
import {assignOptions} from './utils';

// TODO debug
// TODO getPackageInfo async?

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set([
  'curly',
  'unicorn/template-indent',
  '@stylistic/quotes',
]);

export const eslintConfig = (options: EslintConfigUnOptions = {}): FlatConfigEntry[] => {
  // According to ESLint docs: "If `ignores` is used without any other keys in the configuration object, then the patterns act as global ignores <...> Patterns are added after the default patterns, which are ["**/node_modules/", ".git/"]." - https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
  const globalIgnores = [
    ...(options.overrideIgnores ? [] : DEFAULT_GLOBAL_IGNORES),
    ...(options.ignores || []),
  ];

  const configsOptions = options.configs || {};

  const isVueEnabled =
    configsOptions.vue !== false && (Boolean(configsOptions.vue) || isPackageExists('vue'));

  const typescriptPackageInfo = getPackageInfoSync('typescript');
  const isTypescriptEnabled =
    configsOptions.ts !== false && Boolean(configsOptions.ts || typescriptPackageInfo);

  /* 🟢 GITIGNORE */

  const gitignoreConfig =
    typeof options.gitignore === 'object'
      ? eslintGitignore(options.gitignore)
      : fs.existsSync('.gitignore')
        ? eslintGitignore()
        : null;

  /* 🟢 JAVASCRIPT */

  const jsOptions: JsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'js'),
  };

  /* 🟢 TYPESCRIPT */

  const tsOptions: TsEslintConfigOptions = {
    extraFileExtensions: [isVueEnabled && 'vue'].filter((v) => v !== false),
    typescriptVersion: typescriptPackageInfo?.version,
    ...assignOptions(configsOptions, 'ts'),
  };

  /* 🟢 VUE */

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

  const jestPackageInfo = getPackageInfoSync('jest');

  const vitestPackageInfo = getPackageInfoSync('vitest');

  // 🟢🟢🟢 Enabled by default 🟢🟢🟢

  /* 🟢 UNICORN */

  const isUnicornEnabled = Boolean(configsOptions.unicorn ?? true);
  const unicornOptions: UnicornEslintConfigOptions = {
    ...assignOptions(configsOptions, 'unicorn'),
  };

  /* 🟢 IMPORT */

  const isImportEnabled = Boolean(configsOptions.import ?? true);
  const importOptions: ImportEslintConfigOptions = {
    isTypescriptEnabled,
    ...assignOptions(configsOptions, 'import'),
  };

  /* 🟢 NODE */

  const isNodeEnabled = Boolean(configsOptions.node ?? true);
  const nodeOptions: NodeEslintConfigOptions = {
    ...assignOptions(configsOptions, 'node'),
  };

  /* 🟢 PROMISE */

  const isPromiseEnabled = Boolean(configsOptions.promise ?? true);
  const promiseOptions: PromiseEslintConfigOptions = {
    ...assignOptions(configsOptions, 'promise'),
  };

  /* 🟢 SONARJS */

  const isSonarEnabled = Boolean(configsOptions.sonar ?? true);
  const sonarOptions: SonarEslintConfigOptions = {
    ...assignOptions(configsOptions, 'sonar'),
  };

  /* 🟢 TAILWIND */

  const isTailwindEnabled =
    configsOptions.tailwind === false
      ? false
      : configsOptions.tailwind
        ? true
        : isPackageExists('tailwindcss');
  const tailwindOptions: TailwindEslintConfigOptions = {
    ...assignOptions(configsOptions, 'tailwind'),
  };

  /* 🟢 REGEXP */

  const isRegexpEnabled = Boolean(configsOptions.regexp ?? true);
  const regexpOptions: RegexpEslintConfigOptions = {
    ...assignOptions(configsOptions, 'regexp'),
  };

  /* 🟢 ESLINT COMMENTS */

  const isEslintCommentsEnabled = Boolean(configsOptions.eslintComments ?? true);
  const eslintCommentsOptions: EslintCommentsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'eslintComments'),
  };

  /* 🟢 MARKDOWN */

  const isMarkdownEnabled = Boolean(configsOptions.markdown ?? true);
  const markdownOptions: MarkdownEslintConfigOptions = {
    ...assignOptions(configsOptions, 'markdown'),
  };

  /* 🟢 CSS IN JS */

  const isCssInJsEnabled = Boolean(configsOptions.cssInJs ?? true);
  const cssInJsOptions: CssInJsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'cssInJs'),
  };

  /* 🟢 JEST */

  const isJestEnabled = Boolean(configsOptions.jest ?? jestPackageInfo != null);
  const jestOptions: JestEslintConfigOptions = {
    ...assignOptions(configsOptions, 'jest'),
  };

  /* 🟢 VITEST */

  const isVitestEnabled = Boolean(configsOptions.vitest ?? vitestPackageInfo != null);
  const vitestOptions: VitestEslintConfigOptions = {
    ...assignOptions(configsOptions, 'vitest'),
  };

  /* 🟢 JSDOC */

  const isJsdocEnabled = Boolean(configsOptions.jsdoc ?? true);
  const jsdocOptions: JsdocEslintConfigOptions = {
    ...assignOptions(configsOptions, 'jsdoc'),
  };

  // 🔴🔴🔴 Disabled by default 🔴🔴🔴

  /* 🔴 SECURITY */

  const isSecurityEnabled = Boolean(configsOptions.security ?? false);
  const securityOptions: SecurityEslintConfigOptions = {
    ...assignOptions(configsOptions, 'security'),
  };

  /* 🔴 PREFER ARROW FUNCTIONS */

  const isPreferArrowFunctionsEnabled = Boolean(configsOptions.preferArrowFunctions ?? false);
  const preferArrowFunctionsOptions: PreferArrowFunctionsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'preferArrowFunctions'),
  };

  /* 🔴 YAML */

  const isYamlEnabled = Boolean(configsOptions.yaml ?? false);
  const yamlOptions: YamlEslintConfigOptions = {
    ...assignOptions(configsOptions, 'yaml'),
  };

  /* 🔴 TOML */

  const isTomlEnabled = Boolean(configsOptions.toml ?? false);
  const tomlOptions: TomlEslintConfigOptions = {
    ...assignOptions(configsOptions, 'toml'),
  };

  /* 🔴 JSONC */

  const isJsoncEnabled = Boolean(configsOptions.json ?? false);
  const jsoncOptions: JsoncEslintConfigOptions = {
    ...assignOptions(configsOptions, 'json'),
  };

  /* 🔴 PACKAGE-JSON */

  const isPackageJsonEnabled = Boolean(configsOptions.packageJson ?? false);
  const packageJsonOptions: PackageJsonEslintConfigOptions = {
    ...assignOptions(configsOptions, 'packageJson'),
  };

  /* 🔴 PERFECTIONIST */

  const isPerfectionistEnabled = Boolean(configsOptions.perfectionist ?? false);
  const perfectionistOptions: PerfectionistEslintConfigOptions = {
    ...assignOptions(configsOptions, 'perfectionist'),
  };

  // 🔵🔵🔵 "Extra" configs 🔵🔵🔵

  const isCliEnabled = Boolean(configsOptions.cli ?? true);
  const cliOptions: CliEslintConfigOptions = {
    ...assignOptions(configsOptions, 'cli'),
  };

  const internalOptions: InternalConfigOptions = {
    globalOptions: options,
    isTypescriptEnabled,
    vueOptions,
  };

  return (
    [
      globalIgnores.length > 0 && {
        name: genFlatConfigEntryName('ignores-global'),
        ignores: globalIgnores,
      },
      {
        ...gitignoreConfig,
        name: genFlatConfigEntryName('ignores-gitignore'),
      },
      {
        name: genFlatConfigEntryName('global-setup/plugins'),
        plugins: {
          ...ALL_ESLINT_PLUGINS,
          'disable-autofix': {
            meta: {
              name: 'eslint-plugin-disable-autofix',
            },
            rules: Object.entries(ALL_ESLINT_PLUGINS).reduce<ESLint.Plugin['rules'] & {}>(
              (res, [pluginNamespace, plugin]) =>
                Object.assign(res, disableAutofixForAllRulesInPlugin(pluginNamespace, plugin)),
              {},
            ),
          },
        },
      } satisfies FlatConfigEntry,
      {
        name: genFlatConfigEntryName('global-setup/language-options'),
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
      isCssInJsEnabled && cssInJsEslintConfig(cssInJsOptions, internalOptions),
      isJestEnabled && jestEslintConfig(jestOptions, internalOptions),
      isVitestEnabled && vitestEslintConfig(vitestOptions, internalOptions),
      isJsdocEnabled && jsdocEslintConfig(jsdocOptions, internalOptions),
      isSecurityEnabled && securityEslintConfig(securityOptions, internalOptions),
      isPreferArrowFunctionsEnabled &&
        preferArrowFunctionsEslintConfig(preferArrowFunctionsOptions, internalOptions),
      isYamlEnabled && yamlEslintConfig(yamlOptions, internalOptions),
      isTomlEnabled && tomlEslintConfig(tomlOptions, internalOptions),
      isJsoncEnabled && jsoncEslintConfig(jsoncOptions, internalOptions),
      isPackageJsonEnabled && packageJsonEslintConfig(packageJsonOptions, internalOptions),
      isPerfectionistEnabled && perfectionistEslintConfig(perfectionistOptions, internalOptions),
      isTypescriptEnabled && tsEslintConfig(tsOptions, internalOptions), // Must come after all rulesets for vanilla JS
      isVueEnabled && vueEslintConfig(vueOptions, internalOptions), // Must come after ts
      isMarkdownEnabled && markdownEslintConfig(markdownOptions, internalOptions), // Must be last

      {
        name: genFlatConfigEntryName('config-files'),
        files: GLOB_CONFIG_FILES,
        rules: {
          'import/no-extraneous-dependencies': OFF,
          'n/no-unpublished-require': OFF,
        },
      },

      {
        name: genFlatConfigEntryName('allow-default-export'),
        files: [
          ...GLOB_CONFIG_FILES,
          // Files starting with a dot
          `**/.*.${GLOB_JS_TS_X_EXTENSION}`,
          // Storybook
          `**/*.stories.${GLOB_JS_TS_X_EXTENSION}`,
          '.storybook/**/*',
        ],
        rules: {
          'import/no-default-export': OFF,
        },
      },

      isCliEnabled && cliEslintConfig(cliOptions, internalOptions),

      ...(options.extraConfigs || []),

      // MUST be last
      !options.disablePrettierIncompatibleRules && {
        name: genFlatConfigEntryName('eslint-config-prettier'),
        rules: Object.fromEntries(
          Object.entries(eslintConfigPrettier.rules).filter(
            ([k]) => !RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER.has(k),
          ),
        ),
      },
    ]
      // eslint-disable-next-line no-implicit-coercion
      .filter((v) => !!v)
      .flat()
  );
};

export {DEFAULT_GLOBAL_IGNORES};

export {isInEditor} from 'is-in-editor';
