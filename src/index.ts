import fs from 'node:fs';
import eslintGitignore from 'eslint-config-flat-gitignore';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import {getPackageInfo, getPackageInfoSync, isPackageExists} from 'local-pkg';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {EslintConfigUnOptions, InternalConfigOptions} from './configs';
import {type AngularEslintConfigOptions, angularEslintConfig} from './configs/angular';
import {type CasePoliceEslintConfigOptions, casePoliceEslintConfig} from './configs/case-police';
import {type CssEslintConfigOptions, cssEslintConfig} from './configs/css';
import {type CssInJsEslintConfigOptions, cssInJsEslintConfig} from './configs/css-in-js';
import {type DeMorganEslintConfigOptions, deMorganEslintConfig} from './configs/de-morgan';
import {
  type EslintCommentsEslintConfigOptions,
  eslintCommentsEslintConfig,
} from './configs/eslint-comments';
import {type CliEslintConfigOptions, cliEslintConfig} from './configs/extra/cli';
import {type ImportEslintConfigOptions, importEslintConfig} from './configs/import';
import {type JestEslintConfigOptions, jestEslintConfig} from './configs/jest';
import {type JsEslintConfigOptions, jsEslintConfig} from './configs/js';
import {type JsdocEslintConfigOptions, jsdocEslintConfig} from './configs/jsdoc';
import {
  type JsonSchemaValidatorEslintConfigOptions,
  jsonSchemaValidatorEslintConfig,
} from './configs/json-schema-validator';
import {type JsoncEslintConfigOptions, jsoncEslintConfig} from './configs/jsonc';
import {type JsxA11yEslintConfigOptions, jsxA11yEslintConfig} from './configs/jsx-a11y';
import {type MarkdownEslintConfigOptions, markdownEslintConfig} from './configs/markdown';
import {type NextJsEslintConfigOptions, nextJsEslintConfig} from './configs/nextjs';
import {type NodeEslintConfigOptions, nodeEslintConfig} from './configs/node';
import {type PackageJsonEslintConfigOptions, packageJsonEslintConfig} from './configs/package-json';
import {
  type PerfectionistEslintConfigOptions,
  perfectionistEslintConfig,
} from './configs/perfectionist';
import {type PnpmEslintConfigOptions, pnpmEslintConfig} from './configs/pnpm';
import {
  type PreferArrowFunctionsEslintConfigOptions,
  preferArrowFunctionsEslintConfig,
} from './configs/prefer-arrow-functions';
import {type PromiseEslintConfigOptions, promiseEslintConfig} from './configs/promise';
import {type QwikEslintConfigOptions, qwikEslintConfig} from './configs/qwik';
import {type ReactEslintConfigOptions, reactEslintConfig} from './configs/react';
import {type RegexpEslintConfigOptions, regexpEslintConfig} from './configs/regexp';
import {type SecurityEslintConfigOptions, securityEslintConfig} from './configs/security';
import {type SonarEslintConfigOptions, sonarEslintConfig} from './configs/sonar';
import {type TailwindEslintConfigOptions, tailwindEslintConfig} from './configs/tailwind';
import {type TomlEslintConfigOptions, tomlEslintConfig} from './configs/toml';
import {type TsEslintConfigOptions, tsEslintConfig} from './configs/ts';
import {type UnicornEslintConfigOptions, unicornEslintConfig} from './configs/unicorn';
import {
  type UnusedImportsEslintConfigOptions,
  unusedImportsEslintConfig,
} from './configs/unused-imports';
import {type VitestEslintConfigOptions, vitestEslintConfig} from './configs/vitest';
import {type VueEslintConfigOptions, vueEslintConfig} from './configs/vue';
import {type YamlEslintConfigOptions, yamlEslintConfig} from './configs/yaml';
import {DEFAULT_GLOBAL_IGNORES, GLOB_CONFIG_FILES, GLOB_JS_TS_X_EXTENSION, OFF} from './constants';
import {
  type DisableAutofixPrefix,
  type EslintPlugin,
  type FlatConfigEntry,
  disableAutofixForAllRulesInPlugin,
  eslintPluginVanillaRules,
  genFlatConfigEntryName,
} from './eslint';
import {allEslintPlugins} from './plugins';
import {assignOptions, getPackageMajorVersion} from './utils';

// TODO debug
// TODO getPackageInfo async?

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set([
  'curly',
  'unicorn/template-indent',
  '@stylistic/quotes',
]);

