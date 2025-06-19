import fs from 'node:fs/promises';
// eslint-disable-next-line node/no-unsupported-features/node-builtins
import {styleText} from 'node:util';
import consola from 'consola';
import createDebug from 'debug';
import globals from 'globals';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {
  DisableAutofixMethod,
  EslintConfigUnOptions,
  UnConfigContext,
  UnConfigs,
} from './configs';
import {
  DEFAULT_GLOBAL_IGNORES,
  GLOB_CONFIG_FILES,
  GLOB_JS_TS_X_EXTENSION,
  PACKAGES_TO_GET_INFO_FOR,
} from './constants';
import {
  type AllRulesRecordKeys,
  ConfigEntryBuilder,
  type DisableAutofixPrefix,
  type EslintPlugin,
  type FlatConfigEntry,
  createConfigBuilder,
  disableAutofixForAllRulesInPlugin,
  eslintPluginVanillaRules,
  genFlatConfigEntryName,
  resolveOverrides,
} from './eslint';
import {
  LOADABLE_PLUGIN_PREFIXES_LIST,
  PLUGIN_PREFIXES_LIST,
  type PluginPrefix,
  pluginsLoaders,
} from './plugins';
import type {FalsyValue, Promisable} from './types';
import {
  type MaybeArray,
  assignDefaults,
  fetchPackageInfo,
  interopDefault,
  objectEntriesUnsafe,
  omit,
} from './utils';

// TODO debug

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set<string>([
  'curly',
  '@stylistic/quotes',
  'unicorn/template-indent',
  'vue/html-self-closing',
] satisfies AllRulesRecordKeys[]);

const CONFIGS_MISC_GROUP_DISABLED_BY_DEFAULT = new Set<keyof UnConfigs>([
  'security',
  'yaml',
  'toml',
  'json',
  'packageJson',
  'jsonSchemaValidator',
  'casePolice',
  'nodeDependencies',
  'depend',
]);

