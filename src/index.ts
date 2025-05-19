import fs from 'node:fs/promises';
import eslintGitignore from 'eslint-config-flat-gitignore';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {DisableAutofixMethod, EslintConfigUnOptions, UnConfigContext} from './configs';
import {jsUnConfig} from './configs/js';
import {
  DEFAULT_GLOBAL_IGNORES,
  GLOB_CONFIG_FILES,
  GLOB_JS_TS_X_EXTENSION,
  PACKAGES_TO_GET_INFO_FOR,
} from './constants';
import {
  ConfigEntryBuilder,
  type DisableAutofixPrefix,
  type EslintPlugin,
  type UnFlatConfigEntry,
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
  doesPackageExist,
  fetchPackageInfo,
  objectEntriesUnsafe,
} from './utils';

// TODO debug

const RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER = new Set([
  'curly',
  'unicorn/template-indent',
  '@stylistic/quotes',
]);

// TODO move to a separate file
export const eslintConfigInternal = async (
  options: EslintConfigUnOptions = {},
  internalOptions: {disableAutofixOnly?: boolean} = {},
): Promise<UnFlatConfigEntry[]> => {
  const optionsResolved = assignDefaults(options, {
    mode: 'app',
    extraConfigs: [],
    loadPluginsOnDemand: true,
  } satisfies EslintConfigUnOptions);

  const {
    configs: configsOptions = {},
    extraConfigs,
    ignores,
    overrideIgnores,
    pluginRenames = {},
    loadPluginsOnDemand,
  } = optionsResolved;

  const pluginRenamesList = Object.values(pluginRenames);
  if (
    new Set(pluginRenamesList).size !== pluginRenamesList.length ||
    pluginRenamesList.some((v) => PLUGIN_PREFIXES_LIST.includes(v as PluginPrefix))
  ) {
    throw new Error(
      'Invalid plugin renames: new names must be unique and different from the default plugin prefixes',
    );
  }

  // According to ESLint docs: "If `ignores` is used without any other keys in the configuration object, then the patterns act as global ignores <...> Patterns are added after the default patterns, which are ["**/node_modules/", ".git/"]." - https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
  const globalIgnores = [...(overrideIgnores ? [] : DEFAULT_GLOBAL_IGNORES), ...(ignores || [])];

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
    pluginsLoaders.tailwindcss(),
    pluginsLoaders.svelte(),
  ]);
  const packagesInfo = packagesInfoRaw as UnConfigContext['packagesInfo'];

  const isAngularEnabled = Boolean(configsOptions.angular ?? packagesInfo['@angular/core']);
  const isAstroEnabled = Boolean(configsOptions.astro ?? packagesInfo.astro);
  const isCasePoliceEnabled = Boolean(configsOptions.casePolice ?? false);
  const isCliEnabled = Boolean(configsOptions.cli ?? true);
  const isCloudfrontFunctionsEnabled = Boolean(configsOptions.cloudfrontFunctions ?? false);
  const isCssEnabled = Boolean(configsOptions.css ?? !(await doesPackageExist('stylelint')));
  const isCssInJsEnabled = Boolean(configsOptions.cssInJs ?? true);
  const isDeMorganEnabled = Boolean(configsOptions.deMorgan ?? false);
  const isDependEnabled = Boolean(configsOptions.depend ?? false);
  const isEsEnabled = Boolean(configsOptions.es ?? false);
  const isEslintCommentsEnabled = Boolean(configsOptions.eslintComments ?? true);
  const isJsInlineEnabled = Boolean(configsOptions.jsInline ?? true);
  const isImportEnabled = Boolean(configsOptions.import ?? true);
  // Multiple parsers (in this case, angular and html) cannot be applied to the same file: https://github.com/eslint/eslint/issues/14286
  const isHtmlEnabled = Boolean(configsOptions.html ?? !isAngularEnabled);
  const isJestEnabled = Boolean(configsOptions.jest ?? packagesInfo.jest);
  const isJsdocEnabled = Boolean(configsOptions.jsdoc ?? true);
  const isJsoncEnabled = Boolean(configsOptions.json ?? false);
  const isJsonSchemaValidatorEnabled = Boolean(configsOptions.jsonSchemaValidator ?? false);
  const isJsxA11yEnabled = Boolean(configsOptions.jsxA11y ?? true);
  const isMarkdownEnabled = Boolean(configsOptions.markdown ?? true);
  const isMathEnabled = Boolean(configsOptions.math ?? true);
  const isNextJsEnabled = Boolean(configsOptions.nextJs ?? packagesInfo.next);
  const isNodeEnabled = Boolean(configsOptions.node ?? true);
  const isNodeDependenciesEnabled = Boolean(configsOptions.nodeDependencies ?? false);
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
  const isSolidEnabled = Boolean(configsOptions.solid ?? packagesInfo['solid-js'] != null);
  const isSonarEnabled = Boolean(configsOptions.sonar ?? true);
  const isSvelteEnabled = Boolean(
    eslintPluginSvelte && (configsOptions.svelte ?? packagesInfo.svelte),
  );
  const isTailwindEnabled = Boolean(
    eslintPluginTailwind &&
      (configsOptions.tailwind ??
        (packagesInfo.tailwindcss != null &&
          (packagesInfo.tailwindcss.versions.major ?? Number.POSITIVE_INFINITY) < 4)),
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
    rootOptions: {
      ...optionsResolved,
      disableAutofixMethod: {
        default: 'plugin-copy',
        ...optionsResolved.disableAutofixMethod,
      },
    },
    configsMeta: {
      angular: {enabled: isAngularEnabled},
      astro: {enabled: isAstroEnabled},
      casePolice: {enabled: isCasePoliceEnabled},
      cli: {enabled: isCliEnabled},
      cloudfrontFunctions: {enabled: isCloudfrontFunctionsEnabled},
      css: {enabled: isCssEnabled},
      cssInJs: {enabled: isCssInJsEnabled},
      deMorgan: {enabled: isDeMorganEnabled},
      depend: {enabled: isDependEnabled},
      es: {enabled: isEsEnabled},
      eslintComments: {enabled: isEslintCommentsEnabled},
      html: {enabled: isHtmlEnabled},
      import: {enabled: isImportEnabled},
      jest: {enabled: isJestEnabled},
      js: {enabled: true},
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
      svelte: {enabled: isSvelteEnabled},
      tailwind: {enabled: isTailwindEnabled},
      toml: {enabled: isTomlEnabled},
      ts: {enabled: isTypescriptEnabled},
      unicorn: {enabled: isUnicornEnabled},
      unusedImports: {enabled: isUnusedImportsEnabled},
      vitest: {enabled: isVitestEnabled},
      vue: {enabled: isVueEnabled},
      yaml: {enabled: isYamlEnabled},
    },
    disabledAutofixes: {},
    usedPlugins: new Set(),
  };

  const [
    angularEslintConfigResult,
    astroEslintConfigResult,
    vueEslintConfigResult,
    svelteEslintConfigResult,
  ] = await Promise.all([
    isAngularEnabled && import('./configs/angular').then((m) => m.angularUnConfig(context)),
    isAstroEnabled && import('./configs/astro').then((m) => m.astroUnConfig(context)),
    isVueEnabled && import('./configs/vue').then((m) => m.vueUnConfig(context)),
    isSvelteEnabled && import('./configs/svelte').then((m) => m.svelteUnConfig(context)),
  ]);

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

  const unresolvedConfigs = Promise.all([
    globalIgnores.length > 0 && {
      name: genFlatConfigEntryName('ignores-global'),
      ignores: globalIgnores,
    },
    {
      name: genFlatConfigEntryName('ignores-gitignore'),
      ...(typeof optionsResolved.gitignore === 'object'
        ? eslintGitignore(optionsResolved.gitignore)
        : gitignoreFile
          ? eslintGitignore()
          : null),
    },
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

    /* Enabled by default or conditionally */
    jsUnConfig(context),
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
    isReactEnabled && import('./configs/react').then((m) => m.reactUnConfig(context)),
    isJsxA11yEnabled && import('./configs/jsx-a11y').then((m) => m.jsxA11yUnConfig(context)),
    isPnpmEnabled && import('./configs/pnpm').then((m) => m.pnpmUnConfig(context)),
    isNextJsEnabled && import('./configs/nextjs').then((m) => m.nextJsUnConfig(context)),
    isSolidEnabled && import('./configs/solid').then((m) => m.solidUnConfig(context)),
    isJsInlineEnabled && import('./configs/js-inline').then((m) => m.jsInlineUnConfig(context)),
    isHtmlEnabled && import('./configs/html').then((m) => m.htmlUnConfig(context)),
    isMathEnabled && import('./configs/math').then((m) => m.mathUnConfig(context)),

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

    /* Other configs */
    isTypescriptEnabled &&
      import('./configs/ts').then((m) =>
        m.tsUnConfig(context, {
          astroResolvedOptions: astroEslintConfigResult
            ? astroEslintConfigResult.optionsResolved
            : null,
          vueResolvedOptions: vueEslintConfigResult ? vueEslintConfigResult.optionsResolved : null,
          svelteResolvedOptions: svelteEslintConfigResult
            ? svelteEslintConfigResult.optionsResolved
            : null,
        }),
      ), // Must come after all rulesets for vanilla JS
    isEsEnabled && import('./configs/es').then((m) => m.esUnConfig(context)), // Must come after ts
    vueEslintConfigResult && vueEslintConfigResult.configs, // Must come after ts
    astroEslintConfigResult && astroEslintConfigResult.configs, // Must come after ts
    angularEslintConfigResult && angularEslintConfigResult.configs, // Must come after ts
    svelteEslintConfigResult && svelteEslintConfigResult.configs, // Must be after ts
    isMarkdownEnabled && import('./configs/markdown').then((m) => m.markdownUnConfig(context)), // Must be last

    rootConfigBuilder,

    isCliEnabled && import('./configs/extra/cli').then((m) => m.cliUnConfig(context)),
    isCloudfrontFunctionsEnabled &&
      import('./configs/extra/cloudfront-functions').then((m) =>
        m.cloudfrontFunctionsEslintConfig(context),
      ),

    ...extraConfigs.map((config, configIndex) => ({
      ...config,
      ...(config.rules && {rules: resolveOverrides(context, config.rules)}),
      name: genFlatConfigEntryName(`extra-config/${config.name || `unnamed${configIndex}`}`),
    })),

    // MUST be last
    !optionsResolved.disablePrettierIncompatibleRules && {
      name: genFlatConfigEntryName('eslint-config-prettier'),
      rules: Object.fromEntries(
        Object.entries(eslintConfigPrettier.rules).filter(
          ([k]) => !RULES_NOT_TO_DISABLE_IN_CONFIG_PRETTIER.has(k),
        ),
      ),
    },
  ] satisfies Promisable<
    | MaybeArray<UnFlatConfigEntry | ConfigEntryBuilder | FalsyValue>
    | {configs: (ConfigEntryBuilder | null)[]}
  >[]);

  const resolvedConfigs: UnFlatConfigEntry[] = (await unresolvedConfigs)
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
    disableAutofixPluginsWithPluginCopyMethod = [],
    disableAutofixPluginsWithRulesCopyMethod = [],
  ] = (['plugin-copy', 'rules-copy'] satisfies DisableAutofixMethod[]).map(
    (autofixDisablingMethod) =>
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
              ? await pluginsLoaders[pluginPrefix as keyof typeof pluginsLoaders]()
              : null;
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
        (disableAutofixPluginsWithRulesCopyMethod.some(
          (v) => v.pluginPrefix === pluginPrefixCanonical,
        ) ||
          (!loadPluginsOnDemand && defaultDisableAutofixMethod === 'rules-copy'))
      ) {
        const pluginPrefix =
          context.rootOptions.pluginRenames?.[pluginPrefixCanonical] || pluginPrefixCanonical;
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
              context.rootOptions.pluginRenames?.[pluginPrefixCanonical] || pluginPrefixCanonical;
            const rulesInfo = disableAutofixPluginsWithPluginCopyMethod.find(
              (v) => v.pluginPrefix === pluginPrefixCanonical,
            );
            if (
              plugin &&
              (rulesInfo || (!loadPluginsOnDemand && defaultDisableAutofixMethod === 'plugin-copy'))
            ) {
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
  } satisfies UnFlatConfigEntry);

  return resolvedConfigs;
};

export const eslintConfig = (options: EslintConfigUnOptions = {}) => eslintConfigInternal(options);

export {DEFAULT_GLOBAL_IGNORES};

export {isInEditor} from 'is-in-editor';

export type {RuleOptions} from './eslint-types';
