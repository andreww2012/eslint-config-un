import {isMainThread} from 'node:worker_threads';
import consola from 'consola';
import globals from 'globals';
import {createDebug} from 'obug';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {UnConfigs} from '../configs';
import {
  CHECKED_LODASH_METHODS,
  DEFAULT_GLOBAL_IGNORES,
  GLOB_CONFIG_FILES,
  GLOB_JS_TS_X_EXTENSION,
  PACKAGES_TO_GET_INFO_FOR,
} from '../constants';
import {
  type AllEslintRuleNames,
  ConfigEntryBuilder,
  type FlatConfigEntry,
  createConfigBuilder,
  genFlatConfigEntryName,
  isUnFlatConfigEntry,
  resolveOverrides,
} from '../eslint';
import {
  LOADABLE_PLUGIN_PREFIXES_LIST,
  PLUGIN_PREFIXES_LIST,
  type PluginPrefix,
  pluginsLoaders,
} from '../loaders';
import type {FalsyValue, IsOptional, IsUnknown, OmitStrict, PartialDeep} from '../types';
import {
  type MaybeArray,
  arraify,
  assignDefaults,
  fetchPackageInfo,
  interopDefault,
  isInEditor,
  maybeCall,
  objectKeysUnsafe,
  omit,
  readFileSafe,
  styleConfigName,
  styleRuleName,
} from '../utils';
import {
  restoreCacheFromFs,
  restoreCacheFromMemory,
  saveCacheToFs,
  saveCacheToMemory,
} from './cache';
import {getIsConfigEnabled as getIsConfigEnabledContextless} from './config-utils';
import type {FastImportPluginSettings} from './fast-import';
import {resolveConfigAsyncData} from './resolve-config-async-data';
import {
  type EslintConfigUnInternalOptions,
  type EslintConfigUnOptions,
  type ExtraPluginsType,
  type UnConfigContext,
  type UnConfigFn,
  createConfigBuilder as createConfigBuilderWithContext,
} from './shared';

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set<string>([
  'curly',
  '@stylistic/quotes',
  'unicorn/template-indent',
  'vue/html-self-closing',
] satisfies AllEslintRuleNames[]);

const RULES_TO_DISABLE_IN_OFFLINE_MODE = [
  'markdown-links/no-dead-urls',
  'json-schema-validator/no-invalid',
  'node-dependencies/compat-engines',
  'node-dependencies/no-deprecated',
  'node-dependencies/no-restricted-deps',
  'node-dependencies/require-provenance-deps',
] satisfies AllEslintRuleNames[];

const PLUGINS_CONFIG_NAME = genFlatConfigEntryName('global-setup/plugins');

