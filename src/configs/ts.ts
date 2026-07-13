// cspell:ignore Pocock's
import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import {
  ERROR,
  GLOB_MD_X_CODE_BLOCKS,
  GLOB_TS_X,
  GLOB_TS_X_EXTENSION,
  OFF,
  TS_PLUGIN_TYPE_AWARE_RULES,
  WARNING,
} from '../constants';
import type {
  EslintTypedRulesConfig,
  GetRuleNamesInPlugin,
  UnFlatConfigEntryFilesAndIgnores,
} from '../eslint/eslint-types';
import {generatePackageToLoadProperty} from '../loaders';
import type {Nullable, ObjectValues, OmitStrict, Prettify} from '../types';
import {type MaybeFn, allUnionMembers, isKeyIn, maybeCall, omit} from '../utils';
import type {AstroEslintConfigOptions} from './astro';
import type {SvelteEslintConfigOptions} from './svelte';
import type {VueEslintConfigOptions} from './vue';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  getRuleUnSeverityAndOptionsFromEntry,
} from './index';

const TS_PLUGIN_TYPE_AWARE_RULES_SET = new Set<string>(TS_PLUGIN_TYPE_AWARE_RULES);

type TypeAwareRulesWithPrefixes = Pick<
  UnRulesConfigPartial<'ts'>,
  `ts/${(typeof TS_PLUGIN_TYPE_AWARE_RULES)[number]}`
>;

type TsPluginNoUnsafeRules =
  | 'no-unsafe-argument'
  | 'no-unsafe-assignment'
  | 'no-unsafe-call'
  | 'no-unsafe-enum-comparison'
  | 'no-unsafe-member-access'
  | 'no-unsafe-return'
  | 'no-unsafe-type-assertion';

const TS_PLUGIN_NO_UNSAFE_RULES_SET = new Set<string>(
  allUnionMembers<TsPluginNoUnsafeRules>()([
    'no-unsafe-argument',
    'no-unsafe-assignment',
    'no-unsafe-call',
    'no-unsafe-enum-comparison',
    'no-unsafe-member-access',
    'no-unsafe-return',
    'no-unsafe-type-assertion',
  ] satisfies GetRuleNamesInPlugin<'ts'>[]),
);

type NoUnsafeRulesWithPrefixes = Pick<UnRulesConfigPartial<'ts'>, `ts/${TsPluginNoUnsafeRules}`>;

type TsconfigTopLevelKeys =
  | 'files'
  | 'include'
  | 'exclude'
  | 'compilerOptions'
  | 'references'
  | 'watchOptions'
  | 'typeAcquisition'
  | 'compileOnSave'
  // Non-standard
  | 'vueCompilerOptions'
  | 'angularCompilerOptions'
  | 'ts-node'
  | (string & {});
const DEFAULT_TSCONFIG_TOP_LEVEL_ORDER: TsconfigTopLevelKeys[] = [
  'extends',
  'references',
  'files',
  'include',
  'exclude',
  'compilerOptions',
  'vueCompilerOptions',
  'angularCompilerOptions',
  'ts-node',
];
// ⚠️ Must be sorted
export const TSCONFIG_COMPILER_OPTIONS_KEYS = {
  typeChecking: [
    'allowUnreachableCode',
    'allowUnusedLabels',
    'alwaysStrict',
    'exactOptionalPropertyTypes',
    'noFallthroughCasesInSwitch',
    'noImplicitAny',
    'noImplicitOverride',
    'noImplicitReturns',
    'noImplicitThis',
    'noPropertyAccessFromIndexSignature',
    'noUncheckedIndexedAccess',
    'noUnusedLocals',
    'noUnusedParameters',
    'strict',
    'strictBindCallApply',
    'strictFunctionTypes',
    'strictNullChecks',
    'strictPropertyInitialization',
    'useUnknownInCatchVariables',
  ],
  modules: [
    'allowArbitraryExtensions',
    'allowImportingTsExtensions',
    'allowUmdGlobalAccess',
    'baseUrl',
    'customConditions',
    'module',
    'moduleResolution',
    'moduleSuffixes',
    'noResolve',
    'paths',
    'resolveJsonModule',
    'resolvePackageJsonExports',
    'resolvePackageJsonImports',
    'rootDir',
    'rootDirs',
    'typeRoots',
    'types',
  ],
  emit: [
    'declaration',
    'declarationDir',
    'declarationMap',
    'downlevelIteration',
    'emitBOM',
    'emitDeclarationOnly',
    'importHelpers',
    'importsNotUsedAsValues',
    'inlineSourceMap',
    'inlineSources',
    'mapRoot',
    'newLine',
    'noEmit',
    'noEmitHelpers',
    'noEmitOnError',
    'outDir',
    'outFile',
    'preserveConstEnums',
    'preserveValueImports',
    'removeComments',
    'sourceMap',
    'sourceRoot',
    'stripInternal',
  ],
  javascriptSupport: ['allowJs', 'checkJs', 'maxNodeModuleJsDepth'],
  editorSupport: ['disableSizeLimit', 'plugins'],
  interopConstraints: [
    'allowSyntheticDefaultImports',
    'erasableSyntaxOnly',
    'esModuleInterop',
    'forceConsistentCasingInFileNames',
    'isolatedDeclarations',
    'isolatedModules',
    'preserveSymlinks',
    'verbatimModuleSyntax',
  ],
  backwardsCompatibility: [
    'charset',
    'importsNotUsedAsValues',
    'keyofStringsOnly',
    'noImplicitUseStrict',
    'noStrictGenericChecks',
    'out',
    'preserveValueImports',
    'suppressExcessPropertyErrors',
    'suppressImplicitAnyIndexErrors',
  ],
  languageAndEnvironment: [
    'emitDecoratorMetadata',
    'experimentalDecorators',
    'jsx',
    'jsxFactory',
    'jsxFragmentFactory',
    'jsxImportSource',
    'lib',
    'libReplacement',
    'moduleDetection',
    'noLib',
    'reactNamespace',
    'target',
    'useDefineForClassFields',
  ],
  compilerDiagnostics: [
    'diagnostics',
    'explainFiles',
    'extendedDiagnostics',
    'generateCpuProfile',
    'generateTrace',
    'listEmittedFiles',
    'listFiles',
    'noCheck',
    'traceResolution',
  ],
  projects: [
    'composite',
    'disableReferencedProjectLoad',
    'disableSolutionSearching',
    'disableSourceOfProjectReferenceRedirect',
    'incremental',
    'tsBuildInfoFile',
  ],
  outputFormatting: ['noErrorTruncation', 'preserveWatchOutput', 'pretty'],
  completeness: ['skipDefaultLibCheck', 'skipLibCheck'],
  watchOptions: ['assumeChangesOnlyAffectDirectDependencies'],
} as const satisfies Record<string, string[]>;
type TsconfigCompilerOptionsGroups = keyof typeof TSCONFIG_COMPILER_OPTIONS_KEYS;
type TsconfigCompilerOptionsKeys = ObjectValues<typeof TSCONFIG_COMPILER_OPTIONS_KEYS>[number];

