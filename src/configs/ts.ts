import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import type Eslint from 'eslint';
import {ERROR, GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS, GLOB_TSX, OFF, WARNING} from '../constants';
import {type RulesRecordPartial, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, interopDefault} from '../utils';
import type {AstroEslintConfigOptions} from './astro';
import {
  RULE_NO_UNUSED_EXPRESSIONS_OPTIONS,
  RULE_NO_USE_BEFORE_DEFINE_OPTIONS,
  RULE_PREFER_DESTRUCTURING_OPTIONS,
} from './js';
import type {SvelteEslintConfigOptions} from './svelte';
import type {VueEslintConfigOptions} from './vue';
import type {UnConfigFn} from './index';

// TODO generate automatically?
type TypeAwareRules =
  | 'await-thenable'
  | 'consistent-return'
  | 'consistent-type-exports'
  | 'dot-notation'
  | 'naming-convention'
  | 'no-array-delete'
  | 'no-base-to-string'
  | 'no-confusing-void-expression'
  | 'no-deprecated'
  | 'no-duplicate-type-constituents'
  | 'no-floating-promises'
  | 'no-for-in-array'
  | 'no-implied-eval'
  | 'no-meaningless-void-operator'
  | 'no-misused-promises'
  | 'no-misused-spread'
  | 'no-mixed-enums'
  | 'no-redundant-type-constituents'
  | 'no-unnecessary-boolean-literal-compare'
  | 'no-unnecessary-condition'
  | 'no-unnecessary-qualifier'
  | 'no-unnecessary-template-expression'
  | 'no-unnecessary-type-arguments'
  | 'no-unnecessary-type-assertion'
  | 'no-unnecessary-type-conversion'
  | 'no-unnecessary-type-parameters'
  | 'no-unsafe-argument'
  | 'no-unsafe-assignment'
  | 'no-unsafe-call'
  | 'no-unsafe-enum-comparison'
  | 'no-unsafe-member-access'
  | 'no-unsafe-return'
  | 'no-unsafe-type-assertion'
  | 'no-unsafe-unary-minus'
  | 'non-nullable-type-assertion-style'
  | 'only-throw-error'
  | 'prefer-destructuring'
  | 'prefer-find'
  | 'prefer-includes'
  | 'prefer-nullish-coalescing'
  | 'prefer-optional-chain'
  | 'prefer-promise-reject-errors'
  | 'prefer-readonly'
  | 'prefer-readonly-parameter-types'
  | 'prefer-reduce-type-parameter'
  | 'prefer-regexp-exec'
  | 'prefer-return-this-type'
  | 'prefer-string-starts-ends-with'
  | 'promise-function-async'
  | 'related-getter-setter-pairs'
  | 'require-array-sort-compare'
  | 'require-await'
  | 'restrict-plus-operands'
  | 'restrict-template-expressions'
  | 'return-await'
  | 'strict-boolean-expressions'
  | 'switch-exhaustiveness-check'
  | 'unbound-method'
  | 'use-unknown-in-catch-callback-variable';

type TypeAwareRulesWithPrefixes = Pick<
  RulesRecordPartial<'@typescript-eslint'>,
  `@typescript-eslint/${TypeAwareRules}`
>;

export interface TsEslintConfigOptions
  extends UnConfigOptions<
    Omit<RulesRecordPartial<'@typescript-eslint'>, keyof TypeAwareRulesWithPrefixes>
  > {
  /**
   * Applies rules requiring type information on the specified `files`.
   *
   * By default uses `ignores` from the parent config.
   * @default true
   */
  configTypeAware?: boolean | UnConfigOptions<TypeAwareRulesWithPrefixes>;

  /**
   * Disallows any type assertions via [`eslint-plugin-no-type-assertion`](https://www.npmjs.com/package/eslint-plugin-no-type-assertion) plugin.
   *
   * If you'd like to disallow only unsafe type assertions, enable [`@typescript-eslint/no-unsafe-type-assertion`](https://typescript-eslint.io/rules/no-unsafe-type-assertion) rule instead.
   * @default false
   */
  configNoTypeAssertion?: boolean | UnConfigOptions<'no-type-assertion'>;

  /**
   * By default it will be auto-detected from the installed `typescript` package.
   * It will contain major and minor version numbers, e.g. even if you installed
   * TypeScript 5.8.1, `typescriptVersion` will be `5.8`.
   */
  typescriptVersion?: number;

  parserOptions?: Omit<TsEslintParserOptions, 'sourceType'> & {
    sourceType?: Eslint.Linter.ParserOptions['sourceType'];
  };

  /**
   * Do not put `.` (dot) before an extension
   * @example ['vue']
   */
  extraFileExtensions?: string[];

  /**
   * If you have too many `no-unsafe-*` reports, you can disable them all using this option. All the rules disabled by this option are:
   * - `@typescript-eslint/no-unsafe-argument`
   * - `@typescript-eslint/no-unsafe-assignment`
   * - `@typescript-eslint/no-unsafe-call`
   * - `@typescript-eslint/no-unsafe-enum-comparison`
   * - `@typescript-eslint/no-unsafe-member-access`
   * - `@typescript-eslint/no-unsafe-return`
   *
   * Note: this option does not affect [`@typescript-eslint/no-unsafe-type-assertion`](https://typescript-eslint.io/rules/no-unsafe-type-assertion) rule, which is disabled by default.
   */
  disableNoUnsafeRules?: boolean;
}