export const eslintConfigInternal = async <const ExtraPlugins extends ExtraPluginsType>(
  options: EslintConfigUnOptions<ExtraPlugins> = {},
  internalOptions: EslintConfigUnInternalOptions = {},
): Promise<FlatConfigEntry[]> => {
  const logger = consola.withTag('eslint-config-un');
  logger.addReporter({
    log(logObj) {
      if (logObj.type === 'fatal') {
        process.exit(1);
      }
    },
  });
  // TODO come up with better solution
  // Prevents logging the same messages when eslint is ran in the concurrent mode
  if (!isMainThread) {
    logger.pauseLogs();
  }

  const debug = createDebug('eslint-config-un');

  debug('Initialization');

  const isRunningInEditor = isInEditor();
  debug(`Is likely running in editor: ${isRunningInEditor}`);

  const optionsResolved = assignDefaults(options, {
    mode: 'app',
    extraConfigs: [],
    loadPluginsOnDemand: true,
    offlineMode: Boolean(process.env['ESLINT_CONFIG_UN_OFFLINE_MODE']),
  } satisfies EslintConfigUnOptions<ExtraPlugins>);

  optionsResolved.cacheConfigs =
    options.cacheConfigs ??
    (isRunningInEditor || Boolean(process.env['ESLINT_CONFIG_UN_CACHE_CONFIGS']));
  const {cacheConfigs} = optionsResolved;
  debug(`Is config caching enabled: ${cacheConfigs}`);

  const usedPackageManager = await detectPackageManager();
  debug(`Detected package manager: ${usedPackageManager?.name ?? '<not detected>'}`);

  const context = Object.freeze({
    packagesInfo: {},
    rootOptions: optionsResolved,
    internalOptions,
    configsMeta: {},
    disabledAutofixes: {},
    usedPlugins: new Set(),
    usedParsers: new Map(),
    usedPackages: new Map(),
    missingPackages: new Set(),
    meta: {usedPackageManager},
    logger,
    debug,
    isTestMode: internalOptions.testMode || Boolean(process.env['ESLINT_CONFIG_UN_TEST_MODE']),
    tests: [],
    createConfigBuilder: createConfigBuilderWithContext,
  } satisfies PartialDeep<Pick<UnConfigContext, 'packagesInfo' | 'configsMeta'>> &
    OmitStrict<
      UnConfigContext,
      'packagesInfo' | 'configsMeta'
    > as unknown as UnConfigContext<ExtraPlugins>);

  if (cacheConfigs) {
    debug('Attempting to restore configs from memory cache');

    const configFromMemoryCache = await restoreCacheFromMemory(context);
    if (configFromMemoryCache) {
      debug('Successfully restored configs from memory cache');
      return configFromMemoryCache.config;
    }

    debug('Attempting to restore configs from file system cache');

    const configFromFsCache = await restoreCacheFromFs(context);
    if (configFromFsCache) {
      debug('Successfully restored configs from file system cache');

      const {plugins, modifyConfigs} = await resolveConfigAsyncData(context, {
        cachedData: configFromFsCache,
      });
      modifyConfigs();

      const pluginConfig = configFromFsCache.configs.find(
        (config) => config.name === PLUGINS_CONFIG_NAME,
      );
      if (pluginConfig) {
        pluginConfig.plugins = plugins;
      }

      const finalConfig = configFromFsCache.configs;

      debug('Saving config restored from the file system cache to memory');
      await saveCacheToMemory(context, {config: finalConfig});

      return finalConfig;
    }

    debug("Could not restore configs from cache - it's either stale or an error occurred");
  }

  const [packagesInfoRaw, gitignoreFile, eslintPluginTailwind, eslintPluginSvelte] =
    await Promise.all([
      Promise.all(
        PACKAGES_TO_GET_INFO_FOR.map(async (name) => [name, await fetchPackageInfo(name)] as const),
      ),
      readFileSafe('.gitignore'),
      pluginsLoaders.tailwindcss(context).then(({module}) => module),
      pluginsLoaders.svelte(context).then(({module}) => module),
    ]);

  const packagesInfo = Object.fromEntries(packagesInfoRaw) as UnConfigContext['packagesInfo'];
  Object.assign(context.packagesInfo, packagesInfo satisfies UnConfigContext['packagesInfo']);

  optionsResolved.disablePrettierIncompatibleRules ??= packagesInfo.prettier != null;

  debug(`Found .gitignore file: ${gitignoreFile != null}`);

  const {
    extraConfigs,
    extraPlugins,
    ignores,
    pluginRenames = {},
    loadPluginsOnDemand,
    disablePrettierIncompatibleRules,
    offlineMode,
    useFastImport,
    linterOptionsNoInlineConfig = false,
    linterOptionsReportUnusedDisableDirectives = 'warn',
    linterOptionsReportUnusedInlineConfigs = 'off',
  } = optionsResolved;

  if (useFastImport) {
    context.usedPlugins.add('fast-import');
  }

  const renamedPlugins = objectKeysUnsafe(pluginRenames);
  const pluginRenamesList = Object.values(pluginRenames);
  const pluginPrefixesAfterRenames = [
    ...PLUGIN_PREFIXES_LIST.filter((prefix) => prefix === '' || !renamedPlugins.includes(prefix)),
    ...pluginRenamesList,
  ];
  if (new Set(pluginPrefixesAfterRenames).size !== pluginPrefixesAfterRenames.length) {
    logger.fatal(
      'Invalid plugin renames: new names must not clash with the default plugin prefixes, have duplicates or be empty. If you happen to have a duplicate new prefix, please choose a different name. If you happen to rename some plugin to one of the default prefixes, you must also rename the plugin corresponding to that prefix.',
    );
  }

  if (
    Object.keys(extraPlugins || {}).some(
      (extraPluginPrefix) =>
        PLUGIN_PREFIXES_LIST.includes(extraPluginPrefix as PluginPrefix) ||
        pluginRenamesList.includes(extraPluginPrefix),
    )
  ) {
    logger.fatal(
      'Invalid extra plugin prefixes: using of built-in plugin prefixes or prefixes from `pluginRenames` is forbidden',
    );
  }

  const getIsConfigEnabled = getIsConfigEnabledContextless.bind(context);

  const isAngularEnabled = getIsConfigEnabled('angular', '@angular/core');

  Object.assign(context.configsMeta, {
    angular: {enabled: isAngularEnabled},
    antfu: {enabled: getIsConfigEnabled('antfu', false)},
    astro: {enabled: getIsConfigEnabled('astro', 'astro')},
    ava: {enabled: getIsConfigEnabled('ava', 'ava')},
    betterTailwind: {enabled: getIsConfigEnabled('betterTailwind', 'tailwindcss')},
    boundaries: {enabled: getIsConfigEnabled('boundaries', false)},
    casePolice: {enabled: getIsConfigEnabled('casePolice', false)},
    checkFile: {enabled: getIsConfigEnabled('checkFile', false)},
    cli: {enabled: getIsConfigEnabled('cli')},
    cloudfrontFunctions: {enabled: getIsConfigEnabled('cloudfrontFunctions', false)},
    command: {enabled: getIsConfigEnabled('command', false)},
    compat: {enabled: getIsConfigEnabled('compat', false)},
    css: {enabled: getIsConfigEnabled('css', !packagesInfo.stylelint)},
    cssInJs: {enabled: getIsConfigEnabled('cssInJs')},
    cspell: {enabled: getIsConfigEnabled('cspell', false)},
    cypress: {enabled: getIsConfigEnabled('cypress', 'cypress')},
    deMorgan: {enabled: getIsConfigEnabled('deMorgan', false)},
    depend: {enabled: getIsConfigEnabled('depend', false)},
    docusaurus: {enabled: getIsConfigEnabled('docusaurus', '@docusaurus/core')},
    fastImport: {enabled: getIsConfigEnabled('fastImport', false)},
    formatJs: {
      enabled: getIsConfigEnabled('formatJs', '@formatjs/icu-messageformat-parser'),
    },
    ember: {enabled: getIsConfigEnabled('ember', 'ember-source')},
    erasableSyntaxOnly: {enabled: getIsConfigEnabled('erasableSyntaxOnly', false)},
    es: {enabled: getIsConfigEnabled('es', false)},
    eslintComments: {enabled: getIsConfigEnabled('eslintComments')},
    eslintPlugin: {enabled: getIsConfigEnabled('eslintPlugin', false)},
    expectType: {enabled: getIsConfigEnabled('expectType', false)},
    fileProgress: {enabled: getIsConfigEnabled('fileProgress', false)},
    graphql: {enabled: getIsConfigEnabled('graphql', 'graphql')},
    header: {enabled: getIsConfigEnabled('header', false)},
    headers: {enabled: getIsConfigEnabled('headers', false)},
    html: {
      // Multiple parsers (in this case, angular and html) cannot be applied to the same file: https://github.com/eslint/eslint/issues/14286
      enabled: getIsConfigEnabled('html', !isAngularEnabled),
    },
    import: {enabled: getIsConfigEnabled('import')},
    importZod: {enabled: getIsConfigEnabled('importZod', false)},
    jest: {enabled: getIsConfigEnabled('jest', 'jest')},
    jestDom: {enabled: getIsConfigEnabled('jestDom', '@testing-library/jest-dom')},
    js: {enabled: getIsConfigEnabled('js')},
    jsInline: {enabled: getIsConfigEnabled('jsInline')},
    jsdoc: {enabled: getIsConfigEnabled('jsdoc')},
    json: {enabled: getIsConfigEnabled('json', false)},
    jsonSchemaValidator: {enabled: getIsConfigEnabled('jsonSchemaValidator', false)},
    jsxA11y: {enabled: getIsConfigEnabled('jsxA11y')},
    lit: {enabled: getIsConfigEnabled('lit', 'lit')},
    markdown: {enabled: getIsConfigEnabled('markdown')},
    markdownLinks: {enabled: getIsConfigEnabled('markdownLinks')},
    markdownPreferences: {enabled: getIsConfigEnabled('markdownPreferences')},
    math: {enabled: getIsConfigEnabled('math')},
    mdx: {enabled: getIsConfigEnabled('mdx')},
    mocha: {enabled: getIsConfigEnabled('mocha', 'mocha')},
    moduleInterop: {enabled: getIsConfigEnabled('moduleInterop')},
    // eslint-disable-next-line case-police/string-check
    nestJs: {enabled: getIsConfigEnabled('nestJs', '@nestjs/core')},
    nextJs: {
      // eslint-disable-next-line case-police/string-check
      enabled: getIsConfigEnabled('nextJs', 'next'),
    },
    node: {enabled: getIsConfigEnabled('node')},
    nodeDependencies: {enabled: getIsConfigEnabled('nodeDependencies', false)},
    noOnlyTests: {enabled: getIsConfigEnabled('noOnlyTests', false)},
    noSecrets: {enabled: getIsConfigEnabled('noSecrets')},
    noStylisticRules: {enabled: getIsConfigEnabled('noStylisticRules', false)},
    noUnsanitized: {enabled: getIsConfigEnabled('noUnsanitized')},
    nx: {enabled: getIsConfigEnabled('nx', 'nx')},
    packageJson: {enabled: getIsConfigEnabled('packageJson')},
    perfectionist: {enabled: getIsConfigEnabled('perfectionist', false)},
    playwright: {enabled: getIsConfigEnabled('playwright', 'playwright')},
    pnpm: {enabled: getIsConfigEnabled('pnpm', usedPackageManager?.name === 'pnpm')},
    preferArrowFunctions: {enabled: getIsConfigEnabled('preferArrowFunctions', false)},
    promise: {enabled: getIsConfigEnabled('promise')},
    qunit: {enabled: getIsConfigEnabled('qunit', 'qunit')},
    qwik: {enabled: getIsConfigEnabled('qwik', ['@builder.io/qwik', '@qwik.dev/core'])},
    react: {enabled: getIsConfigEnabled('react', 'react')},
    regexp: {enabled: getIsConfigEnabled('regexp')},
    rxjs: {enabled: getIsConfigEnabled('rxjs', 'rxjs')},
    security: {enabled: getIsConfigEnabled('security', false)},
    solid: {enabled: getIsConfigEnabled('solid', 'solid-js')},
    sonar: {enabled: getIsConfigEnabled('sonar')},
    storybook: {enabled: getIsConfigEnabled('storybook', 'storybook')},
    stylistic: {enabled: getIsConfigEnabled('stylistic')},
    svelte: {
      enabled: getIsConfigEnabled('svelte', 'svelte', {
        preCondition: [eslintPluginSvelte != null, '`eslint-plugin-svelte` can be loaded'],
      }),
    },
    tailwind: {
      enabled: getIsConfigEnabled('tailwind', false, {
        preCondition: [eslintPluginTailwind != null, '`eslint-plugin-tailwindcss` can be loaded'],
      }),
    },
    tanstackQuery: {enabled: getIsConfigEnabled('tanstackQuery', '@tanstack/query-core')},
    testingLibrary: {enabled: getIsConfigEnabled('testingLibrary', '@testing-library/dom')},
    toml: {enabled: getIsConfigEnabled('toml', false)},
    treeShaking: {enabled: getIsConfigEnabled('treeShaking', false)},
    ts: {enabled: getIsConfigEnabled('ts', 'typescript')},
    turbo: {enabled: getIsConfigEnabled('turbo', 'turbo')},
    unicorn: {enabled: getIsConfigEnabled('unicorn')},
    unnecessaryAbstractions: {enabled: getIsConfigEnabled('unnecessaryAbstractions')},
    unocss: {enabled: getIsConfigEnabled('unocss', 'unocss')},
    un: {enabled: getIsConfigEnabled('un')},
    unusedImports: {enabled: getIsConfigEnabled('unusedImports')},
    vitest: {enabled: getIsConfigEnabled('vitest', 'vitest')},
    vue: {enabled: getIsConfigEnabled('vue', 'vue')},
    webComponents: {enabled: getIsConfigEnabled('webComponents', false)},
    yaml: {enabled: getIsConfigEnabled('yaml', false)},
    youDontNeedLodashUnderscore: {
      enabled: getIsConfigEnabled('youDontNeedLodashUnderscore', [
        'lodash',
        'lodash-es',
        ...CHECKED_LODASH_METHODS.map((method) => `lodash.${method}` as const),
      ]),
    },
    zod: {enabled: getIsConfigEnabled('zod', 'zod|^4')},
  } satisfies UnConfigContext['configsMeta']);

  // TODO try to move to `config-utils`
  const loadUnConfig = async <
    ConfigKey extends keyof UnConfigs,
    ExtraArgument,
    T extends UnConfigFn<ConfigKey, ExtraArgument>,
  >(
    configKey: ConfigKey,
    importer: () => Promise<{default: T}>,
    ...args: IsUnknown<ExtraArgument> extends true
      ? []
      : IsOptional<ExtraArgument> extends true
        ? [extraArgument?: ExtraArgument]
        : [extraArgument: ExtraArgument]
  ): Promise<Awaited<ReturnType<T>> | null> =>
    context.configsMeta[configKey].enabled
      ? // @ts-expect-error weird error
        await Promise.resolve(importer()).then((m) =>
          m.default(
            context,
            context.rootOptions.configs?.[configKey],
            // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
            ...args,
          ),
        )
      : null;

  const jsEslintConfigResult = await loadUnConfig('js', () => import('../configs/js'));
  const vanillaFinalFlatConfigRules = jsEslintConfigResult?.finalFlatConfigRules || {};
  const [astroEslintConfigResult, vueEslintConfigResult, svelteEslintConfigResult] =
    await Promise.all([
      loadUnConfig('astro', () => import('../configs/astro')),
      loadUnConfig('vue', () => import('../configs/vue'), {vanillaFinalFlatConfigRules}),
      loadUnConfig('svelte', () => import('../configs/svelte')),
    ]);
  const tsEslintConfigResult = await loadUnConfig('ts', () => import('../configs/ts'), {
    vanillaFinalFlatConfigRules,
    astroResolvedOptions: astroEslintConfigResult ? astroEslintConfigResult.optionsResolved : null,
    vueResolvedOptions: vueEslintConfigResult ? vueEslintConfigResult.optionsResolved : null,
    svelteResolvedOptions: svelteEslintConfigResult
      ? svelteEslintConfigResult.optionsResolved
      : null,
  });

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
  const globalIgnores = [
    ...(!Array.isArray(ignores) && ignores?.override ? [] : DEFAULT_GLOBAL_IGNORES),
    ...(Array.isArray(ignores) ? ignores : []),
  ];
  debug(`Globally ignored files: ${JSON.stringify(globalIgnores)}`);

  type UnresolvedConfigType =
    | MaybeArray<FlatConfigEntry | ConfigEntryBuilder<ExtraPlugins> | FalsyValue>
    | {configs: (ConfigEntryBuilder<ExtraPlugins> | null)[]};

  /* eslint-disable ts/await-thenable */
  const unresolvedConfigs = Promise.all([
    globalIgnores.length > 0 && {
      name: genFlatConfigEntryName('ignores/global'),
      ignores: globalIgnores,
    },
    (typeof optionsResolved.gitignore === 'object' || gitignoreFile) &&
      interopDefault(import('eslint-config-flat-gitignore')).then((eslintGitignore) => ({
        ...(typeof optionsResolved.gitignore === 'object'
          ? eslintGitignore(optionsResolved.gitignore)
          : gitignoreFile
            ? eslintGitignore()
            : null),
        name: genFlatConfigEntryName('ignores/gitignore'),
      })),
    ...(
      [
        [linterOptionsNoInlineConfig, 'noInlineConfig'],
        [linterOptionsReportUnusedDisableDirectives, 'reportUnusedDisableDirectives'],
        [linterOptionsReportUnusedInlineConfigs, 'reportUnusedInlineConfigs'],
      ] as const
    ).flatMap(([linterOptionConfigs, linterOptionName]) =>
      (typeof linterOptionConfigs === 'object'
        ? arraify(linterOptionConfigs)
        : [{value: linterOptionConfigs}]
      ).map((linterOptionConfig, linterOptionConfigIndex, resolvedLinterOptionConfigs) => ({
        name: genFlatConfigEntryName(
          `global-setup/linter-options/${linterOptionName}${resolvedLinterOptionConfigs.length > 1 ? `/${linterOptionConfigIndex}` : ''}`,
        ),
        ...(linterOptionConfig.files?.length && {files: linterOptionConfig.files}),
        ...(linterOptionConfig.ignores?.length && {ignores: linterOptionConfig.ignores}),
        ...(linterOptionConfig.value != null && {
          linterOptions: {[linterOptionName]: linterOptionConfig.value},
        }),
      })),
    ),
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
    useFastImport && {
      name: genFlatConfigEntryName('global-setup/fast-import'),
      settings: {
        'fast-import': {
          rootDir: import.meta.dirname,
          ...(typeof useFastImport === 'object' && useFastImport.pluginSettings),
        } satisfies FastImportPluginSettings,
      },
    },

    /* Enabled by default or conditionally */
    jsEslintConfigResult,
    loadUnConfig('stylistic', () => import('../configs/stylistic')),
    loadUnConfig('unicorn', () => import('../configs/unicorn')),
    loadUnConfig('import', () => import('../configs/import')),
    loadUnConfig('node', () => import('../configs/node')),
    loadUnConfig('promise', () => import('../configs/promise')),
    loadUnConfig('sonar', () => import('../configs/sonar')),
    loadUnConfig('tailwind', () => import('../configs/tailwind')),
    loadUnConfig('regexp', () => import('../configs/regexp')),
    loadUnConfig('eslintComments', () => import('../configs/eslint-comments')),
    loadUnConfig('cssInJs', () => import('../configs/css-in-js')),
    loadUnConfig('jest', () => import('../configs/jest')),
    loadUnConfig('vitest', () => import('../configs/vitest')),
    loadUnConfig('jsdoc', () => import('../configs/jsdoc')),
    loadUnConfig('qwik', () => import('../configs/qwik')),
    loadUnConfig('css', () => import('../configs/css')),
    loadUnConfig('unusedImports', () => import('../configs/unused-imports')),
    loadUnConfig('react', () => import('../configs/react'), {
      tsFilesTypeAware:
        typeof tsEslintConfigResult === 'object' && tsEslintConfigResult
          ? tsEslintConfigResult.filesTypeAware
          : [],
      tsIgnoresTypeAware:
        typeof tsEslintConfigResult === 'object' && tsEslintConfigResult
          ? tsEslintConfigResult.ignoresTypeAware
          : [],
    }),
    loadUnConfig('jsxA11y', () => import('../configs/jsx-a11y'), undefined),
    loadUnConfig('pnpm', () => import('../configs/pnpm')),
    // eslint-disable-next-line case-police/string-check
    loadUnConfig('nextJs', () => import('../configs/nextjs')),
    loadUnConfig('solid', () => import('../configs/solid')),
    loadUnConfig('jsInline', () => import('../configs/js-inline')),
    loadUnConfig('html', () => import('../configs/html')),
    loadUnConfig('math', () => import('../configs/math')),
    loadUnConfig('tanstackQuery', () => import('../configs/tanstack-query')),
    loadUnConfig('ava', () => import('../configs/ava')),
    loadUnConfig('testingLibrary', () => import('../configs/testing-library')),
    loadUnConfig('storybook', () => import('../configs/storybook')),
    loadUnConfig('ember', () => import('../configs/ember')),
    loadUnConfig('cypress', () => import('../configs/cypress')),
    loadUnConfig('turbo', () => import('../configs/turbo')),
    loadUnConfig('noUnsanitized', () => import('../configs/no-unsanitized')),
    loadUnConfig('betterTailwind', () => import('../configs/better-tailwind')),
    loadUnConfig('mdx', () => import('../configs/mdx')),
    loadUnConfig('playwright', () => import('../configs/playwright')),
    loadUnConfig(
      'youDontNeedLodashUnderscore',
      () => import('../configs/you-dont-need-lodash-underscore'),
    ),
    loadUnConfig('lit', () => import('../configs/lit')),
    loadUnConfig('mocha', () => import('../configs/mocha')),
    loadUnConfig('qunit', () => import('../configs/qunit')),
    loadUnConfig('rxjs', () => import('../configs/rxjs')),
    loadUnConfig('nx', () => import('../configs/nx')),
    loadUnConfig('un', () => import('../configs/un')),
    loadUnConfig('importZod', () => import('../configs/import-zod')),
    loadUnConfig('unocss', () => import('../configs/unocss')),
    loadUnConfig('unnecessaryAbstractions', () => import('../configs/unnecessary-abstractions')),
    loadUnConfig('markdownPreferences', () => import('../configs/markdown-preferences')),
    loadUnConfig('markdownLinks', () => import('../configs/markdown-links')),
    loadUnConfig('zod', () => import('../configs/zod')),
    loadUnConfig('docusaurus', () => import('../configs/docusaurus')),
    loadUnConfig('moduleInterop', () => import('../configs/module-interop')),
    loadUnConfig('noSecrets', () => import('../configs/no-secrets')),
    // eslint-disable-next-line case-police/string-check
    loadUnConfig('nestJs', () => import('../configs/nest-js')),
    loadUnConfig('jestDom', () => import('../configs/jest-dom')),

    /* Disabled by default */
    loadUnConfig('security', () => import('../configs/security')),
    loadUnConfig('preferArrowFunctions', () => import('../configs/prefer-arrow-functions')),
    loadUnConfig('yaml', () => import('../configs/yaml')),
    loadUnConfig('toml', () => import('../configs/toml')),
    loadUnConfig('json', () => import('../configs/jsonc')),
    loadUnConfig('packageJson', () => import('../configs/package-json')),
    loadUnConfig('perfectionist', () => import('../configs/perfectionist')),
    loadUnConfig('deMorgan', () => import('../configs/de-morgan')),
    loadUnConfig('jsonSchemaValidator', () => import('../configs/json-schema-validator')),
    loadUnConfig('casePolice', () => import('../configs/case-police')),
    loadUnConfig('nodeDependencies', () => import('../configs/node-dependencies')),
    loadUnConfig('depend', () => import('../configs/depend')),
    loadUnConfig('erasableSyntaxOnly', () => import('../configs/erasable-syntax-only')),
    loadUnConfig('cspell', () => import('../configs/cspell')),
    loadUnConfig('eslintPlugin', () => import('../configs/eslint-plugin')),
    loadUnConfig('fileProgress', () => import('../configs/file-progress')),
    loadUnConfig('noOnlyTests', () => import('../configs/no-only-tests')),
    loadUnConfig('compat', () => import('../configs/compat')),
    loadUnConfig('webComponents', () => import('../configs/web-components')),
    loadUnConfig('header', () => import('../configs/header')),
    loadUnConfig('headers', () => import('../configs/headers')),
    loadUnConfig('fastImport', () => import('../configs/fast-import')),
    loadUnConfig('boundaries', () => import('../configs/boundaries')),
    loadUnConfig('expectType', () => import('../configs/expect-type')),
    loadUnConfig('command', () => import('../configs/command')),
    loadUnConfig('antfu', () => import('../configs/antfu')),
    loadUnConfig('treeShaking', () => import('../configs/tree-shaking')),

    /* Other configs */
    tsEslintConfigResult, // Must come after all rulesets for vanilla JS
    loadUnConfig('es', () => import('../configs/es'), undefined), // Must come after ts
    vueEslintConfigResult, // Must come after ts
    astroEslintConfigResult, // Must come after ts
    loadUnConfig('angular', () => import('../configs/angular')), // Must come after ts
    svelteEslintConfigResult, // Must be after ts
    loadUnConfig('graphql', () => import('../configs/graphql')),
    loadUnConfig('checkFile', () => import('../configs/check-file')), // Likely should be last
    loadUnConfig('formatJs', () => import('../configs/formatjs')), // Likely should be last
    loadUnConfig('markdown', () => import('../configs/markdown')), // Must be last

    rootConfigBuilder,

    loadUnConfig('cli', () => import('../configs/extra/cli')),
    loadUnConfig('cloudfrontFunctions', () => import('../configs/extra/cloudfront-functions')),

    ...extraConfigs.flatMap((extraConfig, configIndex) => {
      const configName = genFlatConfigEntryName(
        `extra-config/${extraConfig.name || `unnamed${configIndex}`}`,
      );
      const overridesResolved = resolveOverrides(
        context,
        {...extraConfig, name: configName},
        extraConfig.rules,
      );
      const extraConfigFinal: FlatConfigEntry = {
        ...omit(extraConfig, ['rules']),
        ...(extraConfig.rules && {rules: overridesResolved.rules}),
        name: configName,
      };
      return [extraConfigFinal, ...overridesResolved.extraConfigs];
    }),

    // MUST be last
    loadUnConfig('noStylisticRules', () => import('../configs/extra/no-stylistic-rules')),
    disablePrettierIncompatibleRules &&
      interopDefault(import('eslint-config-prettier')).then((eslintConfigPrettier) => ({
        name: genFlatConfigEntryName('eslint-config-prettier'),
        rules: Object.fromEntries(
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-ignore "Expression produces a union type that is too complex to represent" only in tsgo, see https://github.com/microsoft/typescript-go/issues/1100
          Object.entries(eslintConfigPrettier.rules).filter(
            ([k]) => !RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER.has(k),
          ),
        ),
      })),
  ]) as Promise<UnresolvedConfigType[]>;
  /* eslint-enable ts/await-thenable */

  const resolvedConfigs: FlatConfigEntry[] = (await unresolvedConfigs)
    .map((unConfigOrEntryBuilders) =>
      arraify(unConfigOrEntryBuilders).map((configOrBuilder) =>
        configOrBuilder instanceof ConfigEntryBuilder
          ? configOrBuilder.getAllConfigs()
          : configOrBuilder && 'configs' in configOrBuilder
            ? configOrBuilder.configs.map((unConfig) => unConfig?.getAllConfigs())
            : configOrBuilder,
      ),
    )
    .flat(3)
    // eslint-disable-next-line no-implicit-coercion
    .filter((v) => !!v);

  const usedPluginPrefixes: string[] =
    loadPluginsOnDemand === false
      ? LOADABLE_PLUGIN_PREFIXES_LIST
      : // Sorting ensures that plugins will be present in the resulting config in the consistent order every time
        // eslint-disable-next-line unicorn/no-array-sort
        [...context.usedPlugins].sort();
  if (typeof loadPluginsOnDemand === 'object') {
    usedPluginPrefixes.push(...loadPluginsOnDemand.alwaysLoad);
  }
  const usedParserPrefixes = [...context.usedParsers.keys()];
  const usedPackagesPrefixes = [...context.usedPackages.keys()];

  const {plugins, loadedPlugins, modifyConfigs} = await resolveConfigAsyncData(context, {
    usedPluginPrefixes,
    usedParserPrefixes,
    usedPackagesPrefixes,
    missingPackages: [...context.missingPackages.keys()],
  });

  resolvedConfigs.unshift({
    name: PLUGINS_CONFIG_NAME,
    plugins,
  });

  /* Offline mode */

  if (offlineMode) {
    debug(
      `Offline mode is active, the following ${RULES_TO_DISABLE_IN_OFFLINE_MODE.length} rules were disabled: ${RULES_TO_DISABLE_IN_OFFLINE_MODE.map(styleRuleName).join(', ')}`,
    );

    resolvedConfigs.push({
      name: genFlatConfigEntryName('offline-mode'),
      rules: Object.fromEntries(
        // @ts-expect-error "TS2590: Expression produces a union type that is too complex to represent" for whatever reason
        RULES_TO_DISABLE_IN_OFFLINE_MODE.map((ruleName) => [ruleName, 0]),
      ),
    });
  }

  /* Testing */

  if (context.isTestMode) {
    const duplicateConfigNames: string[] = [];
    const uniqueConfigNames = new Set<string>();
    resolvedConfigs.forEach(({name: configName}) => {
      if (!configName) {
        return;
      }
      if (uniqueConfigNames.has(configName)) {
        duplicateConfigNames.push(configName);
      } else {
        uniqueConfigNames.add(configName);
      }
    });

    if (duplicateConfigNames.length > 0) {
      context.tests.push(
        `Duplicate config names found: ${duplicateConfigNames.map(styleConfigName).join(', ')}`,
      );
    }

    const errorMessages = context.tests
      .flatMap((testFn) => maybeCall(testFn, {plugins: loadedPlugins}))
      .filter((v) => v != null)
      .filter(Boolean);

    let errorsCount = 0;
    let warningsCount = 0;
    errorMessages.forEach((errorMessage) => {
      if (typeof errorMessage === 'string') {
        context.logger.error(errorMessage);
        errorsCount += 1;
      } else {
        const {message, severity} = errorMessage;
        context.logger[severity](message);
        if (severity === 'error') {
          errorsCount += 1;
        } else {
          warningsCount += 1;
        }
      }
    });

    if (errorsCount > 0 || warningsCount > 0) {
      context.logger[errorsCount > 0 ? 'fatal' : 'warn'](
        `Test failed with ${[errorsCount > 0 && `${errorsCount} error${errorsCount === 1 ? '' : 's'}`, warningsCount > 0 && `${warningsCount} warning${warningsCount === 1 ? '' : 's'}`].filter(Boolean).join(' and ')}`,
      );
    }
  }

  debug(`Final config resolved: ${resolvedConfigs.length} flat config items`);

  if (cacheConfigs) {
    debug('Attempting to save resolved configs to memory and file system cache');

    await saveCacheToMemory(context, {
      config: resolvedConfigs,
    });

    const configsToCache = [...resolvedConfigs].map((configItem) => {
      if (!isUnFlatConfigEntry(configItem)) {
        return configItem;
      }
      const result = {...configItem};
      if (result.name === PLUGINS_CONFIG_NAME) {
        delete result.plugins;
      }
      return result;
    });

    await saveCacheToFs(context, {
      configs: configsToCache,
      usedPlugins: usedPluginPrefixes,
      usedParsers: new Map(
        [...context.usedParsers.entries()].map(([parserPrefix, configs]) => [
          parserPrefix,
          configs.map((c) => c.name).filter((v) => typeof v === 'string'),
        ]),
      ),
      usedPackages: new Map(
        [...context.usedPackages.entries()].map(([packagePrefix, usedPackagesInfo]) => [
          packagePrefix,
          usedPackagesInfo
            .map(({config, path, info}) => {
              const configName = config.name;
              if (!configName) {
                return null;
              }
              return {
                configName,
                path,
                ...info,
              };
            })
            .filter((v) => v != null),
        ]),
      ),
    });
  }

  // Must be called after cache is written
  modifyConfigs();

  return resolvedConfigs;
};
