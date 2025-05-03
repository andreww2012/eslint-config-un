import fs from 'node:fs/promises';
import eslintGitignore from 'eslint-config-flat-gitignore';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import {getPackageInfo, getPackageInfoSync} from 'local-pkg';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {Promisable} from 'type-fest';
import type {EslintConfigUnOptions, UnConfigContext} from './configs';
import {angularUnConfig} from './configs/angular';
import {astroUnConfig} from './configs/astro';
import {casePoliceUnConfig} from './configs/case-police';
import {cssUnConfig} from './configs/css';
import {cssInJsUnConfig} from './configs/css-in-js';
import {deMorganUnConfig} from './configs/de-morgan';
import {eslintCommentsUnConfig} from './configs/eslint-comments';
import {cliEslintConfig} from './configs/extra/cli';
import {importUnConfig} from './configs/import';
import {jestUnConfig} from './configs/jest';
import {jsUnConfig} from './configs/js';
import {jsdocUnConfig} from './configs/jsdoc';
import {jsonSchemaValidatorUnConfig} from './configs/json-schema-validator';
import {jsoncUnConfig} from './configs/jsonc';
import {jsxA11yUnConfig} from './configs/jsx-a11y';
import {markdownUnConfig} from './configs/markdown';
import {nextJsUnConfig} from './configs/nextjs';
import {nodeUnConfig} from './configs/node';
import {packageJsonUnConfig} from './configs/package-json';
import {perfectionistUnConfig} from './configs/perfectionist';
import {pnpmUnConfig} from './configs/pnpm';
import {preferArrowFunctionsUnConfig} from './configs/prefer-arrow-functions';
import {promiseUnConfig} from './configs/promise';
import {qwikUnConfig} from './configs/qwik';
import {reactUnConfig} from './configs/react';
import {regexpUnConfig} from './configs/regexp';
import {securityUnConfig} from './configs/security';
import {sonarUnConfig} from './configs/sonar';
import {svelteUnConfig} from './configs/svelte';
import {tailwindUnConfig} from './configs/tailwind';
import {tomlUnConfig} from './configs/toml';
import {tsUnConfig} from './configs/ts';
import {unicornUnConfig} from './configs/unicorn';
import {unusedImportsUnConfig} from './configs/unused-imports';
import {vitestUnConfig} from './configs/vitest';
import {vueUnConfig} from './configs/vue';
import {yamlUnConfig} from './configs/yaml';
import {
  DEFAULT_GLOBAL_IGNORES,
  GLOB_CONFIG_FILES,
  GLOB_JS_TS_X_EXTENSION,
  OFF,
  PACKAGES_TO_GET_INFO_FOR,
} from './constants';
import {
  type DisableAutofixPrefix,
  type EslintPlugin,
  type FlatConfigEntry,
  disableAutofixForAllRulesInPlugin,
  eslintPluginVanillaRules,
  genFlatConfigEntryName,
} from './eslint';
import {loadEslintPlugins} from './plugins';
import type {FalsyValue} from './types';
import {type MaybeArray, getPackageMajorVersion, interopDefault} from './utils';