export const eslintConfigInternal = async (
  options: EslintConfigUnOptions = {},
  internalOptions: {disableAutofixOnly?: boolean} = {},
): Promise<FlatConfigEntry[]> => {
  const logger = consola.withTag('eslint-config-un');
  logger.addReporter({
    log(logObj) {
      if (logObj.type === 'fatal') {
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
      }
    },
  });
  const debug = createDebug('eslint-config-un');

  debug('Initialization');

  const [
    packagesInfoRaw,
    usedPackageManager,
    gitignoreFile,
    eslintPluginTailwind,
    eslintPluginSvelte,
  ] = await Promise.all([
    Object.fromEntries(
      await Promise.all(
        PACKAGES_TO_GET_INFO_FOR.map(async (name) => [name, await fetchPackageInfo(name)] as const),
      ),
    ),
    detectPackageManager(),
    fs.readFile('.gitignore', 'utf8').catch((error: unknown) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }),
    pluginsLoaders.tailwindcss({logger} as UnConfigContext, {doNotThrowIfNotFound: true}),
    pluginsLoaders.svelte({logger} as UnConfigContext),
  ]);
  const packagesInfo = packagesInfoRaw as UnConfigContext['packagesInfo'];

  debug(`Detected package manager: ${usedPackageManager?.name ?? '<not detected>'}`);
  debug(`Found .gitignore file: ${gitignoreFile != null}`);

  const optionsResolved = assignDefaults(options, {
    mode: 'app',
    extraConfigs: [],
    disablePrettierIncompatibleRules: packagesInfo.prettier != null,
    loadPluginsOnDemand: true,
  } satisfies EslintConfigUnOptions);

  const {
    configs: configsOptions = {},
    extraConfigs,
    ignores,
    overrideIgnores,
    pluginRenames = {},
    loadPluginsOnDemand,
    disablePrettierIncompatibleRules,
    defaultConfigsStatus,
  } = optionsResolved;

  const pluginRenamesList = Object.values(pluginRenames);
  if (
    new Set(pluginRenamesList).size !== pluginRenamesList.length ||
    pluginRenamesList.some((v) => PLUGIN_PREFIXES_LIST.includes(v as PluginPrefix))
  ) {
    logger.fatal(
      'Invalid plugin renames: new names must be unique and different from the default plugin prefixes',
    );
  }

  const getIsConfigEnabled = (
    configName: keyof UnConfigs,
    defaultConditionOrPackageInstalled: boolean | (typeof PACKAGES_TO_GET_INFO_FOR)[number] = true,
    preCondition?: {condition: boolean; reason: string},
  ): boolean => {
    let enabled: boolean | undefined;
    let reason: string | undefined;

    if (preCondition) {
      enabled ??= preCondition.condition;
      reason ??= preCondition.reason;
    }
    const providedConfig = configsOptions[configName];
    if (providedConfig != null) {
      enabled ??= Boolean(providedConfig);
      reason ??= 'provided by the user';
    }
    if (defaultConfigsStatus === 'all-disabled') {
      enabled ??= false;
      reason ??= '`defaultConfigsStatus` is set to `all-disabled`';
    }
    if (
      defaultConfigsStatus === 'misc-enabled' &&
      CONFIGS_MISC_GROUP_DISABLED_BY_DEFAULT.has(configName)
    ) {
      enabled ??= true;
      reason ??=
        '`defaultConfigsStatus` is set to `misc-enabled` and the config is in the misc group';
    }
    if (typeof defaultConditionOrPackageInstalled === 'string') {
      const isInstalled = Boolean(packagesInfo[defaultConditionOrPackageInstalled]);
      enabled ??= isInstalled;
      reason ??= `package \`${defaultConditionOrPackageInstalled}\` is ${isInstalled ? 'installed' : 'not installed'}`;
    } else {
      enabled ??= defaultConditionOrPackageInstalled;
      reason ??= `config is ${defaultConditionOrPackageInstalled ? 'enabled' : 'disabled'} by default`;
    }
    debug(
      `Config \`${styleText('blue', configName)}\` is ${enabled ? styleText('green', 'enabled') : styleText('red', 'disabled')} because ${reason}`,
    );
    return enabled;
  };

  const isAngularEnabled = getIsConfigEnabled('angular', '@angular/core');
  const isAstroEnabled = getIsConfigEnabled('astro', 'astro');
  const isAvaEnabled = getIsConfigEnabled('ava', 'ava');
  const isBetterTailwindEnabled = getIsConfigEnabled('betterTailwind', 'tailwindcss');
  const isCasePoliceEnabled = getIsConfigEnabled('casePolice', false);
  const isCliEnabled = getIsConfigEnabled('cli');
  const isCloudfrontFunctionsEnabled = getIsConfigEnabled('cloudfrontFunctions', false);
  const isCssEnabled = getIsConfigEnabled('css', !packagesInfo.stylelint);
  const isCssInJsEnabled = getIsConfigEnabled('cssInJs');
  const isCspellEnabled = getIsConfigEnabled('cspell', false);
  const isCypressEnabled = getIsConfigEnabled('cypress', 'cypress');
  const isDeMorganEnabled = getIsConfigEnabled('deMorgan', false);
  const isDependEnabled = getIsConfigEnabled('depend', false);
  const isEmberEnabled = getIsConfigEnabled('ember', 'ember-source');
  const isErasableSyntaxOnlyEnabled = getIsConfigEnabled('erasableSyntaxOnly', false);
  const isEsEnabled = getIsConfigEnabled('es', false);
  const isEslintCommentsEnabled = getIsConfigEnabled('eslintComments');
  const isEslintPluginEnabled = getIsConfigEnabled('eslintPlugin', false);
  const isGraphqlEnabled = getIsConfigEnabled('graphql', 'graphql');
  const isImportEnabled = getIsConfigEnabled('import');
  // Multiple parsers (in this case, angular and html) cannot be applied to the same file: https://github.com/eslint/eslint/issues/14286
  const isHtmlEnabled = getIsConfigEnabled('html', !isAngularEnabled);
  const isJestEnabled = getIsConfigEnabled('jest', 'jest');
  const isJsEnabled = getIsConfigEnabled('js');
  const isJsInlineEnabled = getIsConfigEnabled('jsInline');
  const isJsdocEnabled = getIsConfigEnabled('jsdoc');
  const isJsoncEnabled = getIsConfigEnabled('json', false);
  const isJsonSchemaValidatorEnabled = getIsConfigEnabled('jsonSchemaValidator', false);
  const isJsxA11yEnabled = getIsConfigEnabled('jsxA11y');
  const isMarkdownEnabled = getIsConfigEnabled('markdown');
  const isMathEnabled = getIsConfigEnabled('math');
  // eslint-disable-next-line case-police/string-check
  const isNextJsEnabled = getIsConfigEnabled('nextJs', 'next');
  const isNodeEnabled = getIsConfigEnabled('node');
  const isNodeDependenciesEnabled = getIsConfigEnabled('nodeDependencies', false);
  const isNoStylisticRulesEnabled = getIsConfigEnabled('noStylisticRules', false);
  const isNoUnsanitizedEnabled = getIsConfigEnabled('noUnsanitized');
  const isPackageJsonEnabled = getIsConfigEnabled('packageJson', false);
  const isPerfectionistEnabled = getIsConfigEnabled('perfectionist', false);
  const isPnpmEnabled = getIsConfigEnabled('pnpm', usedPackageManager?.name === 'pnpm');
  const isPreferArrowFunctionsEnabled = getIsConfigEnabled('preferArrowFunctions', false);
  const isPromiseEnabled = getIsConfigEnabled('promise');
  const isQwikEnabled = getIsConfigEnabled(
    'qwik',
    packagesInfo['@builder.io/qwik'] != null || packagesInfo['@qwik.dev/core'] != null,
  );
  const isReactEnabled = getIsConfigEnabled('react', 'react');
  const isRegexpEnabled = getIsConfigEnabled('regexp');
  const isSecurityEnabled = getIsConfigEnabled('security', false);
  const isSolidEnabled = getIsConfigEnabled('solid', 'solid-js');
  const isSonarEnabled = getIsConfigEnabled('sonar');
  const isStorybookEnabled = getIsConfigEnabled('storybook', 'storybook');
  const isSvelteEnabled = getIsConfigEnabled('svelte', 'svelte', {
    condition: eslintPluginSvelte != null,
    reason: '`eslint-plugin-svelte` cannot be loaded',
  });
  const isTailwindEnabled = getIsConfigEnabled('tailwind', false, {
    condition: eslintPluginTailwind != null,
    reason: '`eslint-plugin-tailwindcss` cannot be loaded',
  });
  const isTanstackQueryEnabled = getIsConfigEnabled('tanstackQuery', '@tanstack/query-core');
  const isTestingLibraryEnabled = getIsConfigEnabled('testingLibrary', '@testing-library/dom');
  const isTomlEnabled = getIsConfigEnabled('toml', false);
  const isTurboEnabled = getIsConfigEnabled('turbo', 'turbo');
  const isTypescriptEnabled = getIsConfigEnabled('ts', 'typescript');
  const isUnicornEnabled = getIsConfigEnabled('unicorn');
  const isUnusedImportsEnabled = getIsConfigEnabled('unusedImports');
  const isVitestEnabled = getIsConfigEnabled('vitest', 'vitest');
  const isVueEnabled = getIsConfigEnabled('vue', 'vue');
  const isYamlEnabled = getIsConfigEnabled('yaml', false);

  const context: UnConfigContext = {
    packagesInfo,
    rootOptions: {
      ...optionsResolved,
      disableAutofixMethod: {
        default: 'unprefixed',
        ...optionsResolved.disableAutofixMethod,
      },
    },
    configsMeta: {
      angular: {enabled: isAngularEnabled},
      astro: {enabled: isAstroEnabled},
      ava: {enabled: isAvaEnabled},
      betterTailwind: {enabled: isBetterTailwindEnabled},
      casePolice: {enabled: isCasePoliceEnabled},
      cli: {enabled: isCliEnabled},
      cloudfrontFunctions: {enabled: isCloudfrontFunctionsEnabled},
      css: {enabled: isCssEnabled},
      cssInJs: {enabled: isCssInJsEnabled},
      cspell: {enabled: isCspellEnabled},
      cypress: {enabled: isCypressEnabled},
      deMorgan: {enabled: isDeMorganEnabled},
      depend: {enabled: isDependEnabled},
      ember: {enabled: isEmberEnabled},
      erasableSyntaxOnly: {enabled: isErasableSyntaxOnlyEnabled},
      es: {enabled: isEsEnabled},
      eslintComments: {enabled: isEslintCommentsEnabled},
      eslintPlugin: {enabled: isEslintPluginEnabled},
      graphql: {enabled: isGraphqlEnabled},
      html: {enabled: isHtmlEnabled},
      import: {enabled: isImportEnabled},
      jest: {enabled: isJestEnabled},
      js: {enabled: isJsEnabled},
      jsInline: {enabled: isJsInlineEnabled},
      jsdoc: {enabled: isJsdocEnabled},
      json: {enabled: isJsoncEnabled},
      jsonSchemaValidator: {enabled: isJsonSchemaValidatorEnabled},
      jsxA11y: {enabled: isJsxA11yEnabled},
      markdown: {enabled: isMarkdownEnabled},
      math: {enabled: isMathEnabled},
      nextJs: {enabled: isNextJsEnabled},
      node: {enabled: isNodeEnabled},
      nodeDependencies: {enabled: isNodeDependenciesEnabled},
      noStylisticRules: {enabled: isNoStylisticRulesEnabled},
      noUnsanitized: {enabled: isNoUnsanitizedEnabled},
      packageJson: {enabled: isPackageJsonEnabled},
      perfectionist: {enabled: isPerfectionistEnabled},
      pnpm: {enabled: isPnpmEnabled},
      preferArrowFunctions: {enabled: isPreferArrowFunctionsEnabled},
      promise: {enabled: isPromiseEnabled},
      qwik: {enabled: isQwikEnabled},
      react: {enabled: isReactEnabled},
      regexp: {enabled: isRegexpEnabled},
      security: {enabled: isSecurityEnabled},
      solid: {enabled: isSolidEnabled},
      sonar: {enabled: isSonarEnabled},
      storybook: {enabled: isStorybookEnabled},
      svelte: {enabled: isSvelteEnabled},
      tailwind: {enabled: isTailwindEnabled},
      tanstackQuery: {enabled: isTanstackQueryEnabled},
      testingLibrary: {enabled: isTestingLibraryEnabled},
      toml: {enabled: isTomlEnabled},
      ts: {enabled: isTypescriptEnabled},
      turbo: {enabled: isTurboEnabled},
      unicorn: {enabled: isUnicornEnabled},
      unusedImports: {enabled: isUnusedImportsEnabled},
      vitest: {enabled: isVitestEnabled},
      vue: {enabled: isVueEnabled},
      yaml: {enabled: isYamlEnabled},
    },
    disabledAutofixes: {},
    usedPlugins: new Set(),
    usedPackageManager,
    logger,
    debug,
  };

  const jsEslintConfigResult =
    isJsEnabled && (await import('./configs/js').then((m) => m.jsUnConfig(context)));
  const vanillaFinalFlatConfigRules =
    // eslint-disable-next-line ts/no-unnecessary-condition -- TODO report?
    (jsEslintConfigResult && jsEslintConfigResult.finalFlatConfigRules) || {};
  const [
    angularEslintConfigResult,
    astroEslintConfigResult,
    vueEslintConfigResult,
    svelteEslintConfigResult,
  ] = await Promise.all([
    isAngularEnabled && import('./configs/angular').then((m) => m.angularUnConfig(context)),
    isAstroEnabled && import('./configs/astro').then((m) => m.astroUnConfig(context)),
    isVueEnabled &&
      import('./configs/vue').then((m) => m.vueUnConfig(context, {vanillaFinalFlatConfigRules})),
    isSvelteEnabled && import('./configs/svelte').then((m) => m.svelteUnConfig(context)),
  ]);
  const tsEslintConfigResult =
    isTypescriptEnabled &&
    (await import('./configs/ts').then((m) =>
      m.tsUnConfig(context, {
        vanillaFinalFlatConfigRules,
        astroResolvedOptions: astroEslintConfigResult
          ? astroEslintConfigResult.optionsResolved
          : null,
        vueResolvedOptions: vueEslintConfigResult ? vueEslintConfigResult.optionsResolved : null,
        svelteResolvedOptions: svelteEslintConfigResult
          ? svelteEslintConfigResult.optionsResolved
          : null,
      }),
    ));

  const rootConfigBuilder = createConfigBuilder(context, {}, '');
  rootConfigBuilder
    ?.addConfig('config-files', {
      files: GLOB_CONFIG_FILES,
    })
    .disableAnyRule('import', 'no-extraneous-dependencies')
    .disableAnyRule('node', 'no-unpublished-require');
  rootConfigBuilder
    ?.addConfig('allow-default-export', {
      files: [
        ...GLOB_CONFIG_FILES,
        // Files starting with a dot
        `**/.*.${GLOB_JS_TS_X_EXTENSION}`,
        // Storybook
        `**/*.stories.${GLOB_JS_TS_X_EXTENSION}`,
        '.storybook/**/*',
      ],
    })
    .disableAnyRule('import', 'no-default-export');

  // According to ESLint docs: "If `ignores` is used without any other keys in the configuration object, then the patterns act as global ignores <...> Patterns are added after the default patterns, which are ["**/node_modules/", ".git/"]." - https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
  const globalIgnores = [...(overrideIgnores ? [] : DEFAULT_GLOBAL_IGNORES), ...(ignores || [])];

  debug(`Globally ignored files: ${JSON.stringify(globalIgnores)}`);

  const unresolvedConfigs = Promise.all([
    globalIgnores.length > 0 && {
      name: genFlatConfigEntryName('ignores-global'),
      ignores: globalIgnores,
    },
    (typeof optionsResolved.gitignore === 'object' || gitignoreFile) &&
      interopDefault(import('eslint-config-flat-gitignore')).then((eslintGitignore) => ({
        name: genFlatConfigEntryName('ignores-gitignore'),
        ...(typeof optionsResolved.gitignore === 'object'
          ? eslintGitignore(optionsResolved.gitignore)
          : gitignoreFile
            ? eslintGitignore()
            : null),
      })),
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
    {
      name: genFlatConfigEntryName('global-setup/language-options/commonjs'),
      files: ['**/*.c[jt]s?(x)'],
      languageOptions: {
        globals: {
          ...globals.commonjs,
        },
      },
    },

    /* Enabled by default or conditionally */
    jsEslintConfigResult,
    isUnicornEnabled && import('./configs/unicorn').then((m) => m.unicornUnConfig(context)),
    isImportEnabled && import('./configs/import').then((m) => m.importUnConfig(context)),
    isNodeEnabled && import('./configs/node').then((m) => m.nodeUnConfig(context)),
    isPromiseEnabled && import('./configs/promise').then((m) => m.promiseUnConfig(context)),
    isSonarEnabled && import('./configs/sonar').then((m) => m.sonarUnConfig(context)),
    isTailwindEnabled && import('./configs/tailwind').then((m) => m.tailwindUnConfig(context)),
    isRegexpEnabled && import('./configs/regexp').then((m) => m.regexpUnConfig(context)),
    isEslintCommentsEnabled &&
      import('./configs/eslint-comments').then((m) => m.eslintCommentsUnConfig(context)),
    isCssInJsEnabled && import('./configs/css-in-js').then((m) => m.cssInJsUnConfig(context)),
    isJestEnabled && import('./configs/jest').then((m) => m.jestUnConfig(context)),
    isVitestEnabled && import('./configs/vitest').then((m) => m.vitestUnConfig(context)),
    isJsdocEnabled && import('./configs/jsdoc').then((m) => m.jsdocUnConfig(context)),
    isQwikEnabled && import('./configs/qwik').then((m) => m.qwikUnConfig(context)),
    isCssEnabled && import('./configs/css').then((m) => m.cssUnConfig(context)),
    isUnusedImportsEnabled &&
      import('./configs/unused-imports').then((m) => m.unusedImportsUnConfig(context)),
    isReactEnabled &&
      import('./configs/react').then((m) =>
        m.reactUnConfig(context, {
          tsFilesTypeAware:
            typeof tsEslintConfigResult === 'object' && tsEslintConfigResult
              ? tsEslintConfigResult.filesTypeAware
              : [],
          tsIgnoresTypeAware:
            typeof tsEslintConfigResult === 'object' && tsEslintConfigResult
              ? tsEslintConfigResult.ignoresTypeAware
              : [],
        }),
      ),
    isJsxA11yEnabled && import('./configs/jsx-a11y').then((m) => m.jsxA11yUnConfig(context)),
    isPnpmEnabled && import('./configs/pnpm').then((m) => m.pnpmUnConfig(context)),
    isNextJsEnabled && import('./configs/nextjs').then((m) => m.nextJsUnConfig(context)),
    isSolidEnabled && import('./configs/solid').then((m) => m.solidUnConfig(context)),
    isJsInlineEnabled && import('./configs/js-inline').then((m) => m.jsInlineUnConfig(context)),
    isHtmlEnabled && import('./configs/html').then((m) => m.htmlUnConfig(context)),
    isMathEnabled && import('./configs/math').then((m) => m.mathUnConfig(context)),
    isTanstackQueryEnabled &&
      import('./configs/tanstack-query').then((m) => m.tanstackQueryUnConfig(context)),
    isAvaEnabled && import('./configs/ava').then((m) => m.avaUnConfig(context)),
    isTestingLibraryEnabled &&
      import('./configs/testing-library').then((m) => m.testingLibraryUnConfig(context)),
    isStorybookEnabled && import('./configs/storybook').then((m) => m.storybookUnConfig(context)),
    isEmberEnabled && import('./configs/ember').then((m) => m.emberUnConfig(context)),
    isCypressEnabled && import('./configs/cypress').then((m) => m.cypressUnConfig(context)),
    isTurboEnabled && import('./configs/turbo').then((m) => m.turboUnConfig(context)),
    isNoUnsanitizedEnabled &&
      import('./configs/no-unsanitized').then((m) => m.noUnsanitizedUnConfig(context)),
    isBetterTailwindEnabled &&
      import('./configs/better-tailwind').then((m) => m.betterTailwindUnConfig(context)),

    /* Disabled by default */
    isSecurityEnabled && import('./configs/security').then((m) => m.securityUnConfig(context)),
    isPreferArrowFunctionsEnabled &&
      import('./configs/prefer-arrow-functions').then((m) =>
        m.preferArrowFunctionsUnConfig(context),
      ),
    isYamlEnabled && import('./configs/yaml').then((m) => m.yamlUnConfig(context)),
    isTomlEnabled && import('./configs/toml').then((m) => m.tomlUnConfig(context)),
    isJsoncEnabled && import('./configs/jsonc').then((m) => m.jsoncUnConfig(context)),
    isPackageJsonEnabled &&
      import('./configs/package-json').then((m) => m.packageJsonUnConfig(context)),
    isPerfectionistEnabled &&
      import('./configs/perfectionist').then((m) => m.perfectionistUnConfig(context)),
    isDeMorganEnabled && import('./configs/de-morgan').then((m) => m.deMorganUnConfig(context)),
    isJsonSchemaValidatorEnabled &&
      import('./configs/json-schema-validator').then((m) => m.jsonSchemaValidatorUnConfig(context)),
    isCasePoliceEnabled &&
      import('./configs/case-police').then((m) => m.casePoliceUnConfig(context)),
    isNodeDependenciesEnabled &&
      import('./configs/node-dependencies').then((m) => m.nodeDependenciesUnConfig(context)),
    isDependEnabled && import('./configs/depend').then((m) => m.dependUnConfig(context)),
    isErasableSyntaxOnlyEnabled &&
      import('./configs/erasable-syntax-only').then((m) => m.erasableSyntaxOnlyUnConfig(context)),
    isCspellEnabled && import('./configs/cspell').then((m) => m.cspellUnConfig(context)),
    isEslintPluginEnabled &&
      import('./configs/eslint-plugin').then((m) => m.eslintPluginUnConfig(context)),

    /* Other configs */
    tsEslintConfigResult, // Must come after all rulesets for vanilla JS
    isEsEnabled && import('./configs/es').then((m) => m.esUnConfig(context)), // Must come after ts
    vueEslintConfigResult, // Must come after ts
    astroEslintConfigResult, // Must come after ts
    angularEslintConfigResult, // Must come after ts
    svelteEslintConfigResult, // Must be after ts
    isGraphqlEnabled && import('./configs/graphql').then((m) => m.graphqlUnConfig(context)),
    isMarkdownEnabled && import('./configs/markdown').then((m) => m.markdownUnConfig(context)), // Must be last

    rootConfigBuilder,

    isCliEnabled && import('./configs/extra/cli').then((m) => m.cliUnConfig(context)),
    isCloudfrontFunctionsEnabled &&
      import('./configs/extra/cloudfront-functions').then((m) =>
        m.cloudfrontFunctionsEslintConfig(context),
      ),

    ...extraConfigs.map((config, configIndex) => ({
      ...omit(config, ['rules']),
      ...(config.rules && {rules: resolveOverrides(context, config.rules)}),
      name: genFlatConfigEntryName(`extra-config/${config.name || `unnamed${configIndex}`}`),
    })),

    // MUST be last
    isNoStylisticRulesEnabled &&
      import('./configs/extra/no-stylistic-rules').then((m) => m.noStylisticRulesUnConfig(context)),
    disablePrettierIncompatibleRules &&
      interopDefault(import('eslint-config-prettier')).then((eslintConfigPrettier) => ({
        name: genFlatConfigEntryName('eslint-config-prettier'),
        rules: Object.fromEntries(
          Object.entries(eslintConfigPrettier.rules).filter(
            ([k]) => !RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER.has(k),
          ),
        ),
      })),
  ] satisfies Promisable<
    | MaybeArray<FlatConfigEntry | ConfigEntryBuilder | FalsyValue>
    | {configs: (ConfigEntryBuilder | null)[]}
  >[]);

  const resolvedConfigs: FlatConfigEntry[] = (await unresolvedConfigs)
    .flat()
    .map((c) =>
      c && 'configs' in c && !(c instanceof ConfigEntryBuilder)
        ? c.configs.map((cc) => cc?.getAllConfigs())
        : c instanceof ConfigEntryBuilder
          ? c.getAllConfigs()
          : c,
    )
    .flat(2)
    // eslint-disable-next-line no-implicit-coercion
    .filter((v) => !!v);

  const disabledAutofixesList = objectEntriesUnsafe(context.disabledAutofixes);
  const defaultDisableAutofixMethod = context.rootOptions.disableAutofixMethod.default;
  const [
    disableAutofixPluginsWithUnprefixedMethod = [],
    disableAutofixPluginsWithPrefixedMethod = [],
  ] = (['unprefixed', 'prefixed'] satisfies DisableAutofixMethod[]).map((autofixDisablingMethod) =>
    disabledAutofixesList
      .map(([pluginPrefix, rules = []]) => {
        const defaultMethodForPlugin =
          context.rootOptions.disableAutofixMethod[pluginPrefix] ?? defaultDisableAutofixMethod;
        const ruleNames: string[] = rules.map((entry) =>
          typeof entry === 'object' ? entry.ruleName : entry,
        );
        const hasRules = rules.some((entry) => {
          const method = typeof entry === 'object' ? entry.method : defaultMethodForPlugin;
          return method === autofixDisablingMethod;
        });
        if (!hasRules) {
          return null;
        }
        return {
          pluginPrefix,
          ruleNames,
        };
      })
      .filter((v) => v != null),
  );
  const usedPluginPrefixes: readonly PluginPrefix[] = loadPluginsOnDemand
    ? [...context.usedPlugins]
    : LOADABLE_PLUGIN_PREFIXES_LIST;

  const loadedPlugins = Object.fromEntries(
    (
      await Promise.all(
        usedPluginPrefixes.map(async (pluginPrefix) => {
          const plugin =
            pluginPrefix in pluginsLoaders
              ? await pluginsLoaders[pluginPrefix as keyof typeof pluginsLoaders](context)
              : null;
          if (pluginPrefix) {
            debug(
              `Plugin \`${styleText('blue', pluginPrefix)}\` loaded, reason: ${loadPluginsOnDemand ? 'used in configs' : '`loadPluginsOnDemand` is set to `false`'}`,
            );
          }
          return plugin ? ([pluginPrefix, plugin] as const) : null;
        }),
      )
    ).filter((v) => v != null),
  );

  const allPlugins = {
    ...loadedPlugins,
    ...(eslintPluginTailwind && {tailwindcss: eslintPluginTailwind as EslintPlugin}),
    ...(eslintPluginSvelte && {svelte: eslintPluginSvelte}),
    ...(angularEslintConfigResult && angularEslintConfigResult.plugins),
  } satisfies Record<string, EslintPlugin> as Partial<Record<PluginPrefix, EslintPlugin>>;

  const disableAutofixPlugin: EslintPlugin = {
    meta: {
      name: 'eslint-plugin-disable-autofix',
    },
    rules: objectEntriesUnsafe({
      ...allPlugins,
      '': eslintPluginVanillaRules,
    }).reduce<EslintPlugin['rules'] & {}>((res, [pluginPrefixCanonical, plugin]) => {
      if (
        plugin &&
        (disableAutofixPluginsWithPrefixedMethod.some(
          (v) => v.pluginPrefix === pluginPrefixCanonical,
        ) ||
          (!loadPluginsOnDemand && defaultDisableAutofixMethod === 'prefixed'))
      ) {
        const pluginPrefix =
          pluginPrefixCanonical === ''
            ? ''
            : context.rootOptions.pluginRenames?.[pluginPrefixCanonical] || pluginPrefixCanonical;
        debug(
          `Created a copy of \`${styleText('blue', pluginPrefix || '<builtin>')}\` plugin's rules with \`disable-autofix\` prefix`,
        );
        return Object.assign(res, disableAutofixForAllRulesInPlugin(pluginPrefix, plugin));
      }
      return res;
    }, {}),
  };

  resolvedConfigs.unshift({
    name: genFlatConfigEntryName('global-setup/plugins'),
    plugins: {
      ...(!internalOptions.disableAutofixOnly &&
        Object.fromEntries(
          objectEntriesUnsafe(allPlugins).map(([pluginPrefixCanonical, plugin]) => {
            const pluginPrefix =
              pluginPrefixCanonical === ''
                ? ''
                : context.rootOptions.pluginRenames?.[pluginPrefixCanonical] ||
                  pluginPrefixCanonical;
            const rulesInfo = disableAutofixPluginsWithUnprefixedMethod.find(
              (v) => v.pluginPrefix === pluginPrefixCanonical,
            );
            if (
              plugin &&
              (rulesInfo || (!loadPluginsOnDemand && defaultDisableAutofixMethod === 'unprefixed'))
            ) {
              if (rulesInfo?.ruleNames) {
                rulesInfo.ruleNames.forEach((ruleNameToDisableAutofixFor) => {
                  debug(
                    `Globally disabling autofix for \`${styleText('blue', pluginPrefix)}/${styleText('green', ruleNameToDisableAutofixFor)}\``,
                  );
                });
              } else {
                debug(
                  `Globally disabling autofix for all rules in plugin \`${styleText('blue', pluginPrefix)}\``,
                );
              }
              return [
                pluginPrefix,
                {
                  ...plugin,
                  rules: disableAutofixForAllRulesInPlugin('', plugin, {
                    includeRulesWithoutAutofix: true,
                    onlyRules: rulesInfo?.ruleNames,
                  }),
                } as typeof plugin,
              ];
            }
            return [pluginPrefix, plugin];
          }),
        )),

      ['disable-autofix' satisfies DisableAutofixPrefix]: disableAutofixPlugin,
    },
  } satisfies FlatConfigEntry);

  debug(`Final config resolved: ${resolvedConfigs.length} flat config items`);

  return resolvedConfigs;
};
