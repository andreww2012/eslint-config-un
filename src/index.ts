import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
// @ts-expect-error no typings
import pluginDisableAutofix from 'eslint-plugin-disable-autofix';
// @ts-expect-error no typings
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import {getPackageInfoSync, isPackageExists} from 'local-pkg';
import {type ImportEslintConfigOptions, importEslintConfig} from './configs/import';
import {jsEslintConfig} from './configs/js';
import {nodeEslintConfig} from './configs/node';
import {promiseEslintConfig} from './configs/promise';
import {regexpEslintConfig} from './configs/regexp';
import {securityEslintConfig} from './configs/security';
import {sonarEslintConfig} from './configs/sonar';
import {tailwindEslintConfig} from './configs/tailwind';
import {type TsEslintConfigOptions, tsEslintConfig} from './configs/ts';
import {type UnicornEslintConfigOptions, unicornEslintConfig} from './configs/unicorn';
import {type VueEslintConfigOptions, vueEslintConfig} from './configs/vue';
import {GLOB_CONFIG_FILES, OFF} from './constants';
import type {EslintConfigOptions, FlatConfigEntry, InternalConfigOptions} from './types';
import {assignOptions, genFlatConfigEntryName} from './utils';

// TODO debug
// TODO: angular, react, eslint-plugin-regexp, eslint-plugin-vitest, eslint-plugin-deprecation, eslint-plugin-prefer-arrow-functions, eslint-plugin-html, eslint-plugin-css
// TODO getPackageInfo async?

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set(['curly', 'unicorn/template-indent']);

export const eslintConfig = (options: EslintConfigOptions = {}): FlatConfigEntry[] => {
  const configsOptions = options.configs || {};

  const isVueEnabled =
    configsOptions.vue !== false && (Boolean(configsOptions.vue) || isPackageExists('vue'));

  const typescriptPackageInfo = getPackageInfoSync('typescript');
  const isTypescriptEnabled =
    configsOptions.ts !== false && Boolean(configsOptions.ts || typescriptPackageInfo);

  /* 🔵 JAVASCRIPT */

  const jsOptions: TsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'js'),
  };

  /* 🔵 TYPESCRIPT */

  const tsOptions: TsEslintConfigOptions = {
    extraFileExtensions: [isVueEnabled && 'vue'].filter((v) => v !== false),
    typescriptVersion: typescriptPackageInfo?.version,
    ...assignOptions(configsOptions, 'ts'),
  };
  tsOptions.tsconfigPath ||= './**/tsconfig*.json';

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
    ...(isTypescriptEnabled && {tsconfigPath: tsOptions.tsconfigPath}),
    ...assignOptions(configsOptions, 'import'),
  };

  /* 🔵 NODE */

  const isNodeEnabled = Boolean(configsOptions.node ?? true);
  const nodeOptions: ImportEslintConfigOptions = {
    ...assignOptions(configsOptions, 'node'),
  };

  /* 🔵 PROMISE */

  const isPromiseEnabled = Boolean(configsOptions.promise ?? true);
  const promiseOptions: ImportEslintConfigOptions = {
    ...assignOptions(configsOptions, 'promise'),
  };

  /* 🔵 SONARJS */

  const isSonarEnabled = Boolean(configsOptions.sonar ?? true);
  const sonarOptions: ImportEslintConfigOptions = {
    ...assignOptions(configsOptions, 'sonar'),
  };

  /* 🔵 TAILWIND */

  const isTailwindEnabled =
    configsOptions.tailwind === false
      ? false
      : configsOptions.tailwind
        ? true
        : isPackageExists('tailwindcss');
  const tailwindOptions: ImportEslintConfigOptions = {
    ...assignOptions(configsOptions, 'tailwind'),
  };

  /* 🔵 REGEXP */

  const isRegexpEnabled = Boolean(configsOptions.regexp ?? true);
  const regexpOptions: ImportEslintConfigOptions = {
    ...assignOptions(configsOptions, 'regexp'),
  };

  /* 🔵 SECURITY */

  const isSecurityEnabled = Boolean(configsOptions.security ?? false);
  const securityOptions: ImportEslintConfigOptions = {
    ...assignOptions(configsOptions, 'security'),
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
        name: genFlatConfigEntryName('global-ignores'),
      },
      {
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          'disable-autofix': pluginDisableAutofix,
          // Used in multiple configs and we can't define plugin multiple times
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          unicorn: eslintPluginUnicorn,
          '@stylistic': eslintPluginStylistic,
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
      isSecurityEnabled && securityEslintConfig(securityOptions, internalOptions),
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