// TODO debug

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

  const [
    packagesInfoRaw,
    usedPackageManager,
    gitignoreFile,
    eslintPluginTailwind,
    eslintPluginSvelte,
  ] = await Promise.all([
    Object.fromEntries(
      await Promise.all(
        PACKAGES_TO_GET_INFO_FOR.map(async (name) => [name, await getPackageInfo(name)] as const),
      ),
    ),
    detectPackageManager(),
    fs.readFile('.gitignore', 'utf8'),
    interopDefault(
      import('eslint-plugin-tailwindcss'),
      // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
      'ERR_PACKAGE_PATH_NOT_EXPORTED',
    ),
    interopDefault(
      import('eslint-plugin-svelte'),
      // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
      ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'],
    ),
  ]);
  const packagesInfo = packagesInfoRaw as UnConfigContext['packagesInfo'];

  const isAstroEnabled = Boolean(configsOptions.astro ?? packagesInfo.astro);
  const isCasePoliceEnabled = Boolean(configsOptions.casePolice ?? false);
  const isCliEnabled = Boolean(configsOptions.cli ?? true);
  const isCssEnabled = Boolean(configsOptions.css ?? getPackageInfoSync('stylelint') == null);
  const isCssInJsEnabled = Boolean(configsOptions.cssInJs ?? true);
  const isDeMorganEnabled = Boolean(configsOptions.deMorgan ?? false);
  const isEslintCommentsEnabled = Boolean(configsOptions.eslintComments ?? true);
  const isImportEnabled = Boolean(configsOptions.import ?? true);
  const isJestEnabled = Boolean(configsOptions.jest ?? packagesInfo.jest);
  const isJsdocEnabled = Boolean(configsOptions.jsdoc ?? true);
  const isJsoncEnabled = Boolean(configsOptions.json ?? false);
  const isJsonSchemaValidatorEnabled = Boolean(configsOptions.jsonSchemaValidator ?? false);
  const isJsxA11yEnabled = Boolean(configsOptions.jsxA11y ?? true);
  const isMarkdownEnabled = Boolean(configsOptions.markdown ?? true);
  const isNextJsEnabled = Boolean(configsOptions.nextJs ?? packagesInfo.next);
  const isNodeEnabled = Boolean(configsOptions.node ?? true);
  const isPackageJsonEnabled = Boolean(configsOptions.packageJson ?? false);
  const isPerfectionistEnabled = Boolean(configsOptions.perfectionist ?? false);
  const isPnpmEnabled = Boolean(configsOptions.pnpm ?? usedPackageManager?.name === 'pnpm');
  const isPreferArrowFunctionsEnabled = Boolean(configsOptions.preferArrowFunctions ?? false);
  const isPromiseEnabled = Boolean(configsOptions.promise ?? true);
  const isQwikEnabled = Boolean(
    configsOptions.qwik ??
      (packagesInfo['@builder.io/qwik'] != null || packagesInfo['@qwik.dev/core'] != null),
  );
  const isReactEnabled = Boolean(configsOptions.react ?? packagesInfo.react);
  const isRegexpEnabled = Boolean(configsOptions.regexp ?? true);
  const isSecurityEnabled = Boolean(configsOptions.security ?? false);
  const isSonarEnabled = Boolean(configsOptions.sonar ?? true);
  const isSvelteEnabled = Boolean(
    eslintPluginSvelte && (configsOptions.svelte ?? packagesInfo.svelte),
  );
  const isTailwindEnabled = Boolean(
    eslintPluginTailwind &&
      (configsOptions.tailwind ??
        (packagesInfo.tailwindcss != null &&
          (getPackageMajorVersion(packagesInfo.tailwindcss) ?? Number.POSITIVE_INFINITY) < 4)),
  );
  const isTomlEnabled = Boolean(configsOptions.toml ?? false);
  const isTypescriptEnabled =
    configsOptions.ts !== false && Boolean(configsOptions.ts || packagesInfo.typescript);
  const isUnicornEnabled = Boolean(configsOptions.unicorn ?? true);
  const isUnusedImportsEnabled = Boolean(configsOptions.unusedImports ?? true);
  const isVitestEnabled = Boolean(configsOptions.vitest ?? packagesInfo.vitest);
  const isVueEnabled =
    configsOptions.vue !== false && Boolean(configsOptions.vue || packagesInfo.vue);
  const isYamlEnabled = Boolean(configsOptions.yaml ?? false);

  const context: UnConfigContext = {
    packagesInfo,
    globalOptions: options,
    enabledConfigs: {
      angular: true, // TODO
      astro: isAstroEnabled,
      casePolice: isCasePoliceEnabled,
      cli: isCliEnabled,
      css: isCssEnabled,
      cssInJs: isCssInJsEnabled,
      deMorgan: isDeMorganEnabled,
      eslintComments: isEslintCommentsEnabled,
      import: isImportEnabled,
      jest: isJestEnabled,
      js: true,
      jsdoc: isJsdocEnabled,
      json: isJsoncEnabled,
      jsonSchemaValidator: isJsonSchemaValidatorEnabled,
      jsxA11y: isJsxA11yEnabled,
      markdown: isMarkdownEnabled,
      nextJs: isNextJsEnabled,
      node: isNodeEnabled,
      packageJson: isPackageJsonEnabled,
      perfectionist: isPerfectionistEnabled,
      pnpm: isPnpmEnabled,
      preferArrowFunctions: isPreferArrowFunctionsEnabled,
      promise: isPromiseEnabled,
      qwik: isQwikEnabled,
      react: isReactEnabled,
      regexp: isRegexpEnabled,
      security: isSecurityEnabled,
      sonar: isSonarEnabled,
      svelte: isSvelteEnabled,
      tailwind: isTailwindEnabled,
      toml: isTomlEnabled,
      ts: isTypescriptEnabled,
      unicorn: isUnicornEnabled,
      unusedImports: isUnusedImportsEnabled,
      vitest: isVitestEnabled,
      vue: isVueEnabled,
      yaml: isYamlEnabled,
    },
  };

  const [
    angularEslintConfigResult,
    astroEslintConfigResult,
    casePoliceEslintConfigResult,
    vueEslintConfigResult,
    svelteEslintConfigResult,
  ] = await Promise.all([
    angularUnConfig(context),
    isAstroEnabled && astroUnConfig(context),
    isCasePoliceEnabled && casePoliceUnConfig(context),
    isVueEnabled && vueUnConfig(context),
    isSvelteEnabled && eslintPluginSvelte && svelteUnConfig(context, {plugin: eslintPluginSvelte}),
  ]);

  const allLoadedEslintPlugins = loadEslintPlugins({
    disableAutofixesForPlugins: [
      casePoliceEslintConfigResult && casePoliceEslintConfigResult.optionsResolved.disableAutofix
        ? 'case-police'
        : '',
    ].filter(Boolean),
  });

  const allPlugins: Record<string, EslintPlugin> = {
    ...allLoadedEslintPlugins,
    ...(eslintPluginTailwind && {tailwindcss: eslintPluginTailwind as EslintPlugin}),
    ...(eslintPluginSvelte && {svelte: eslintPluginSvelte}),
    ...angularEslintConfigResult?.plugins,
  };

  const resolvedConfigs = await Promise.all([
    globalIgnores.length > 0 && {
      name: genFlatConfigEntryName('ignores-global'),
      ignores: globalIgnores,
    },
    {
      name: genFlatConfigEntryName('ignores-gitignore'),
      ...(typeof options.gitignore === 'object'
        ? eslintGitignore(options.gitignore)
        : gitignoreFile
          ? eslintGitignore()
          : null),
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

    jsUnConfig(context),
    isUnicornEnabled && unicornUnConfig(context),
    isImportEnabled && importUnConfig(context),
    isNodeEnabled && nodeUnConfig(context),
    isPromiseEnabled && promiseUnConfig(context),
    isSonarEnabled && sonarUnConfig(context),
    isTailwindEnabled && tailwindUnConfig(context),
    isRegexpEnabled && regexpUnConfig(context),
    isEslintCommentsEnabled && eslintCommentsUnConfig(context),
    isCssInJsEnabled && cssInJsUnConfig(context),
    isJestEnabled && jestUnConfig(context),
    isVitestEnabled && vitestUnConfig(context),
    isJsdocEnabled && jsdocUnConfig(context),
    isQwikEnabled && qwikUnConfig(context),
    isCssEnabled && cssUnConfig(context),
    isUnusedImportsEnabled && unusedImportsUnConfig(context),
    isReactEnabled && reactUnConfig(context),
    isJsxA11yEnabled && jsxA11yUnConfig(context),
    isPnpmEnabled && pnpmUnConfig(context),
    isNextJsEnabled && nextJsUnConfig(context),

    isSecurityEnabled && securityUnConfig(context),
    isPreferArrowFunctionsEnabled && preferArrowFunctionsUnConfig(context),
    isYamlEnabled && yamlUnConfig(context),
    isTomlEnabled && tomlUnConfig(context),
    isJsoncEnabled && jsoncUnConfig(context),
    isPackageJsonEnabled && packageJsonUnConfig(context),
    isPerfectionistEnabled && perfectionistUnConfig(context),
    isDeMorganEnabled && deMorganUnConfig(context),
    isJsonSchemaValidatorEnabled && jsonSchemaValidatorUnConfig(context),
    casePoliceEslintConfigResult && casePoliceEslintConfigResult.configs,

    isTypescriptEnabled &&
      tsUnConfig(context, {
        astroResolvedOptions: astroEslintConfigResult
          ? astroEslintConfigResult.optionsResolved
          : null,
        vueResolvedOptions: vueEslintConfigResult ? vueEslintConfigResult.optionsResolved : null,
        svelteResolvedOptions: svelteEslintConfigResult
          ? svelteEslintConfigResult.optionsResolved
          : null,
      }), // Must come after all rulesets for vanilla JS
    vueEslintConfigResult && vueEslintConfigResult.configs, // Must come after ts
    astroEslintConfigResult && astroEslintConfigResult.configs, // Must come after ts
    angularEslintConfigResult?.configs, // Must come after ts
    svelteEslintConfigResult && svelteEslintConfigResult.configs, // Must be after ts
    isMarkdownEnabled && markdownUnConfig(context), // Must be last

    {
      name: genFlatConfigEntryName('config-files'),
      files: GLOB_CONFIG_FILES,
      rules: {
        'import/no-extraneous-dependencies': OFF,
        'node/no-unpublished-require': OFF,
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

    isCliEnabled && cliEslintConfig(context),

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
  ] satisfies Promisable<
    MaybeArray<FlatConfigEntry | FalsyValue> | {configs: FlatConfigEntry[]}
  >[]);

  return (
    resolvedConfigs
      // eslint-disable-next-line no-implicit-coercion
      .filter((v) => !!v)
      .flatMap((v) => ('configs' in v ? v.configs : v))
  );
};

export {DEFAULT_GLOBAL_IGNORES};

export {isInEditor} from 'is-in-editor';

export type {RuleOptions} from './eslint-types';