const TS_FILES_DEFAULT = [GLOB_TSX];

export const tsUnConfig: UnConfigFn<
  'ts',
  unknown,
  [
    {
      astroResolvedOptions: AstroEslintConfigOptions | null;
      vueResolvedOptions: VueEslintConfigOptions | null;
      svelteResolvedOptions: SvelteEslintConfigOptions | null;
    },
  ]
> = async (context, {astroResolvedOptions, vueResolvedOptions, svelteResolvedOptions}) => {
  const {parser: typescriptEslintParser} = await interopDefault(import('typescript-eslint'));

  const typescriptPackageInfo = context.packagesInfo.typescript;
  const optionsRaw = context.rootOptions.configs?.ts;

  const optionsResolved = assignDefaults(optionsRaw, {
    configTypeAware: true,
    configNoTypeAssertion: false,
    extraFileExtensions: [
      context.configsMeta.vue.enabled && 'vue',
      context.configsMeta.astro.enabled && 'astro',
      context.configsMeta.svelte.enabled && 'svelte',
    ].filter((v) => v !== false),
  } satisfies TsEslintConfigOptions);
  optionsResolved.typescriptVersion ??= typescriptPackageInfo?.versions.majorAndMinor ?? undefined;
  const {configTypeAware, configNoTypeAssertion, extraFileExtensions, typescriptVersion} =
    optionsResolved;

  const extraFilesNONTypeAware: string[] = [];
  const extraFilesTypeAware: string[] = [];
  const extraFilesToIgnoreNONTypeAware: string[] = [];
  const extraFilesToIgnoreTypeAware: string[] = [GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS];

  // TODO the following 3 sections are copy-pasty

  if (vueResolvedOptions) {
    const {enforceTypescriptInScriptSection} = vueResolvedOptions;
    const tsInVueOptions =
      typeof enforceTypescriptInScriptSection === 'object'
        ? enforceTypescriptInScriptSection
        : {files: vueResolvedOptions.files};

    if (enforceTypescriptInScriptSection && tsInVueOptions.typescriptRules !== false) {
      const vueFilesWithTs = tsInVueOptions.files || [];
      const vueIgnoredFilesWithTs = tsInVueOptions.ignores || [];

      extraFilesNONTypeAware.push(...vueFilesWithTs);
      if (tsInVueOptions.typescriptRules !== 'only-non-type-aware') {
        extraFilesTypeAware.push(...vueFilesWithTs);
      }

      extraFilesToIgnoreNONTypeAware.push(...vueIgnoredFilesWithTs);
      extraFilesToIgnoreTypeAware.push(...vueIgnoredFilesWithTs);
    }
  }

  if (astroResolvedOptions) {
    const astroFilesWithTs = astroResolvedOptions.files || [];
    const astroIgnoredFilesWithTs = astroResolvedOptions.ignores || [];

    extraFilesNONTypeAware.push(...astroFilesWithTs);
    extraFilesTypeAware.push(...astroFilesWithTs);
    extraFilesToIgnoreNONTypeAware.push(...astroIgnoredFilesWithTs);
    extraFilesToIgnoreTypeAware.push(...astroIgnoredFilesWithTs);
  }

  if (svelteResolvedOptions) {
    const svelteFilesWithTs = svelteResolvedOptions.files || [];
    const svelteIgnoredFilesWithTs = svelteResolvedOptions.ignores || [];

    extraFilesNONTypeAware.push(...svelteFilesWithTs);
    extraFilesTypeAware.push(...svelteFilesWithTs);
    extraFilesToIgnoreNONTypeAware.push(...svelteIgnoredFilesWithTs);
    extraFilesToIgnoreTypeAware.push(...svelteIgnoredFilesWithTs);
  }

  const filesNONTypeAwareDefault =
    optionsResolved.files?.length === 0 ? [] : [...(optionsResolved.files || TS_FILES_DEFAULT)];
  const filesNONTypeAware = [...filesNONTypeAwareDefault, ...extraFilesNONTypeAware].flat();
  const ignoresNONTypeAware = [
    ...(optionsResolved.ignores || []),
    ...extraFilesToIgnoreNONTypeAware,
  ];

  const configTypeAwareOptions = typeof configTypeAware === 'object' ? configTypeAware : {};
  const {files: userFilesTypeAware, ignores: userIgnoresTypeAware} = configTypeAwareOptions;
  const filesTypeAware = [
    ...(userFilesTypeAware?.length === 0 ? [] : [userFilesTypeAware || filesNONTypeAwareDefault]), // Lint the same files, excluding extra non-TA ones
    ...extraFilesTypeAware,
  ].flat();
  const ignoresTypeAware = [
    ...(userIgnoresTypeAware || optionsResolved.ignores || []),
    ...extraFilesToIgnoreTypeAware,
  ];

  const generateSetupConfigBuilder = (files: string[], ignores: string[], isTypeAware: boolean) => {
    const configBuilderSetup = createConfigBuilder(context, {}, '@typescript-eslint');
    configBuilderSetup
      ?.addConfig(`ts/${isTypeAware ? '' : 'non-'}type-aware/setup`, {
        // Applying this generally to all files is unacceptable
        files: files.length > 0 ? files : TS_FILES_DEFAULT,
        ignores,
        languageOptions: {
          // @ts-expect-error small types mismatch
          parser: typescriptEslintParser,
          parserOptions: {
            extraFileExtensions: extraFileExtensions.map((ext) => `.${ext}`),
            sourceType: 'module',
            ...(isTypeAware && {
              projectService: true,
              tsconfigRootDir: process.cwd(),
            }),
            ...optionsResolved.parserOptions,
          } satisfies TsEslintParserOptions,
        },
      })
      .disableAnyRule('', 'no-unused-vars')
      .disableAnyRule('', 'no-use-before-define')
      .disableAnyRule('', 'no-shadow')
      .disableAnyRule('', 'no-redeclare');

    return configBuilderSetup;
  };

  const configBuilderNONTypeAwareSetup = generateSetupConfigBuilder(
    filesNONTypeAware,
    ignoresNONTypeAware,
    false,
  );

  const configBuilderNONTypeAware = createConfigBuilder(
    context,
    {
      ...(filesNONTypeAware.length > 0 && {files: filesNONTypeAware}),
      ...(ignoresNONTypeAware.length > 0 && {ignores: ignoresNONTypeAware}),
    },
    '@typescript-eslint',
  );

  const noUnsafeRulesSeverity = optionsResolved.disableNoUnsafeRules ? OFF : WARNING;

  // Legend:
  // 🟣 - in strict
  // 💅 - in stylistic
  // ❄️ = Feature-frozen in ts-eslint
  // 👍 = Auto-checked and there's barely any need to use this rule

  // TODO add rules
  configBuilderNONTypeAware
    ?.addConfig(['ts/non-type-aware/rules', {includeDefaultFilesAndIgnores: true}])
    /* Category: Strict */
    .addRule('ban-ts-comment', ERROR) // 🟣
    .addRule('no-array-constructor', ERROR) // 🟣
    .disableAnyRule('', 'no-array-constructor') // 🟣
    .addRule('no-duplicate-enum-values', ERROR) // 🟣
    .addRule('no-dynamic-delete', WARNING) // 🟣
    .addRule('no-empty-object-type', ERROR, [{allowInterfaces: 'with-single-extends'}]) // 🟣
    .addRule('no-explicit-any', WARNING, [{ignoreRestArgs: true}]) // 🟣
    .addRule('no-extra-non-null-assertion', ERROR) // 🟣
    .addRule('no-extraneous-class', ERROR, [
      {
        allowWithDecorator: true, // Primarily for Angular
      },
    ]) // 🟣
    .addRule('no-invalid-void-type', ERROR) // 🟣
    .addRule('no-misused-new', ERROR) // 🟣
    .addRule('no-namespace', ERROR) // 🟣
    .addRule('no-non-null-asserted-nullish-coalescing', ERROR) // 🟣
    .addRule('no-non-null-asserted-optional-chain', ERROR) // 🟣
    .addRule('no-non-null-assertion', WARNING) // 🟣
    .addRule('no-this-alias', ERROR) // 🟣
    .addRule('no-unnecessary-type-constraint', ERROR) // 🟣
    .addRule('no-unsafe-declaration-merging', ERROR) // 🟣
    .addRule('no-unsafe-function-type', ERROR) // 🟣
    .addRule('no-unused-vars', ERROR, [{ignoreRestSiblings: true}]) // 🟣
    .disableAnyRule('', 'no-unused-vars') // 🟣
    .addRule('no-useless-constructor', ERROR) // 🟣
    .disableAnyRule('', 'no-useless-constructor') // 🟣
    .addRule('no-wrapper-object-types', ERROR) // 🟣
    .addRule('prefer-as-const', ERROR) // 🟣
    .addRule('prefer-literal-enum-member', ERROR, [{allowBitwiseExpressions: true}]) // 🟣
    .addRule('prefer-namespace-keyword', ERROR) // 🟣
    .addRule('triple-slash-reference', ERROR) // 🟣
    .addRule('unified-signatures', ERROR, [{ignoreOverloadsWithDifferentJSDoc: true}]) // 🟣
    /* Category: Stylistic */
    .addRule('adjacent-overload-signatures', ERROR) // 💅
    .addRule('array-type', ERROR) // 💅
    .addRule('ban-tslint-comment', ERROR) // 💅
    .addRule('class-literal-property-style', ERROR) // 💅
    .addRule('consistent-generic-constructors', ERROR) // 💅
    .addRule('consistent-indexed-object-style', ERROR) // 💅
    .addRule('consistent-type-assertions', ERROR) // 💅
    .addRule('consistent-type-definitions', ERROR) // 💅
    .addRule('no-confusing-non-null-assertion', ERROR) // 💅
    .addRule('no-empty-function', ERROR) // 💅
    .disableAnyRule('', 'no-empty-function') // 💅
    .addRule('no-inferrable-types', ERROR) // 💅
    .addRule('prefer-for-of', ERROR) // 💅
    .addRule('prefer-function-type', OFF) // 💅
    /* Category: Additional rules */
    .addRule('class-methods-use-this', ERROR, [
      {ignoreOverrideMethods: true, ignoreClassesThatImplementAnInterface: true},
    ])
    .disableAnyRule('', 'class-methods-use-this')
    .addRule('consistent-type-imports', ERROR, [
      {
        ...(typescriptVersion && typescriptVersion >= 4.5 && {fixStyle: 'inline-type-imports'}),
        disallowTypeAnnotations: false,
      },
    ])
    .addRule('default-param-last', ERROR)
    .disableAnyRule('', 'default-param-last')
    .addRule('explicit-function-return-type', OFF)
    .addRule('explicit-member-accessibility', OFF)
    .addRule('explicit-module-boundary-types', OFF)
    .addRule('init-declarations', OFF)
    .disableAnyRule('', 'init-declarations')
    .addRule('max-params', OFF)
    .disableAnyRule('', 'max-params')
    .addRule('member-ordering', OFF) // ❄️
    .addRule('method-signature-style', ERROR)
    .addRule('no-dupe-class-members', OFF) // 👍
    .disableAnyRule('', 'no-dupe-class-members') // 🟣
    .addRule('no-import-type-side-effects', ERROR)
    .addRule('no-invalid-this', OFF) // 👍
    .disableAnyRule('', 'no-invalid-this')
    .addRule('no-loop-func', ERROR)
    .disableAnyRule('', 'no-loop-func')
    .addRule('no-magic-numbers', OFF)
    .disableAnyRule('', 'no-magic-numbers')
    .addRule('no-redeclare', OFF) // 👍
    .disableAnyRule('', 'no-redeclare')
    .addRule('no-require-imports', OFF) // 🟣
    .addRule('no-restricted-imports', OFF)
    .disableAnyRule('', 'no-restricted-imports')
    .addRule('no-shadow', ERROR)
    .disableAnyRule('', 'no-shadow')
    .addRule('no-unnecessary-parameter-property-assignment', ERROR)
    .addRule('no-unused-expressions', ERROR, RULE_NO_UNUSED_EXPRESSIONS_OPTIONS) // 🟣
    .disableAnyRule('', 'no-unused-expressions') // 🟣
    .addRule('no-use-before-define', ERROR, RULE_NO_USE_BEFORE_DEFINE_OPTIONS)
    .disableAnyRule('', 'no-use-before-define')
    .addRule('no-useless-empty-export', ERROR)
    .addRule('parameter-properties', OFF)
    .addRule('prefer-enum-initializers', OFF)
    .addRule('typedef', OFF)
    /* Category: Disable conflicting rules */
    .disableAnyRule('', 'no-useless-constructor')
    .disableAnyRule('', 'dot-notation')
    .addOverrides();

  // CONFIG TYPE AWARE

  const configBuilderTypeAwareSetup = generateSetupConfigBuilder(
    filesTypeAware,
    ignoresTypeAware,
    true,
  );

  const configBuilderTypeAware = createConfigBuilder(
    context,
    configTypeAware === false
      ? false
      : {
          ...(typeof configTypeAware === 'object' ? configTypeAware : {}),
          // This is an exception for "files is empty array disables only one config" rule. If parent config gets an empty array, we must disable type-aware rules too
          ...(optionsResolved.files?.length === 0 && {files: []}),
        },
    '@typescript-eslint',
  );

  configBuilderTypeAware
    ?.addConfig('ts/type-aware/rules', {
      ...(filesTypeAware.length > 0 && {files: filesTypeAware}),
      ...(ignoresTypeAware.length > 0 && {ignores: ignoresTypeAware}),
    })
    /* Category: Strict */
    .addRule('await-thenable', ERROR) // 🟣
    .addRule('consistent-return', ERROR)
    .disableAnyRule('', 'consistent-return')
    .addRule('no-array-delete', ERROR) // 🟣
    .addRule('no-base-to-string', ERROR) // 🟣
    .addRule('no-confusing-void-expression', ERROR, [{ignoreArrowShorthand: true}]) // 🟣
    .addRule('no-deprecated', WARNING) // 🟣
    .addRule('no-duplicate-type-constituents', ERROR) // 🟣
    .addRule('no-floating-promises', ERROR, [
      {
        checkThenables: true,
        ignoreVoid: true, // Default
      },
    ]) // 🟣
    .addRule('no-for-in-array', ERROR) // 🟣
    .addRule('no-implied-eval', ERROR) // 🟣
    .disableAnyRule('', 'no-implied-eval') // 🟣
    .addRule('no-meaningless-void-operator', ERROR) // 🟣
    .addRule('no-misused-promises', ERROR) // 🟣
    .addRule('no-misused-spread', ERROR) // 🟣 >=8.20.0
    .addRule('no-mixed-enums', ERROR) // 🟣
    .addRule('no-redundant-type-constituents', ERROR) // 🟣
    .addRule('no-unnecessary-boolean-literal-compare', ERROR) // 🟣
    .addRule('no-unnecessary-condition', ERROR, [
      {
        allowConstantLoopConditions: 'only-allowed-literals',
        checkTypePredicates: true, // >=8.8.0
      },
    ]) // 🟣
    .addRule('no-unnecessary-template-expression', ERROR) // 🟣
    // Reason for disabling autofix: could remove type aliases
    .addRule('no-unnecessary-type-arguments', ERROR, [], {
      disableAutofix: true,
    }) // 🟣
    .addRule('no-unnecessary-type-assertion', ERROR) // 🟣
    .addRule('no-unnecessary-type-conversion', ERROR)
    .addRule('no-unnecessary-type-parameters', ERROR) // 🟣
    .addRule('no-unsafe-argument', noUnsafeRulesSeverity) // 🟣
    .addRule('no-unsafe-assignment', noUnsafeRulesSeverity) // 🟣
    .addRule('no-unsafe-call', noUnsafeRulesSeverity) // 🟣
    .addRule('no-unsafe-enum-comparison', noUnsafeRulesSeverity) // 🟣
    .addRule('no-unsafe-member-access', noUnsafeRulesSeverity) // 🟣
    .addRule('no-unsafe-return', noUnsafeRulesSeverity) // 🟣
    .addRule('no-unsafe-type-assertion', OFF)
    .addRule('no-unsafe-unary-minus', ERROR) // 🟣
    .addRule('only-throw-error', ERROR, [{allowRethrowing: true}]) // 🟣
    .disableAnyRule('', 'no-throw-literal') // Note: has different name
    .addRule('prefer-promise-reject-errors', ERROR) // 🟣
    .disableAnyRule('', 'prefer-promise-reject-errors') // 🟣
    .addRule('prefer-reduce-type-parameter', ERROR) // 🟣
    .addRule('prefer-return-this-type', ERROR) // 🟣
    .addRule('require-await', ERROR) // 🟣
    .disableAnyRule('', 'require-await') // 🟣
    .addRule('restrict-plus-operands', ERROR) // 🟣
    .addRule('restrict-template-expressions', ERROR, [{allowAny: false, allowRegExp: false}]) // 🟣
    .addRule('unbound-method', ERROR) // 🟣
    .addRule('use-unknown-in-catch-callback-variable', ERROR) // 🟣
    /* Category: Stylistic */
    .addRule('dot-notation', ERROR, [{allowIndexSignaturePropertyAccess: true}]) // 💅
    .disableAnyRule('', 'dot-notation') // 💅
    .addRule('non-nullable-type-assertion-style', ERROR) // 💅
    .addRule('prefer-find', ERROR) // 💅
    .addRule('prefer-includes', ERROR) // 💅
    .disableAnyRule('unicorn', 'prefer-includes')
    .addRule('prefer-nullish-coalescing', OFF) // 💅
    .addRule('prefer-optional-chain', ERROR) // 💅
    .addRule('prefer-regexp-exec', OFF) // 💅
    .addRule('prefer-string-starts-ends-with', ERROR, [{allowSingleElementEquality: 'always'}]) // 💅
    /* Category: Additional rules */
    .addRule('consistent-type-exports', ERROR, [{fixMixedExportsWithInlineTypeSpecifier: true}])
    .addRule('naming-convention', OFF) // ❄️
    .addRule('no-unnecessary-qualifier', OFF)
    .addRule('prefer-destructuring', ERROR, RULE_PREFER_DESTRUCTURING_OPTIONS)
    .disableAnyRule('', 'prefer-destructuring')
    .disableAnyRule('unicorn', 'prefer-array-find')
    .addRule('prefer-readonly', ERROR)
    .addRule('prefer-readonly-parameter-types', OFF)
    .addRule('promise-function-async', OFF)
    .addRule('related-getter-setter-pairs', ERROR) // 🟣
    .addRule('require-array-sort-compare', OFF)
    .addRule('return-await', ERROR, ['always']) // 🟣
    // Note: has different name. Also note that the original rule is deprecated and not included in this config, but we disable it anyway just for safety
    .disableAnyRule('', 'no-return-await') // 🟣
    .addRule('strict-boolean-expressions', OFF)
    .addRule('switch-exhaustiveness-check', ERROR)
    .addOverrides();

  // TODO add rules
  configBuilderNONTypeAware
    ?.addConfig('ts/disable-handled-by-ts-compiler-rules', {
      files: [...TS_FILES_DEFAULT, ...filesNONTypeAware, ...filesTypeAware],
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

  const configBuilderDts = createConfigBuilder(context, {}, '@typescript-eslint');
  configBuilderDts
    ?.addConfig('ts/dts', {
      files: ['**/*.d.?([cm])ts'],
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
    .disableAnyRule('', 'no-duplicate-imports');

  const configBuilderNoTypeAssertions = createConfigBuilder(
    context,
    configNoTypeAssertion,
    'no-type-assertion',
  );
  configBuilderNoTypeAssertions
    ?.addConfig('no-type-assertion')
    .addRule('no-type-assertion', ERROR)
    .addOverrides();

  return {
    configs: [
      configBuilderNONTypeAwareSetup,
      configBuilderNONTypeAware,

      configBuilderTypeAwareSetup,
      configBuilderTypeAware,

      configBuilderDts,
      configBuilderNoTypeAssertions,
    ],
    optionsResolved,
  };
};