export const eslintConfig = async (
  options: EslintConfigUnOptions = {},
): Promise<FlatConfigEntry[]> => {
  // According to ESLint docs: "If `ignores` is used without any other keys in the configuration object, then the patterns act as global ignores <...> Patterns are added after the default patterns, which are ["**/node_modules/", ".git/"]." - https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
  const globalIgnores = [
    ...(options.overrideIgnores ? [] : DEFAULT_GLOBAL_IGNORES),
    ...(options.ignores || []),
  ];

  const configsOptions = options.configs || {};

  const casePoliceOptions: CasePoliceEslintConfigOptions = assignOptions(
    configsOptions,
    'casePolice',
  );

  const [usedPackageManager, allLoadedEslintPlugins, nextJsPackageInfo] = await Promise.all([
    detectPackageManager(),
    allEslintPlugins({
      disableAutofixesForPlugins: [
        (casePoliceOptions.disableAutofix ?? true) ? 'case-police' : '',
      ].filter(Boolean),
    }),
    getPackageInfo('next'),
  ]);

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

  const vuePackageInfo = getPackageInfoSync('vue');
  const vueMajorVersion = getPackageMajorVersion(vuePackageInfo);

  const nuxtPackageInfo = getPackageInfoSync('nuxt');
  const nuxtMajorVersion = getPackageMajorVersion(nuxtPackageInfo);

  const vueOptions: VueEslintConfigOptions = {
    majorVersion: vueMajorVersion === 2 ? 2 : 3, // TODO bad logic
    fullVersion: vuePackageInfo?.version,
    nuxtMajorVersion: nuxtMajorVersion === 3 ? 3 : undefined,
    enforceTypescriptInScriptSection: isTypescriptEnabled,
    ...assignOptions(configsOptions, 'vue'),
  };

  const jestPackageInfo = getPackageInfoSync('jest');

  const vitestPackageInfo = getPackageInfoSync('vitest');

  // We don't need to check for the presence of `@builder.io/qwik-city` because
  // it requires `@builder.io/qwik` to be installed anyway
  const qwikV1PackageInfo = getPackageInfoSync('@builder.io/qwik');
  const qwikV2PackageInfo = getPackageInfoSync('@qwik.dev/core');

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

  const tailwindcssPackageInfo = getPackageInfoSync('tailwindcss');
  const isTailwindEnabled =
    'tailwindcss' in allLoadedEslintPlugins &&
    Boolean(
      configsOptions.tailwind ??
        (tailwindcssPackageInfo != null &&
          (getPackageMajorVersion(tailwindcssPackageInfo) ?? Number.POSITIVE_INFINITY) < 4),
    );
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

  /* 🟢 QWIK */

  const isQwikEnabled = Boolean(
    configsOptions.qwik ?? (qwikV1PackageInfo != null || qwikV2PackageInfo != null),
  );
  const qwikOptions: QwikEslintConfigOptions = {
    ...assignOptions(configsOptions, 'qwik'),
  };

  /* 🟢 ANGULAR */

  const angularOptions: AngularEslintConfigOptions = {
    ...assignOptions(configsOptions, 'angular'),
  };

  /* 🟢 CSS */

  const isCssEnabled = Boolean(configsOptions.css ?? getPackageInfoSync('stylelint') == null);
  const cssOptions: CssEslintConfigOptions = {
    ...assignOptions(configsOptions, 'css'),
  };

  /* 🟢 UNUSED IMPORTS */

  const isUnusedImportsEnabled = Boolean(configsOptions.unusedImports ?? true);
  const unusedImportsOptions: UnusedImportsEslintConfigOptions = {
    ...assignOptions(configsOptions, 'unusedImports'),
  };

  /* 🟢 REACT */

  const reactPackageInfo = getPackageInfoSync('react');

  const isReactEnabled = Boolean(configsOptions.react ?? reactPackageInfo != null);
  const reactOptions: ReactEslintConfigOptions = {
    ...assignOptions(configsOptions, 'react'),
  };

  /* 🟢 JSX-A11Y */

  const isJsxA11yEnabled = Boolean(configsOptions.jsxA11y ?? true);
  const jsxA11yOptions: JsxA11yEslintConfigOptions = {
    ...assignOptions(configsOptions, 'jsxA11y'),
  };

  /* 🟢 PNPM */

  const isPnpmEnabled = Boolean(configsOptions.pnpm ?? usedPackageManager?.name === 'pnpm');
  const pnpmOptions: PnpmEslintConfigOptions = {
    ...assignOptions(configsOptions, 'pnpm'),
  };

  /* 🟢 NEXTJS */

  const isNextJsEnabled = Boolean(configsOptions.nextJs ?? nextJsPackageInfo != null);
  const nextJsOptions: NextJsEslintConfigOptions = {
    // eslint-disable-next-line case-police/string-check
    ...assignOptions(configsOptions, 'nextJs'),
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

  /* 🔴 DE MORGAN */

  const isDeMorganEnabled = Boolean(configsOptions.deMorgan ?? false);
  const deMorganOptions: DeMorganEslintConfigOptions = {
    ...assignOptions(configsOptions, 'deMorgan'),
  };

  /* 🔴 JSON-SCHEMA-VALIDATOR */

  const isJsonSchemaValidatorEnabled = Boolean(configsOptions.jsonSchemaValidator ?? false);
  const jsonSchemaValidatorOptions: JsonSchemaValidatorEslintConfigOptions = {
    ...assignOptions(configsOptions, 'jsonSchemaValidator'),
  };

  /* 🔴 CASE-POLICE */

  const isCasePoliceEnabled = Boolean(configsOptions.casePolice ?? false);

  // 🔵🔵🔵 "Extra" configs 🔵🔵🔵

  const isCliEnabled = Boolean(configsOptions.cli ?? true);
  const cliOptions: CliEslintConfigOptions = {
    ...assignOptions(configsOptions, 'cli'),
  };

  const internalOptions: InternalConfigOptions = {
    globalOptions: options,
    isTypescriptEnabled,
    typescriptPackageInfo,
    vueOptions,
    isTailwindEnabled,
    nextJsPackageInfo,
  };

  const {plugins: angularPlugins, configs: angularConfig} = angularEslintConfig(
    angularOptions,
    internalOptions,
  );

  const allPlugins: Record<string, EslintPlugin> = {
    ...allLoadedEslintPlugins,
    ...angularPlugins,
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
          ...allPlugins,
          ['disable-autofix' satisfies DisableAutofixPrefix]: {
            meta: {
              name: 'eslint-plugin-disable-autofix',
            },
            rules: Object.entries({
              ...allPlugins,
              '': eslintPluginVanillaRules,
            }).reduce<EslintPlugin['rules'] & {}>(
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
      isQwikEnabled && qwikEslintConfig(qwikOptions, internalOptions),
      isCssEnabled && cssEslintConfig(cssOptions, internalOptions),
      isUnusedImportsEnabled && unusedImportsEslintConfig(unusedImportsOptions, internalOptions),
      isReactEnabled && reactEslintConfig(reactOptions, internalOptions),
      isJsxA11yEnabled && jsxA11yEslintConfig(jsxA11yOptions, internalOptions),
      isPnpmEnabled && pnpmEslintConfig(pnpmOptions, internalOptions),
      isNextJsEnabled && nextJsEslintConfig(nextJsOptions, internalOptions),

      isSecurityEnabled && securityEslintConfig(securityOptions, internalOptions),
      isPreferArrowFunctionsEnabled &&
        preferArrowFunctionsEslintConfig(preferArrowFunctionsOptions, internalOptions),
      isYamlEnabled && yamlEslintConfig(yamlOptions, internalOptions),
      isTomlEnabled && tomlEslintConfig(tomlOptions, internalOptions),
      isJsoncEnabled && jsoncEslintConfig(jsoncOptions, internalOptions),
      isPackageJsonEnabled && packageJsonEslintConfig(packageJsonOptions, internalOptions),
      isPerfectionistEnabled && perfectionistEslintConfig(perfectionistOptions, internalOptions),
      isDeMorganEnabled && deMorganEslintConfig(deMorganOptions, internalOptions),
      isJsonSchemaValidatorEnabled &&
        jsonSchemaValidatorEslintConfig(jsonSchemaValidatorOptions, internalOptions),
      isCasePoliceEnabled && casePoliceEslintConfig(casePoliceOptions, internalOptions),

      isTypescriptEnabled && tsEslintConfig(tsOptions, internalOptions), // Must come after all rulesets for vanilla JS
      isVueEnabled && vueEslintConfig(vueOptions, internalOptions), // Must come after ts
      angularConfig, // Must come after ts
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

export type {RuleOptions} from './eslint-types';