export const TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS = {
  // Source: https://github.com/antfu/eslint-config/blob/56262ef7962ce310d29348060d8941d420f410fc/src/configs/sort.ts#L138
  antfu: [
    /* Projects */
    'incremental',
    'composite',
    'tsBuildInfoFile',
    'disableSourceOfProjectReferenceRedirect',
    'disableSolutionSearching',
    'disableReferencedProjectLoad',
    /* Language and Environment */
    'target',
    'jsx',
    'jsxFactory',
    'jsxFragmentFactory',
    'jsxImportSource',
    'lib',
    'moduleDetection',
    'noLib',
    'reactNamespace',
    'useDefineForClassFields',
    'emitDecoratorMetadata',
    'experimentalDecorators',
    'libReplacement',
    /* Modules */
    'baseUrl',
    'rootDir',
    'rootDirs',
    'customConditions',
    'module',
    'moduleResolution',
    'moduleSuffixes',
    'noResolve',
    'paths',
    'resolveJsonModule',
    'resolvePackageJsonExports',
    'resolvePackageJsonImports',
    'typeRoots',
    'types',
    'allowArbitraryExtensions',
    'allowImportingTsExtensions',
    'allowUmdGlobalAccess',
    /* JavaScript Support */
    'allowJs',
    'checkJs',
    'maxNodeModuleJsDepth',
    /* Type Checking */
    'strict',
    'strictBindCallApply',
    'strictFunctionTypes',
    'strictNullChecks',
    'strictPropertyInitialization',
    'allowUnreachableCode',
    'allowUnusedLabels',
    'alwaysStrict',
    'exactOptionalPropertyTypes',
    'noFallthroughCasesInSwitch',
    'noImplicitAny',
    'noImplicitOverride',
    'noImplicitReturns',
    'noImplicitThis',
    'noPropertyAccessFromIndexSignature',
    'noUncheckedIndexedAccess',
    'noUnusedLocals',
    'noUnusedParameters',
    'useUnknownInCatchVariables',
    /* Emit */
    'declaration',
    'declarationDir',
    'declarationMap',
    'downlevelIteration',
    'emitBOM',
    'emitDeclarationOnly',
    'importHelpers',
    'importsNotUsedAsValues',
    'inlineSourceMap',
    'inlineSources',
    'mapRoot',
    'newLine',
    'noEmit',
    'noEmitHelpers',
    'noEmitOnError',
    'outDir',
    'outFile',
    'preserveConstEnums',
    'preserveValueImports',
    'removeComments',
    'sourceMap',
    'sourceRoot',
    'stripInternal',
    /* Interop Constraints */
    'allowSyntheticDefaultImports',
    'esModuleInterop',
    'forceConsistentCasingInFileNames',
    'isolatedDeclarations',
    'isolatedModules',
    'preserveSymlinks',
    'verbatimModuleSyntax',
    'erasableSyntaxOnly',
    /* Completeness */
    'skipDefaultLibCheck',
    'skipLibCheck',
  ],
  // Source: https://www.totaltypescript.com/tsconfig-cheat-sheet
  totalTypescript: [
    /* Base Options: */
    'esModuleInterop',
    'skipLibCheck',
    'target',
    'allowJs',
    'resolveJsonModule',
    'moduleDetection',
    'isolatedModules',
    'verbatimModuleSyntax',
    /* Strictness */
    'strict',
    'noUncheckedIndexedAccess',
    'noImplicitOverride',
    /* If transpiling with TypeScript: */
    'module',
    'noEmit', // If NOT transpiling with TypeScript
    'outDir',
    'sourceMap',
    /* AND if you're building for a library: */
    'declaration',
    /* AND if you're building for a library in a monorepo: */
    'composite',
    'declarationMap',
    /* If your code runs/doesn't run in the DOM: */
    'lib',
  ],
} satisfies Record<string, TsconfigCompilerOptionsKeys[]>;

interface SortTsconfigKeysSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins> {
  /**
   * @default ['extends', 'references', 'files', 'include', 'exclude', 'compilerOptions', 'vueCompilerOptions', 'angularCompilerOptions', 'ts-node']
   */
  orderTopLevel?: boolean | (TsconfigTopLevelKeys | (string & {}))[];

  /**
   * By default `antfu` preset will be used.
   * @default true
   */
  orderCompilerOptions?:
    | boolean
    | 'alphabetical'
    | {
        /**
         * - `antfu`: use [Anthony Fu's order](https://github.com/antfu/eslint-config/blob/56262ef7962ce310d29348060d8941d420f410fc/src/configs/sort.ts#L138).
         * - `totalTypescript`: use the order from [Matt Pocock's TSConfig Cheat Sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet).
         */
        preset: keyof typeof TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS;
      }
    | {
        type: 'order-groups';

        /**
         * Unless overridden, order from `antfu` present will be used *within* groups.
         */
        order: (TsconfigCompilerOptionsGroups | (string & {}))[];
        orderWithinGroup?: {
          [Group in TsconfigCompilerOptionsGroups | (string & {})]?:
            | 'alphabetical'
            | (Group extends keyof typeof TSCONFIG_COMPILER_OPTIONS_KEYS
                ? (typeof TSCONFIG_COMPILER_OPTIONS_KEYS)[Group][number] | (string & {})
                : string)[];
        };
      }
    | {
        type: 'order-keys';
        order: (TsconfigCompilerOptionsKeys | (string & {}))[];
      };

  /**
   * Extra configs for [`jsonc/sort-keys`](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-keys.html) rule
   * that will be appended to the resulting config array.
   */
  extraSortKeysConfigs?: (GetRuleOptions<'jsonc', 'sort-keys'> & object)[];
}

export interface TsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  OmitStrict<UnRulesConfigPartial<'ts'>, keyof TypeAwareRulesWithPrefixes>
> {
  /**
   * Set ups `typescript-eslint` plugin: sets `language.{parser,parserOptions}`
   * for NON-type-aware rules.
   *
   * By default, it will be applied to all TypeScript files (<code>**&#47;*.?([cm])ts?(x)</code>)
   * plus extra files coming from `astro`, `svelte` and `vue` configs.
   * If different files are specified, those extra files will still be appended.
   *
   * To configure the setup config for type-aware rules, use `configTypeAware.configSetup` option.
   */
  configSetup?: UnFlatConfigEntryFilesAndIgnores;

  /**
   * Applies rules requiring type information on the specified `files`.
   *
   * By default uses `ignores` from the parent config.
   * @default true
   */
  configTypeAware?:
    | boolean
    | Prettify<
        {
          /**
           * Set ups `typescript-eslint` plugin: sets `language.{parser,parserOptions}`
           * for type-aware rules.
           *
           * By default, it will be applied to all TypeScript files
           * (<code>**&#47;*.?([cm])ts?(x)</code>)
           * plus extra files coming from `astro`, `svelte` and `vue` configs.
           * If different files are specified, those extra files will still be appended.
           *
           * To configure the setup config for non-type-aware rules,
           * use `configSetup` option on the root config.
           */
          configSetup?: UnFlatConfigEntryFilesAndIgnores;
        } & UnFlatConfigEntryBase<ExtraPlugins, TypeAwareRulesWithPrefixes>
      >;

  /**
   * Disallows any type assertions via [`eslint-plugin-no-type-assertion`](https://npmx.dev/eslint-plugin-no-type-assertion) plugin.
   *
   * If you'd like to disallow only unsafe type assertions, enable [`ts/no-unsafe-type-assertion`](https://typescript-eslint.io/rules/no-unsafe-type-assertion) rule instead.
   * @default false
   */
  configNoTypeAssertion?: boolean | UnFlatConfigEntryBase<ExtraPlugins, 'no-type-assertion'>;

  /**
   * If you have too many `no-unsafe-*` reports, you can disable them all by enabling this config.
   * The rules disabled by this config are:
   * - [`ts/no-unsafe-argument`](https://typescript-eslint.io/rules/no-unsafe-argument)
   * - [`ts/no-unsafe-assignment`](https://typescript-eslint.io/rules/no-unsafe-assignment)
   * - [`ts/no-unsafe-call`](https://typescript-eslint.io/rules/no-unsafe-call)
   * - [`ts/no-unsafe-enum-comparison`](https://typescript-eslint.io/rules/no-unsafe-enum-comparison)
   * - [`ts/no-unsafe-member-access`](https://typescript-eslint.io/rules/no-unsafe-member-access)
   * - [`ts/no-unsafe-return`](https://typescript-eslint.io/rules/no-unsafe-return)
   * - [`ts/no-unsafe-type-assertion`](https://typescript-eslint.io/rules/no-unsafe-type-assertion)
   * @default false
   */
  configDisableNoUnsafe?: boolean | UnFlatConfigEntryBase<ExtraPlugins, NoUnsafeRulesWithPrefixes>;

  /**
   * Sorts the keys of `tsconfig.json` files.
   * @default false
   */
  configSortTsconfigKeys?: boolean | SortTsconfigKeysSubConfigOptions<ExtraPlugins>;

  /**
   * For [extension rules](https://typescript-eslint.io/rules/?=extension), try to smartly inherit
   * corresponding base rule's severity and options.
   * @default true
   */
  inheritBaseRuleSeverityAndOptionsForExtensionRules?: boolean;

  /**
   * By default it will be auto-detected from the installed `typescript` package.
   * It will contain major and minor version numbers, e.g. even if you installed
   * TypeScript 5.8.1, `typescriptVersion` will be `5.8`.
   */
  typescriptVersion?: number;

  /**
   * Globs of files to allow running with the default project compiler options
   * despite not being matched by the project service.
   * @see https://typescript-eslint.io/packages/parser#allowdefaultproject
   */
  allowDefaultProject?: (TsEslintParserOptions['projectService'] & object)['allowDefaultProject'];

  /**
   * Will be merged with the default parser options set by us. These options will be
   * passed to two setup configs for applying non-type-aware and type-aware rules.
   * If a function is provided, it will receive the flag telling to which config the
   * options will be applied.
   *
   * Note that if you only need to set [`projectService.allowDefaultProject`](https://typescript-eslint.io/packages/parser#allowdefaultproject), we recommend you using a separate
   * `allowDefaultProject` option instead.
   * @see https://typescript-eslint.io/packages/parser#configuration
   */
  parserOptions?: MaybeFn<TsEslintParserOptions, [isForTypeAwareConfig: boolean]>;

  /**
   * Do not put `.` (dot) before an extension
   * @example ['vue']
   */
  extraFileExtensions?: string[];

  /**
   * Which special variable types should be subject to removal by
   * [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) (if unused).
   *
   * Will be merged with the default value.
   * @default {imports: true}
   */
  extraVariableTypesToRemove?: Partial<
    Record<
      keyof (Extract<GetRuleOptions<'ts', 'no-unused-vars'>, object>['enableAutofixRemoval'] & {}),
      boolean
    >
  >;
}

const TS_FILES_DEFAULT = [GLOB_TS_X];
const DEFAULT_IGNORES_TYPE_AWARE = [GLOB_MD_X_CODE_BLOCKS];

const isProjectServiceObject = (
  value: TsEslintParserOptions['projectService'],
): value is Exclude<TsEslintParserOptions['projectService'], boolean | undefined> =>
  typeof value === 'object';

const mergeParserOptions = (
  lower: TsEslintParserOptions,
  higher: TsEslintParserOptions,
): TsEslintParserOptions => {
  const merged: TsEslintParserOptions = {...lower, ...higher};

  if (
    isProjectServiceObject(lower.projectService) &&
    isProjectServiceObject(higher.projectService)
  ) {
    merged.projectService = {...lower.projectService, ...higher.projectService};
  }

  const mergedExtraFileExtensions = [
    ...(lower.extraFileExtensions || []),
    ...(higher.extraFileExtensions || []),
  ];
  if (mergedExtraFileExtensions.length > 0) {
    merged.extraFileExtensions = [...new Set(mergedExtraFileExtensions)];
  }

  return merged;
};

export default ((
  context,
  optionsRaw,
  {vanillaFinalFlatConfigRules, astroResolvedOptions, vueResolvedOptions, svelteResolvedOptions},
) => {
  const typescriptPackageInfo = context.packagesInfo.typescript;

  const optionsResolved = assignDefaults(optionsRaw, {
    configTypeAware: true,
    configNoTypeAssertion: false,
    configDisableNoUnsafe: false,
    configSortTsconfigKeys: false,
    extraFileExtensions: [
      context.configsMeta.astro.enabled && 'astro',
      context.configsMeta.svelte.enabled && 'svelte',
      context.configsMeta.vue.enabled && 'vue',
    ].filter((v) => v !== false),
    inheritBaseRuleSeverityAndOptionsForExtensionRules: true,
  });
  optionsResolved.typescriptVersion ??= typescriptPackageInfo?.versions.majorAndMinor ?? undefined;
  const {
    configSetup,
    configTypeAware,
    configNoTypeAssertion,
    configDisableNoUnsafe,
    configSortTsconfigKeys,
    extraFileExtensions,
    inheritBaseRuleSeverityAndOptionsForExtensionRules: inheritFromBase,
    typescriptVersion,
    allowDefaultProject,
    extraVariableTypesToRemove,
  } = optionsResolved;

  const extraFilesNONTypeAware: string[] = [];
  const extraFilesTypeAware: string[] = [];
  const extraIgnoresNONTypeAware: string[] = [];
  const extraIgnoresTypeAware: string[] = [...DEFAULT_IGNORES_TYPE_AWARE];

  const svelteTsConfig = svelteResolvedOptions?.configEnforceTypescriptInScriptSection;
  const vueTsConfig = vueResolvedOptions?.configEnforceTypescriptInScriptSection;
  const vueTypescriptRules = typeof vueTsConfig === 'object' ? vueTsConfig.typescriptRules : null;
  (
    [
      [astroResolvedOptions],
      [svelteTsConfig],
      [
        vueTsConfig,
        {
          additionalCondition: vueTypescriptRules !== false,
          doNotTreatFilesAsTypeAware: vueTypescriptRules === 'only-non-type-aware',
        },
      ],
    ] satisfies [
      config: Nullable<UnFlatConfigEntryBase> | boolean,
      options?: {additionalCondition?: boolean; doNotTreatFilesAsTypeAware?: boolean},
    ][]
  ).forEach(([config, {additionalCondition, doNotTreatFilesAsTypeAware} = {}]) => {
    if (typeof config !== 'object' || !config || additionalCondition === false) {
      return;
    }

    const {files: extraTsFiles = [], ignores: extraTsIgnores = []} = config;

    extraFilesNONTypeAware.push(...extraTsFiles);
    if (!doNotTreatFilesAsTypeAware) {
      extraFilesTypeAware.push(...extraTsFiles);
    }

    extraIgnoresNONTypeAware.push(...extraTsIgnores);
    extraIgnoresTypeAware.push(...extraTsIgnores);
  });

  const filesNONTypeAwareDefault =
    optionsResolved.files?.length === 0 ? [] : [...(optionsResolved.files || TS_FILES_DEFAULT)];
  const filesNONTypeAware = [...filesNONTypeAwareDefault, ...extraFilesNONTypeAware];
  const ignoresNONTypeAware = [...(optionsResolved.ignores || []), ...extraIgnoresNONTypeAware];

  const configTypeAwareOptions = typeof configTypeAware === 'object' ? configTypeAware : {};
  const {files: userFilesTypeAware, ignores: userIgnoresTypeAware} = configTypeAwareOptions;
  const filesTypeAware = [
    ...(userFilesTypeAware?.length === 0 ? [] : [userFilesTypeAware || filesNONTypeAwareDefault]), // Lint the same files, excluding extra non-TA ones
    ...extraFilesTypeAware,
  ].flat();
  const ignoresTypeAware = [
    ...(userIgnoresTypeAware || optionsResolved.ignores || []),
    ...extraIgnoresTypeAware,
  ];

  const buildSetupParserOptions = (
    isTypeAware: boolean,
    userParserOptions: TsEslintParserOptions | undefined,
  ): TsEslintParserOptions => {
    const merged = [
      isTypeAware ? context.typeInfoRulesResolved.parserOptions : undefined,
      userParserOptions,
    ].reduce<TsEslintParserOptions>(
      (accumulated, layer) => (layer ? mergeParserOptions(accumulated, layer) : accumulated),
      {sourceType: 'module'},
    );

    const withExtensions: TsEslintParserOptions =
      extraFileExtensions.length === 0
        ? merged
        : {
            ...merged,
            extraFileExtensions: [
              ...new Set([
                ...(merged.extraFileExtensions || []),
                ...extraFileExtensions.map((extension) => `.${extension}`),
              ]),
            ],
          };

    if (!isTypeAware) {
      return withExtensions;
    }

    const withAllowDefaultProject: TsEslintParserOptions = allowDefaultProject?.length
      ? {
          ...withExtensions,
          projectService: isProjectServiceObject(withExtensions.projectService)
            ? {...withExtensions.projectService, allowDefaultProject}
            : {allowDefaultProject},
        }
      : withExtensions;

    return withAllowDefaultProject.projectService === undefined
      ? {...withAllowDefaultProject, projectService: {}}
      : withAllowDefaultProject;
  };

  const generateSetupConfigBuilder = (isTypeAware: boolean) => {
    const optionsNonTypeAwareForSetup = configSetup || {};
    const optionsTypeAwareForSetup = configTypeAwareOptions.configSetup || {};

    const options = isTypeAware ? optionsTypeAwareForSetup : optionsNonTypeAwareForSetup;
    if (isTypeAware) {
      options.files ||= optionsNonTypeAwareForSetup.files;
      options.ignores ||= optionsNonTypeAwareForSetup.ignores;
    }

    const userParserOptions = maybeCall(optionsResolved.parserOptions, isTypeAware);

    const configBuilderSetup = context.createConfigBuilder(options, 'ts');
    configBuilderSetup
      ?.addConfig(
        [
          `ts/${isTypeAware ? '' : 'non-'}type-aware/setup`,
          {
            includeDefaultFilesAndIgnores: true,
            filesDefault: [
              ...(options.files?.length ? [] : TS_FILES_DEFAULT),
              ...(isTypeAware ? extraFilesTypeAware : extraFilesNONTypeAware),
            ],
            filesDefaultMergedWithUserFiles: true,
            ...(isTypeAware && {ignoresDefault: DEFAULT_IGNORES_TYPE_AWARE}),
          },
        ],
        {
          languageOptions: {
            ...generatePackageToLoadProperty('parser', 'typescriptEslintParser'),
            parserOptions: buildSetupParserOptions(isTypeAware, userParserOptions),
          },
        },
      )
      .disableAnyRule('', 'class-methods-use-this')
      .disableAnyRule('', 'default-param-last')
      .disableAnyRule('', 'init-declarations')
      .disableAnyRule('', 'max-params')
      .disableAnyRule('', 'no-array-constructor') // 🟣
      .disableAnyRule('', 'no-dupe-class-members') // 🟣
      .disableAnyRule('', 'no-empty-function') // 💅
      .disableAnyRule('', 'no-invalid-this')
      .disableAnyRule('', 'no-loop-func')
      .disableAnyRule('', 'no-magic-numbers')
      .disableAnyRule('', 'no-redeclare')
      .disableAnyRule('', 'no-restricted-imports')
      .disableAnyRule('', 'no-shadow')
      .disableAnyRule('', 'no-unused-expressions') // 🟣
      .disableAnyRule('', 'no-unused-vars') // 🟣
      .disableAnyRule('', 'no-use-before-define')
      .disableAnyRule('', 'no-useless-constructor') // 🟣
      .disableAnyRule('', 'consistent-return')
      .disableAnyRule('', 'dot-notation') // 💅
      .disableAnyRule('', 'no-implied-eval') // 🟣
      .disableAnyRule('', 'no-throw-literal') // Note: has different name
      .disableAnyRule('', 'prefer-destructuring')
      .disableAnyRule('', 'prefer-promise-reject-errors') // 🟣
      .disableAnyRule('', 'require-await'); // 🟣

    return configBuilderSetup;
  };

  const configBuilderNONTypeAwareSetup = generateSetupConfigBuilder(false);

  const configBuilderNONTypeAware = context.createConfigBuilder(
    {
      ...optionsResolved,
      ...(filesNONTypeAware.length > 0 && {files: filesNONTypeAware}),
      ...(ignoresNONTypeAware.length > 0 && {ignores: ignoresNONTypeAware}),
    },
    'ts',
  );

  const classMethodUseThisOptions: GetRuleOptions<'ts', 'class-methods-use-this', 'all'> = [
    {
      ignoreOverrideMethods: true,
      ignoreClassesThatImplementAnInterface: true,
    },
  ];
  const classMethodUseThisUnEntry = getRuleUnSeverityAndOptionsFromEntry(
    vanillaFinalFlatConfigRules['class-methods-use-this'] ?? ERROR,
    inheritFromBase ? undefined : [ERROR, classMethodUseThisOptions],
  );
  classMethodUseThisUnEntry[1][0] = {
    ...omit(classMethodUseThisUnEntry[1][0] || {}, ['ignoreClassesWithImplements']),
    ...classMethodUseThisOptions[0],
  } satisfies GetRuleOptions<'ts', 'class-methods-use-this'>;

  const maxParamsBaseUnEntry = getRuleUnSeverityAndOptionsFromEntry(
    vanillaFinalFlatConfigRules['max-params'] ?? OFF,
    inheritFromBase ? undefined : [OFF],
  );
  const maxParamsOptions: GetRuleOptions<'ts', 'max-params', 'all'> =
    maxParamsBaseUnEntry[1][0] == null
      ? []
      : [
          {
            ...(typeof maxParamsBaseUnEntry[1][0] === 'object'
              ? {
                  ...omit(maxParamsBaseUnEntry[1][0], ['maximum']),
                  ...(() => {
                    const max =
                      maxParamsBaseUnEntry[1][0].maximum ?? maxParamsBaseUnEntry[1][0].max;
                    return max != null && {max};
                  })(),
                }
              : {max: maxParamsBaseUnEntry[1][0]}),
          },
        ];

  const noEmptyFunctionBaseUnEntry = getRuleUnSeverityAndOptionsFromEntry(
    vanillaFinalFlatConfigRules['no-empty-function'] ?? ERROR,
    inheritFromBase ? undefined : [ERROR],
  );
  const noEmptyFunctionOptions: GetRuleOptions<'ts', 'no-empty-function', 'all'> =
    noEmptyFunctionBaseUnEntry[1][0]?.allow?.length
      ? [
          {
            allow: (() => {
              const allowBase = noEmptyFunctionBaseUnEntry[1][0].allow;
              const hasPrivateConstructors = allowBase.includes('privateConstructors');
              const hasProtectedConstructors = allowBase.includes('protectedConstructors');
              return [
                ...allowBase.filter(
                  (v) => v !== 'privateConstructors' && v !== 'protectedConstructors',
                ),
                ...(hasPrivateConstructors ? (['private-constructors'] as const) : []),
                ...(hasProtectedConstructors ? (['protected-constructors'] as const) : []),
              ];
            })(),
          },
        ]
      : [];

  const noUnusedVarsBaseUnEntry = getRuleUnSeverityAndOptionsFromEntry(
    vanillaFinalFlatConfigRules['no-unused-vars'] ?? ERROR,
    inheritFromBase ? undefined : [ERROR],
  );
  const noUnusedVarsOptions: GetRuleOptions<'ts', 'no-unused-vars', 'all'> =
    noUnusedVarsBaseUnEntry[1][0] == null
      ? []
      : [
          {
            enableAutofixRemoval: {imports: true, ...extraVariableTypesToRemove},
            ...(typeof noUnusedVarsBaseUnEntry[1][0] === 'string'
              ? {vars: noUnusedVarsBaseUnEntry[1][0]}
              : noUnusedVarsBaseUnEntry[1][0]),
          },
        ];

  // Legend:
  // 🟣 - in strict
  // 💅 - in stylistic
  // ❄️ = Feature-frozen in ts-eslint
  // 👍 = Auto-checked and there's barely any need to use this rule
  // 🟠 - rule from `eslint-config-prettier`

  // TODO add rules
  configBuilderNONTypeAware
    ?.addConfig([
      'ts/non-type-aware/rules',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .markCategory('Strict')
    .addRule('ban-ts-comment', ERROR) /** @since 2.18.0 */ // 🟣
    .addRule('no-duplicate-enum-values', ERROR) /** @since 5.22.0 */ // 🟣
    .addRule('no-dynamic-delete', WARNING) /** @since 2.8.0 */ // 🟣
    .addRule('no-empty-object-type', ERROR, [
      {allowInterfaces: 'with-single-extends'},
    ]) /** @since 8.0.0 */ // 🟣
    .addRule('no-explicit-any', WARNING, [{ignoreRestArgs: true}]) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('no-extra-non-null-assertion', ERROR) /** @since 2.9.0 */ // 🟣
    .addRule('no-extraneous-class', ERROR, [
      {
        allowWithDecorator: true, // Primarily for Angular
      },
    ]) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('no-invalid-void-type', ERROR) /** @since 2.30.0 */ // 🟣
    .addRule('no-misused-new', ERROR) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('no-namespace', ERROR) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('no-non-null-asserted-nullish-coalescing', ERROR) /** @since 4.32.0 */ // 🟣
    .addRule('no-non-null-asserted-optional-chain', ERROR) /** @since 2.17.0 */ // 🟣
    .addRule('no-non-null-assertion', WARNING) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('no-restricted-types', OFF) /** @since 8.0.0 */
    .addRule('no-this-alias', ERROR) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('no-unnecessary-type-constraint', ERROR) /** @since 4.6.0 */ // 🟣
    .addRule('no-unsafe-declaration-merging', ERROR) /** @since 5.41.0 */ // 🟣
    .addRule('no-unsafe-function-type', ERROR) /** @since 8.0.0 */ // 🟣
    .addRule('no-wrapper-object-types', ERROR) /** @since 8.0.0 */ // 🟣
    .addRule('prefer-as-const', ERROR) /** @since 2.18.0 */ // 🟣
    .addRule('prefer-literal-enum-member', ERROR, [
      {allowBitwiseExpressions: true},
    ]) /** @since 3.6.0 */ // 🟣
    .addRule('prefer-namespace-keyword', ERROR) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule('triple-slash-reference', ERROR) /** @since 1.12.0 */ // 🟣
    .addRule('unified-signatures', ERROR, [
      {ignoreOverloadsWithDifferentJSDoc: true},
    ]) /** @since 1.5.0 */ // 🟣
    .markCategory('Stylistic')
    .addRule('adjacent-overload-signatures', ERROR) /** @since 0.0.1-alpha.0 */ // 💅
    .addRule('array-type', ERROR) /** @since 0.0.1-alpha.0 */ // 💅
    .addRule('ban-tslint-comment', ERROR) /** @since 3.2.0 */ // 💅
    .addRule('class-literal-property-style', ERROR) /** @since 2.25.0 */ // 💅
    .addRule('consistent-generic-constructors', ERROR) /** @since 5.28.0 */ // 💅
    .addRule('consistent-indexed-object-style', ERROR) /** @since 4.4.0 */ // 💅
    .addRule('consistent-type-assertions', ERROR) /** @since 2.0.0 */ // 💅
    .addRule('consistent-type-definitions', ERROR) /** @since 2.0.0 */ // 💅
    .addRule('no-confusing-non-null-assertion', ERROR) /** @since 3.2.0 */ // 💅
    .addRule('no-inferrable-types', ERROR) /** @since 0.0.1-alpha.0 */ // 💅
    .addRule('prefer-for-of', ERROR) /** @since 1.7.0 */ // 💅
    .addRule('prefer-function-type', OFF) /** @since 1.4.0 */ // 💅
    .markCategory('Additional rules')
    .addRule('consistent-type-imports', ERROR, [
      {
        ...(typescriptVersion && typescriptVersion >= 4.5 && {fixStyle: 'inline-type-imports'}),
        disallowTypeAnnotations: false,
      },
    ]) /** @since 4.0.0 */
    .addRule('explicit-function-return-type', OFF) /** @since 0.0.1-alpha.0 */
    .addRule('explicit-member-accessibility', OFF) /** @since 0.0.1-alpha.0 */
    .addRule('explicit-module-boundary-types', OFF) /** @since 2.17.0 */
    .addRule('member-ordering', OFF) /** @since 0.0.1-alpha.0 */ // ❄️
    .addRule('method-signature-style', ERROR) /** @since 2.27.0 */
    .addRule('no-import-type-side-effects', ERROR) /** @since 5.51.0 */
    .addRule('no-require-imports', OFF) /** @since 1.3.0 */ // 🟣
    .addRule('no-unnecessary-parameter-property-assignment', ERROR) /** @since 7.16.0 */
    .addRule('no-useless-empty-export', ERROR) /** @since 5.13.0 */
    .addRule('parameter-properties', OFF) /** @since 5.21.0 */
    .addRule('prefer-enum-initializers', OFF) /** @since 3.8.0 */
    .markCategory('Extension rules')
    .addRule('class-methods-use-this', ...classMethodUseThisUnEntry) /** @since 6.2.0 */
    .addRule(
      'default-param-last',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['default-param-last'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 2.16.0 */
    .addRule(
      'init-declarations',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['init-declarations'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 2.29.0 */
    .addRule('max-params', maxParamsBaseUnEntry[0], maxParamsOptions) /** @since 6.9.0 */
    .addRule(
      'no-array-constructor',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-array-constructor'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule(
      'no-dupe-class-members',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-dupe-class-members'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 2.19.0 */ // 👍
    .addRule(
      'no-empty-function',
      noEmptyFunctionBaseUnEntry[0],
      noEmptyFunctionOptions,
    ) /** @since 1.11.0 */ // 💅
    .addRule(
      'no-invalid-this',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-invalid-this'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 2.31.0 */ // 👍
    .addRule(
      'no-loop-func',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-loop-func'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 4.1.0 */
    .addRule(
      'no-magic-numbers',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-magic-numbers'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 1.11.0 */
    .addRule(
      'no-redeclare',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-redeclare'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 4.0.0 */ // 👍
    .addRule(
      'no-restricted-imports',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-restricted-imports'] ?? OFF,
        inheritFromBase ? undefined : [OFF],
      ),
    ) /** @since 4.32.0 */
    .addRule(
      'no-shadow',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-shadow'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 4.0.0 */
    .addRule(
      'no-unused-expressions',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-unused-expressions'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 2.7.0 */ // 🟣
    .addRule(
      'no-unused-private-class-members',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-unused-private-class-members'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 8.47.0 */ // 🟣
    .addRule(
      'no-unused-vars',
      noUnusedVarsBaseUnEntry[0],
      noUnusedVarsOptions,
    ) /** @since 0.0.1-alpha.0 */ // 🟣
    .addRule(
      'no-use-before-define',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-use-before-define'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 0.0.1-alpha.0 */
    .addRule(
      'no-useless-constructor',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-useless-constructor'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 1.2.0 */ // 🟣
    .enableConfigTesterForPlugin('ts', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => TS_PLUGIN_TYPE_AWARE_RULES_SET.has(ruleName),
    })
    .addOverrides();

  // CONFIG TYPE AWARE

  const dotNotationBaseUnEntry = getRuleUnSeverityAndOptionsFromEntry(
    vanillaFinalFlatConfigRules['dot-notation'] ?? ERROR,
    inheritFromBase ? undefined : [ERROR],
  );
  const dotNotationOptions: GetRuleOptions<'ts', 'dot-notation', 'all'> =
    dotNotationBaseUnEntry[1][0] == null
      ? []
      : [
          {
            ...dotNotationBaseUnEntry[1][0],
            allowIndexSignaturePropertyAccess: true,
          },
        ];

  const configBuilderTypeAwareSetup = generateSetupConfigBuilder(true);

  const configBuilderTypeAware = context.createConfigBuilder(
    // This is an exception for "files is empty array disables only one config" rule. If parent config gets an empty array, we must disable type-aware rules too
    optionsResolved.files?.length === 0 ? false : configTypeAware,
    'ts',
  );

  configBuilderTypeAware
    ?.addConfig([
      'ts/type-aware/rules',
      {
        // Please note: `{files,ignores}Default` must NOT be overridden by user's
        // files and ignores
        filesDefault: filesTypeAware,
        ignoresDefault: ignoresTypeAware,
        skipTypeInfoSplit: true,
      },
    ])
    .markCategory('Strict')
    .addRule('await-thenable', ERROR) /** @since 1.7.0 */ // 🟣
    .addRule('no-array-delete', ERROR) /** @since 6.19.0 */ // 🟣
    .addRule('no-base-to-string', ERROR, [{checkUnknown: true}]) /** @since 2.22.0 */ // 🟣
    .addRule('no-confusing-void-expression', ERROR, [
      {ignoreArrowShorthand: true},
    ]) /** @since 4.7.0 */ // 🟣
    .addRule('no-deprecated', WARNING) /** @since 8.3.0 */ // 🟣
    .addRule('no-duplicate-type-constituents', ERROR) /** @since 5.57.0 */ // 🟣
    .addRule('no-floating-promises', ERROR, [
      {
        checkThenables: true,
        ignoreVoid: true, // Default
      },
    ]) /** @since 1.11.0 */ // 🟣
    .addRule('no-for-in-array', ERROR) /** @since 1.3.0 */ // 🟣
    .addRule('no-meaningless-void-operator', ERROR) /** @since 4.31.0 */ // 🟣
    .addRule('no-misused-promises', ERROR) /** @since 1.13.0 */ // 🟣
    .addRule('no-misused-spread', ERROR) /** @since 8.20.0 */ // 🟣
    .addRule('no-mixed-enums', ERROR) /** @since 5.53.0 */ // 🟣
    .addRule('no-redundant-type-constituents', ERROR) /** @since 5.13.0 */ // 🟣
    .addRule('no-unnecessary-boolean-literal-compare', ERROR) /** @since 2.19.0 */ // 🟣
    .addRule('no-unnecessary-condition', ERROR, [
      {
        allowConstantLoopConditions: 'only-allowed-literals',
        checkTypePredicates: true /** @since 8.8.0 */,
      },
    ]) /** @since 2.3.0 */ // 🟣
    .addRule(
      'no-unnecessary-template-expression',
      ERROR,
    ) /** @since 7.12.0 */ /** @aka no-useless-template-literals */ // 🟣
    .addRule('no-unnecessary-type-arguments', ERROR) /** @since 2.0.0 */ // 🟣
    .addRule('no-unnecessary-type-assertion', ERROR) /** @since 1.2.0 */ // 🟣
    .addRule('no-unnecessary-type-conversion', ERROR) /** @since 8.32.0 */
    .addRule('no-unnecessary-type-parameters', ERROR) /** @since 7.16.0 */ // 🟣
    .addRule('no-unsafe-argument', WARNING) /** @since 4.21.0 */ // 🟣
    .addRule('no-unsafe-assignment', WARNING) /** @since 2.28.0 */ // 🟣
    .addRule('no-unsafe-call', WARNING) /** @since 2.23.0 */ // 🟣
    .addRule('no-unsafe-enum-comparison', WARNING) /** @since 5.58.0 */ // 🟣
    .addRule('no-unsafe-member-access', WARNING) /** @since 2.23.0 */ // 🟣
    .addRule('no-unsafe-return', WARNING) /** @since 2.23.0 */ // 🟣
    .addRule('no-unsafe-type-assertion', OFF) /** @since 8.15.0 */
    .addRule('no-unsafe-unary-minus', ERROR) /** @since 6.11.0 */ // 🟣
    .addRule('no-useless-default-assignment', ERROR) /** @since 8.50.0 */ // 🟣
    .addRule('prefer-reduce-type-parameter', ERROR) /** @since 2.28.0 */ // 🟣
    .addRule('prefer-return-this-type', ERROR) /** @since 4.29.0 */ // 🟣
    .addRule('restrict-plus-operands', ERROR) /** @since 1.1.0 */ // 🟣
    .addRule('restrict-template-expressions', ERROR, [
      {allowAny: false, allowRegExp: false},
    ]) /** @since 2.8.0 */ // 🟣
    .addRule('unbound-method', ERROR) /** @since 1.7.0 */ // 🟣
    .addRule('use-unknown-in-catch-callback-variable', ERROR) /** @since 7.3.0 */ // 🟣
    .markCategory('Stylistic')
    .addRule('non-nullable-type-assertion-style', ERROR) /** @since 4.10.0 */ // 💅
    .addRule('prefer-find', ERROR) /** @since 6.21.0 */ // 💅
    .addRule('prefer-includes', ERROR) /** @since 1.7.0 */ // 💅
    .disableAnyRule('unicorn', 'prefer-includes')
    .addRule('prefer-nullish-coalescing', OFF) /** @since 2.9.0 */ // 💅
    .addRule('prefer-optional-chain', ERROR) /** @since 2.9.0 */ // 💅
    .addRule('prefer-regexp-exec', OFF) /** @since 1.9.0 */ // 💅
    .addRule('prefer-string-starts-ends-with', ERROR, [
      {allowSingleElementEquality: 'always'},
    ]) /** @since 1.7.0 */ // 💅
    .markCategory('Additional rules')
    .addRule('consistent-type-exports', ERROR, [
      {fixMixedExportsWithInlineTypeSpecifier: true},
    ]) /** @since 5.2.0 */
    .addRule('naming-convention', ERROR, [
      {selector: 'enum', format: ['PascalCase']},
      {selector: 'enumMember', format: ['PascalCase']},
      {selector: 'interface', format: ['PascalCase']},
      {selector: 'typeLike', format: ['PascalCase']},
      {selector: 'typeParameter', format: ['PascalCase'], leadingUnderscore: 'allow'},
    ]) /** @since 2.16.0 */
    .addRule('no-unnecessary-qualifier', OFF) /** @since 1.4.0 */
    .addRule('prefer-readonly', ERROR) /** @since 1.12.0 */
    .addRule('prefer-readonly-parameter-types', OFF) /** @since 2.22.0 */
    .addRule('promise-function-async', OFF) /** @since 1.3.0 */
    .addRule('related-getter-setter-pairs', ERROR) /** @since 8.15.0 */ // 🟣
    .addRule('require-array-sort-compare', OFF) /** @since 1.4.0 */
    .addRule('return-await', ERROR, ['always']) /** @since 2.9.0 */ // 🟣
    // Note: has different name. Also note that the original rule is deprecated and not included in this config, but we disable it anyway just for safety
    .disableAnyRule('', 'no-return-await') // 🟣
    .addRule('strict-boolean-expressions', OFF) /** @since 1.12.0 */
    .addRule('strict-void-return', ERROR) /** @since 8.53.0 */
    .addRule('switch-exhaustiveness-check', OFF) /** @since 2.19.0 */
    .markCategory('Extension rules')
    .addRule(
      'consistent-return',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['consistent-return'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 7.1.0 */
    .addRule('dot-notation', dotNotationBaseUnEntry[0], dotNotationOptions) /** @since 2.30.0 */ // 💅
    .addRule(
      'no-implied-eval',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-implied-eval'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 2.15.0 */ // 🟣
    .addRule(
      'only-throw-error',
      getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['no-throw-literal'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      )[0],
      [{allowRethrowing: true}], // the base rule has no options
    ) /** @since 7.4.0 */ // 🟣
    .addRule(
      'prefer-destructuring',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['prefer-destructuring'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 6.8.0 */
    .disableAnyRule('unicorn', 'prefer-array-find') // TODO why it's here?
    .addRule(
      'prefer-promise-reject-errors',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['prefer-promise-reject-errors'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 6.19.0 */ // 🟣
    .addRule(
      'require-await',
      ...getRuleUnSeverityAndOptionsFromEntry(
        vanillaFinalFlatConfigRules['require-await'] ?? ERROR,
        inheritFromBase ? undefined : [ERROR],
      ),
    ) /** @since 1.13.0 */ // 🟣
    .enableConfigTesterForPlugin('ts', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !TS_PLUGIN_TYPE_AWARE_RULES_SET.has(ruleName),
    })
    .addOverrides();

  const allTypescriptFiles = [...TS_FILES_DEFAULT, ...filesNONTypeAware, ...filesTypeAware];

  // TODO add rules
  configBuilderNONTypeAware
    ?.addConfig('ts/disable-handled-by-ts-compiler-rules', {
      files: allTypescriptFiles,
    })
    .disableAnyRule('', 'constructor-super')
    .disableAnyRule('', 'getter-return')
    .disableAnyRule('', 'no-const-assign')
    .disableAnyRule('', 'no-dupe-args')
    .disableAnyRule('', 'no-dupe-class-members')
    .disableAnyRule('', 'no-dupe-keys')
    .disableAnyRule('', 'no-func-assign')
    // "Note that the compiler will not catch the Object.assign() case. Thus, if you use Object.assign() in your codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-import-assign#handled_by_typescript
    // .disableAnyRule('', 'no-import-assign')
    // "Note that, technically, TypeScript will only catch this if you have the strict or noImplicitThis flags enabled. These are enabled in most TypeScript projects, since they are considered to be best practice." - https://eslint.org/docs/latest/rules/no-invalid-this#rule-details
    // .disableAnyRule('', 'no-invalid-this')
    .disableAnyRule('', 'no-new-native-nonconstructor') // successor of no-new-symbol
    .disableAnyRule('', 'no-obj-calls')
    // "Note that while TypeScript will catch let redeclares and const redeclares, it will not catch var redeclares. Thus, if you use the legacy var keyword in your TypeScript codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-redeclare#handled_by_typescript
    // .disableAnyRule('', 'no-redeclare')
    .disableAnyRule('', 'no-setter-return')
    .disableAnyRule('', 'no-this-before-super')
    .disableAnyRule('', 'no-undef')
    // "TypeScript must be configured with allowUnreachableCode: false for it to consider unreachable code an error." - https://eslint.org/docs/latest/rules/no-unreachable#handled_by_typescript
    // .disableAnyRule('', 'no-unreachable')
    .disableAnyRule('', 'no-unsafe-negation')
    // Does not work correctly when type-only imports are present because you can't combine such an import with a default import.
    .disableAnyRule('', 'no-duplicate-imports');

  const noImplicitCoercionBaseUnEntry = getRuleUnSeverityAndOptionsFromEntry(
    vanillaFinalFlatConfigRules['no-implicit-coercion'] ?? ERROR,
  );
  noImplicitCoercionBaseUnEntry[1][0] = {
    ...noImplicitCoercionBaseUnEntry[1][0],
    // Might be useful for transforming values to strings: `const test = `${someCondition ? 1 : 0}``
    // This rule would suggest replacing template literal with `String` here, which breaks types
    disallowTemplateShorthand: false,
  };

  configBuilderNONTypeAware
    ?.addConfig('ts/overrides', {
      files: allTypescriptFiles,
    })
    .addAnyRule('', 'no-implicit-coercion', ...noImplicitCoercionBaseUnEntry);

  const configBuilderDts = context.createConfigBuilder({}, 'ts');
  configBuilderDts
    ?.addConfig('ts/dts', {
      files: [`**/*.d.${GLOB_TS_X_EXTENSION}`],
    })
    .addRule('consistent-indexed-object-style', OFF)
    .addRule('method-signature-style', OFF)
    .addRule('no-empty-object-type', OFF)
    .addRule('no-explicit-any', OFF)
    .addRule('no-shadow', OFF)
    .addRule('no-unnecessary-type-parameters', OFF)
    .addRule('no-unused-vars', OFF)
    .addRule('no-use-before-define', OFF)
    .disableAnyRule('import', 'newline-after-import')
    .disableAnyRule('import', 'no-default-export')
    .disableAnyRule('', 'vars-on-top')
    .disableAnyRule('', 'no-var')
    .disableAnyRule('sonarjs', 'no-redundant-optional')
    .disableAnyRule('', 'no-duplicate-imports')
    // Allow `export {}` to be present to ensure the file is a module
    .disableAnyRule('unicorn', 'require-module-specifiers');

  const configBuilderDisableNoUnsafe = context.createConfigBuilder(configDisableNoUnsafe, 'ts');
  configBuilderDisableNoUnsafe
    ?.addConfig([
      'ts/disable-no-unsafe',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .addRule('no-unsafe-argument', OFF)
    .addRule('no-unsafe-assignment', OFF)
    .addRule('no-unsafe-call', OFF)
    .addRule('no-unsafe-enum-comparison', OFF)
    .addRule('no-unsafe-member-access', OFF)
    .addRule('no-unsafe-return', OFF)
    .addRule('no-unsafe-type-assertion', OFF)
    .enableConfigTesterForPlugin('ts', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !TS_PLUGIN_NO_UNSAFE_RULES_SET.has(ruleName),
    })
    .addOverrides();

  const configBuilderNoTypeAssertions = context.createConfigBuilder(
    configNoTypeAssertion,
    'no-type-assertion',
  );
  configBuilderNoTypeAssertions
    ?.addConfig([
      'no-type-assertion',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .addRule('no-type-assertion', ERROR) /** @since 1.0.1 */
    .enableConfigTesterForPlugin('no-type-assertion')
    .addOverrides();

  const configBuilderSortTsconfigKeys = context.createConfigBuilder(configSortTsconfigKeys, null);
  if (configSortTsconfigKeys) {
    const configSortTsconfigKeysOptions = assignDefaults(configSortTsconfigKeys, {
      orderTopLevel: true,
      orderCompilerOptions: true,
    });

    const {orderTopLevel, orderCompilerOptions, extraSortKeysConfigs} =
      configSortTsconfigKeysOptions;

    const topLevelOptionsOrder: string[] = Array.isArray(orderTopLevel)
      ? orderTopLevel
      : orderTopLevel
        ? DEFAULT_TSCONFIG_TOP_LEVEL_ORDER
        : [];

    const compilerOptionsOrder: string[] =
      typeof orderCompilerOptions === 'object'
        ? 'preset' in orderCompilerOptions
          ? TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS[orderCompilerOptions.preset]
          : orderCompilerOptions.type === 'order-keys'
            ? orderCompilerOptions.order
            : // eslint-disable-next-line ts/no-unnecessary-condition
              orderCompilerOptions.type === 'order-groups'
              ? orderCompilerOptions.order.flatMap((group) =>
                  orderCompilerOptions.orderWithinGroup &&
                  group in orderCompilerOptions.orderWithinGroup
                    ? orderCompilerOptions.orderWithinGroup[group] === 'alphabetical'
                      ? isKeyIn(group, TSCONFIG_COMPILER_OPTIONS_KEYS)
                        ? TSCONFIG_COMPILER_OPTIONS_KEYS[group]
                        : []
                      : orderCompilerOptions.orderWithinGroup[
                          group
                        ] /* v8 ignore start - guaranteed to exist in runtime, but not during type checking */ ||
                        [] /* v8 ignore stop */
                    : isKeyIn(group, TSCONFIG_COMPILER_OPTIONS_KEYS)
                      ? TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS.antfu.filter((v) =>
                          TSCONFIG_COMPILER_OPTIONS_KEYS[group].includes(v as never),
                        )
                      : [],
                )
              : /* v8 ignore start - not reachable */ []
        : /* v8 ignore stop */
          orderCompilerOptions
          ? TSCONFIG_COMPILER_OPTIONS_ORDER_PRESETS.antfu
          : [];

    configBuilderSortTsconfigKeys
      ?.addConfig([
        'sort-tsconfig-keys',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: ['{tsconfig,*.tsconfig,tsconfig.*}.json'],
          language: ['jsonc', 'x'],
        },
      ])
      .addAnyRule('jsonc', 'sort-keys', ERROR, [
        {
          pathPattern: '^$',
          order: topLevelOptionsOrder,
        },
        {
          pathPattern: '^compilerOptions$',
          order: compilerOptionsOrder,
        },
        ...(extraSortKeysConfigs || []),
      ])
      .addOverrides();
  }

  return {
    configs: [
      configBuilderNONTypeAwareSetup,
      configBuilderNONTypeAware,

      configBuilderTypeAwareSetup,
      configBuilderTypeAware,
      configBuilderDisableNoUnsafe,

      configBuilderDts,
      configBuilderNoTypeAssertions,
      configBuilderSortTsconfigKeys,
    ],
    optionsResolved,
    filesTypeAware,
    ignoresTypeAware,
    setupTypeAwareConfigCreated: configBuilderTypeAwareSetup != null,
  };
}) satisfies TsConfig as TsConfig;

type TsConfig = UnConfigFn<
  'ts',
  {
    vanillaFinalFlatConfigRules: Partial<EslintTypedRulesConfig>;
    astroResolvedOptions: AstroEslintConfigOptions | null;
    vueResolvedOptions: VueEslintConfigOptions | null;
    svelteResolvedOptions: SvelteEslintConfigOptions | null;
  },
  {
    filesTypeAware: string[];
    ignoresTypeAware: string[];
    setupTypeAwareConfigCreated: boolean;
  }
>;
