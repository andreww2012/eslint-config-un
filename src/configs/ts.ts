import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import type Eslint from 'eslint';
import {parser as parserTs, configs as tsEslintConfigs} from 'typescript-eslint';
import {
  ERROR,
  GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
  OFF,
  WARNING,
} from '../constants';
import {
  type AllRulesWithPrefix,
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type DisableAutofixPrefix,
  type FlatConfigEntry,
  type FlatConfigEntryForBuilder,
  type RulesRecord,
} from '../eslint';
import {
  RULE_NO_UNUSED_EXPRESSIONS_OPTIONS,
  RULE_NO_USE_BEFORE_DEFINE_OPTIONS,
  RULE_PREFER_DESTRUCTURING_OPTIONS,
} from './js';
import type {InternalConfigOptions} from './index';

// https://typescript-eslint.io/rules/?=typeInformation
//  [...document.querySelector('table[class^=rulesTable]').tBodies[0].rows].map((row) => row.cells[0].querySelector('a').textContent).map((n) => `'${n.split('/')[1]}'`).join(' | ')
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

type AllTypescriptEslintRules = AllRulesWithPrefix<'@typescript-eslint', true>;
type TypeAwareRulesWithPrefixes =
  `${'' | `${DisableAutofixPrefix}/`}@typescript-eslint/${TypeAwareRules}`;

export interface TsEslintConfigOptions
  extends ConfigSharedOptions<Omit<AllTypescriptEslintRules, TypeAwareRulesWithPrefixes>> {
  typescriptVersion?: string;

  parserOptions?: Omit<TsEslintParserOptions, 'sourceType'> & {
    sourceType?: Eslint.Linter.ParserOptions['sourceType'];
  };

  /**
   * Applies rules requiring type information on the specified `files`.
   *
   * By default uses `ignores` from the parent config.
   * @default true
   */
  configTypeAware?:
    | boolean
    | ConfigSharedOptions<
        Pick<AllTypescriptEslintRules, TypeAwareRulesWithPrefixes & keyof AllTypescriptEslintRules>
      >;

  /**
   * Do not put `.` (dot) before an extension
   * @example ['vue']
   */
  extraFileExtensions?: string[];

  noTypeAssertion?: boolean | 'warning';

  /**
   * If you have too many `no-unsafe-*` reports, you can disable them all using this option. All the rules disabled by this option are:
   * - `@typescript-eslint/no-unsafe-argument`
   * - `@typescript-eslint/no-unsafe-assignment`
   * - `@typescript-eslint/no-unsafe-call`
   * - `@typescript-eslint/no-unsafe-enum-comparison`
   * - `@typescript-eslint/no-unsafe-member-access`
   * - `@typescript-eslint/no-unsafe-return`
   */
  disableNoUnsafeRules?: boolean;
}

const TS_FILES_DEFAULT = [GLOB_TS, GLOB_TSX];

export const tsEslintConfig = (
  options: TsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {configTypeAware = true} = options;

  const extraFilesNONTypeAware: FlatConfigEntry['files'] & {} = [];
  const extraFilesTypeAware: FlatConfigEntry['files'] & {} = [];
  const extraFilesToIgnoreNONTypeAware: FlatConfigEntry['ignores'] & {} = [];
  const extraFilesToIgnoreTypeAware: FlatConfigEntry['ignores'] & {} = [
    GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS,
  ];

  const {vueOptions} = internalOptions;
  const enforceTsInVueOptions = vueOptions?.enforceTypescriptInScriptSection;
  if (enforceTsInVueOptions) {
    const tsInVueOptions =
      typeof enforceTsInVueOptions === 'object'
        ? enforceTsInVueOptions
        : {files: vueOptions.files || [GLOB_VUE]};

    if (tsInVueOptions.typescriptRules !== false) {
      const vueFilesWithTs = tsInVueOptions.files || [];
      extraFilesNONTypeAware.push(...vueFilesWithTs);
      if (tsInVueOptions.typescriptRules !== 'only-non-type-aware') {
        extraFilesTypeAware.push(...vueFilesWithTs);
      }

      extraFilesToIgnoreNONTypeAware.push(...(tsInVueOptions.ignores || []));
      extraFilesToIgnoreTypeAware.push(...(tsInVueOptions.ignores || []));
    }
  }

  const filesNONTypeAwareDefault = [...(options.files || TS_FILES_DEFAULT)];
  const filesNONTypeAware = [...filesNONTypeAwareDefault, ...extraFilesNONTypeAware];
  const ignoresNONTypeAware = [...(options.ignores || []), ...extraFilesToIgnoreNONTypeAware];

  const configTypeAwareOptions = typeof configTypeAware === 'object' ? configTypeAware : {};
  const {files: userFilesTypeAware, ignores: userIgnoresTypeAware} = configTypeAwareOptions;
  const filesTypeAware = [
    ...(userFilesTypeAware || filesNONTypeAwareDefault), // Lint the same files, excluding extra non-TA ones
    ...extraFilesTypeAware,
  ];
  const ignoresTypeAware = [
    ...(userIgnoresTypeAware || options.ignores || []),
    ...extraFilesToIgnoreTypeAware,
  ];

  const tsVersion = options.typescriptVersion
    ? Number.parseFloat(options.typescriptVersion)
    : undefined;

  const generateBaseOptions = (isTypeAware?: boolean): FlatConfigEntryForBuilder => ({
    languageOptions: {
      // @ts-expect-error small types mismatch
      parser: parserTs,
      parserOptions: {
        extraFileExtensions: options.extraFileExtensions?.map((ext) => `.${ext}`),
        sourceType: 'module',
        ...(isTypeAware && {
          projectService: true,
          tsconfigRootDir: process.cwd(),
        }),
        ...options.parserOptions,
      } satisfies TsEslintParserOptions,
    },
  });

  const builder = new ConfigEntryBuilder('@typescript-eslint', options, internalOptions);

  // LEGEND:
  // ❄️ = Feature-frozen in ts-eslint
  // 👍 = Auto-checked and there's barely any need to use this rule

  const noUnsafeRulesSeverity = options.disableNoUnsafeRules ? OFF : WARNING;
  // TODO add rules
  builder
    .addConfig('ts/rules-regular', {
      ...generateBaseOptions(false),
      files: filesNONTypeAware,
      ...(ignoresNONTypeAware.length > 0 && {ignores: ignoresNONTypeAware}),
    })
    .addBulkRules(
      tsEslintConfigs.strict.reduce<RulesRecord>(
        (result, config) => Object.assign(result, config.rules),
        {},
      ),
    )
    .addBulkRules(
      tsEslintConfigs.stylistic.reduce<RulesRecord>(
        (result, config) => Object.assign(result, config.rules),
        {},
      ),
    )
    // 🟢 Strict - overrides
    // .addRule('ban-ts-comment', ERROR)
    .addRule('no-array-constructor', ERROR, [], {overrideBaseRule: true})
    // .addRule('no-duplicate-enum-values', ERROR)
    .addRule('no-dynamic-delete', WARNING)
    .addRule('no-empty-object-type', ERROR, [{allowInterfaces: 'with-single-extends'}])
    .addRule('no-explicit-any', WARNING, [{ignoreRestArgs: true}])
    // .addRule('no-extra-non-null-assertion', ERROR)
    .addRule('no-extraneous-class', ERROR, [
      {
        allowWithDecorator: true, // Primarily for Angular
      },
    ])
    // .addRule('no-invalid-void-type', ERROR)
    // .addRule('no-misused-new', ERROR)
    // .addRule('no-namespace', ERROR)
    // .addRule('no-non-null-asserted-nullish-coalescing', ERROR)
    // .addRule('no-non-null-asserted-optional-chain', ERROR)
    .addRule('no-non-null-assertion', WARNING)
    // .addRule('no-this-alias', ERROR)
    // .addRule('no-unnecessary-type-constraint', ERROR)
    // .addRule('no-unsafe-declaration-merging', ERROR)
    // .addRule('no-unsafe-function-type', ERROR)
    .addRule('no-unused-vars', ERROR, [{ignoreRestSiblings: true}], {
      overrideBaseRule: true,
    })
    .addRule('no-useless-constructor', ERROR, [], {overrideBaseRule: true})
    // .addRule('no-wrapper-object-types', ERROR)
    // .addRule('prefer-as-const', ERROR)
    .addRule('prefer-literal-enum-member', ERROR, [{allowBitwiseExpressions: true}])
    // .addRule('prefer-namespace-keyword', ERROR)
    // .addRule('triple-slash-reference', ERROR)
    .addRule('unified-signatures', ERROR, [{ignoreOverloadsWithDifferentJSDoc: true}])
    // 🟢 Stylistic - overrides
    // .addRule('adjacent-overload-signatures', ERROR)
    // .addRule('array-type', ERROR)
    // .addRule('ban-tslint-comment', ERROR)
    // .addRule('class-literal-property-style', ERROR)
    // .addRule('consistent-generic-constructors', ERROR)
    // .addRule('consistent-indexed-object-style', ERROR)
    // .addRule('consistent-type-assertions', ERROR)
    // .addRule('consistent-type-definitions', ERROR)
    // .addRule('no-confusing-non-null-assertion', ERROR)
    .addRule('no-empty-function', ERROR, [], {overrideBaseRule: true})
    // .addRule('no-inferrable-types', ERROR)
    // .addRule('prefer-for-of', ERROR)
    // .addRule('prefer-function-type', OFF)
    // 🟢 Additional rules
    .addRule(
      'class-methods-use-this',
      ERROR,
      [{ignoreOverrideMethods: true, ignoreClassesThatImplementAnInterface: true}],
      {overrideBaseRule: true},
    )
    .addRule('consistent-type-imports', ERROR, [
      {
        ...(tsVersion && tsVersion >= 4.5 && {fixStyle: 'inline-type-imports'}),
        disallowTypeAnnotations: false,
      },
    ])
    .addRule('default-param-last', ERROR, [], {overrideBaseRule: true})
    // .addRule('explicit-function-return-type', OFF)
    // .addRule('explicit-member-accessibility', OFF)
    .addRule('explicit-module-boundary-types', OFF)
    // .addRule('init-declarations', OFF, [], {overrideBaseRule: true})
    // .addRule('max-params', OFF, [], {overrideBaseRule: true})
    // .addRule('member-ordering', OFF) // ❄️
    .addRule('method-signature-style', ERROR)
    // .addRule('no-dupe-class-members', OFF, [], {overrideBaseRule: true}) // 👍
    .addRule('no-import-type-side-effects', ERROR)
    // .addRule('no-invalid-this', OFF, [], {overrideBaseRule: true}) // 👍
    .addRule('no-loop-func', ERROR, [], {overrideBaseRule: true})
    // .addRule('no-magic-numbers', OFF, [], {overrideBaseRule: true})
    .addAnyRule('no-redeclare', OFF)
    // .addRule('no-redeclare', OFF) // 👍
    .addRule('no-require-imports', OFF)
    // .addRule('no-restricted-imports', OFF, [], {overrideBaseRule: true})
    .addRule('no-shadow', ERROR, [], {overrideBaseRule: true})
    .addRule('no-unnecessary-parameter-property-assignment', ERROR)
    .addRule('no-unused-expressions', ERROR, RULE_NO_UNUSED_EXPRESSIONS_OPTIONS, {
      overrideBaseRule: true,
    })
    .addRule('no-use-before-define', ERROR, RULE_NO_USE_BEFORE_DEFINE_OPTIONS, {
      overrideBaseRule: true,
    })
    .addRule('no-useless-empty-export', ERROR)
    // .addRule('parameter-properties', OFF)
    // .addRule('prefer-enum-initializers', OFF)
    // .addRule('typedef', OFF)
    // 🟢 Disable conflicting rules
    .addAnyRule('no-useless-constructor', OFF)
    .addAnyRule('dot-notation', OFF)
    .addOverrides();

  const builderTypeAware = new ConfigEntryBuilder(
    '@typescript-eslint',
    configTypeAwareOptions,
    internalOptions,
  );

  if (configTypeAware !== false) {
    builderTypeAware
      .addConfig('ts/rules-type-aware', {
        ...generateBaseOptions(true),
        ...(filesTypeAware.length > 0 && {files: filesTypeAware}),
        ...(ignoresTypeAware.length > 0 && {ignores: ignoresTypeAware}),
      })
      .addBulkRules(
        tsEslintConfigs.strictTypeCheckedOnly.reduce<RulesRecord>(
          (result, config) => Object.assign(result, config.rules),
          {},
        ),
      )
      .addBulkRules(
        tsEslintConfigs.stylisticTypeCheckedOnly.reduce<RulesRecord>(
          (result, config) => Object.assign(result, config.rules),
          {},
        ),
      )
      // 🟢 Strict - overrides
      // .addRule('await-thenable', ERROR)
      .addRule('consistent-return', ERROR, [], {overrideBaseRule: true})
      // .addRule('no-array-delete', ERROR)
      // .addRule('no-base-to-string', ERROR)
      .addRule('no-confusing-void-expression', ERROR, [
        {
          ignoreArrowShorthand: true,
        },
      ])
      .addRule('no-deprecated', WARNING)
      // .addRule('no-duplicate-type-constituents', ERROR)
      .addRule('no-floating-promises', ERROR, [
        {
          checkThenables: true,
          ignoreVoid: true, // Default
        },
      ])
      // .addRule('no-for-in-array', ERROR)
      .addRule('no-implied-eval', ERROR, [], {overrideBaseRule: true})
      // .addRule('no-meaningless-void-operator', ERROR)
      // .addRule('no-misused-promises', ERROR)
      .addRule('no-misused-spread', ERROR) // >=8.20.0
      // .addRule('no-mixed-enums', ERROR)
      // .addRule('no-redundant-type-constituents', ERROR)
      // .addRule('no-unnecessary-boolean-literal-compare', ERROR)
      .addRule(
        'no-unnecessary-condition',
        ERROR,
        [
          {
            allowConstantLoopConditions: 'only-allowed-literals',
            checkTypePredicates: true, // >=8.8.0
          },
        ],
        {disableAutofix: true},
      )
      // .addRule('no-unnecessary-template-expression', ERROR)
      // Reason for disabling autofix: could remove type aliases
      .addRule('no-unnecessary-type-arguments', ERROR, [], {
        disableAutofix: true,
      })
      .addRule('no-unnecessary-type-assertion', ERROR, [], {
        disableAutofix: true, // Reason: https://github.com/typescript-eslint/typescript-eslint/issues/8721
      })
      // .addRule('no-unnecessary-type-parameters', ERROR)
      .addRule('no-unsafe-argument', noUnsafeRulesSeverity)
      .addRule('no-unsafe-assignment', noUnsafeRulesSeverity)
      .addRule('no-unsafe-call', noUnsafeRulesSeverity)
      .addRule('no-unsafe-enum-comparison', noUnsafeRulesSeverity)
      .addRule('no-unsafe-member-access', noUnsafeRulesSeverity)
      .addRule('no-unsafe-return', noUnsafeRulesSeverity)
      // .addRule('no-unsafe-type-assertion', OFF)
      // .addRule('no-unsafe-unary-minus', ERROR)
      .addAnyRule('no-throw-literal', OFF) // Note: has different name
      // .addRule('only-throw-error', ERROR)
      .addRule('prefer-promise-reject-errors', ERROR, [], {
        overrideBaseRule: true,
      })
      // .addRule('prefer-reduce-type-parameter', ERROR)
      // .addRule('prefer-return-this-type', ERROR)
      .addRule('require-await', ERROR, [], {overrideBaseRule: true})
      // .addRule('restrict-plus-operands', ERROR)
      .addRule('restrict-template-expressions', ERROR, [{allowAny: false, allowRegExp: false}])
      // .addRule('unbound-method', ERROR)
      // .addRule('use-unknown-in-catch-callback-variable', ERROR)
      // 🟢 Stylistic - overrides
      .addRule('dot-notation', ERROR, [{allowIndexSignaturePropertyAccess: true}], {
        overrideBaseRule: true,
      })
      // .addRule('non-nullable-type-assertion-style', ERROR)
      // .addRule('prefer-find', ERROR)
      .addAnyRule('unicorn/prefer-includes', OFF)
      // .addRule('prefer-includes', ERROR)
      .addRule('prefer-nullish-coalescing', OFF)
      // .addRule('prefer-optional-chain', ERROR)
      .addRule('prefer-regexp-exec', OFF)
      .addRule('prefer-string-starts-ends-with', ERROR, [{allowSingleElementEquality: 'always'}])
      // 🟢 Additional rules
      .addRule('consistent-type-exports', ERROR, [{fixMixedExportsWithInlineTypeSpecifier: true}])
      // .addRule('naming-convention', OFF) // ❄️
      // .addRule('no-unnecessary-qualifier', OFF)
      .addRule('prefer-destructuring', ERROR, RULE_PREFER_DESTRUCTURING_OPTIONS, {
        overrideBaseRule: true,
      })
      .addAnyRule('unicorn/prefer-array-find', OFF) // Note: in Unicorn
      .addRule('prefer-readonly', ERROR)
      // .addRule('prefer-readonly-parameter-types', OFF)
      // .addRule('promise-function-async', OFF)
      // .addRule('related-getter-setter-pairs', ERROR)
      // .addRule('require-array-sort-compare', OFF)
      // Note: has different name. Also note that the original rule is deprecated and not included in this config, but we disable it anyway just for safety
      .addAnyRule('no-return-await', OFF) // Disabled by default since v8
      .addRule('return-await', ERROR, ['always'])
      // .addRule('strict-boolean-expressions', OFF)
      .addRule('switch-exhaustiveness-check', ERROR)
      .addOverrides();
  }

  // TODO add rules
  builder
    .addConfig('ts/disable-handled-by-ts-compiler-rules', {
      files: [...TS_FILES_DEFAULT, ...filesNONTypeAware, ...filesTypeAware],
    })
    .addAnyRule('constructor-super', OFF)
    .addAnyRule('getter-return', OFF)
    .addAnyRule('no-const-assign', OFF)
    .addAnyRule('no-dupe-args', OFF)
    .addAnyRule('no-dupe-class-members', OFF)
    .addAnyRule('no-dupe-keys', OFF)
    .addAnyRule('no-func-assign', OFF)
    // "Note that the compiler will not catch the Object.assign() case. Thus, if you use Object.assign() in your codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-import-assign#handled_by_typescript
    // .addRule('no-import-assign', OFF)
    // "Note that, technically, TypeScript will only catch this if you have the strict or noImplicitThis flags enabled. These are enabled in most TypeScript projects, since they are considered to be best practice." - https://eslint.org/docs/latest/rules/no-invalid-this#rule-details
    // .addRule('no-invalid-this', OFF)
    .addAnyRule('no-new-native-nonconstructor', OFF) // successor of no-new-symbol
    .addAnyRule('no-obj-calls', OFF)
    // "Note that while TypeScript will catch let redeclares and const redeclares, it will not catch var redeclares. Thus, if you use the legacy var keyword in your TypeScript codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-redeclare#handled_by_typescript
    // .addRule('no-redeclare', OFF)
    .addAnyRule('no-setter-return', OFF)
    .addAnyRule('no-this-before-super', OFF)
    .addAnyRule('no-undef', OFF)
    // "TypeScript must be configured with allowUnreachableCode: false for it to consider unreachable code an error." - https://eslint.org/docs/latest/rules/no-unreachable#handled_by_typescript
    // .addRule('no-unreachable', OFF)
    .addAnyRule('no-unsafe-negation', OFF)
    // Does not work correctly when type-only imports are present because you can't combine such an import with a default import.
    .addAnyRule('no-duplicate-imports', OFF);

  builder
    .addConfig('ts/dts', {
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
    .addAnyRule('import/newline-after-import', OFF)
    .addAnyRule('import/no-default-export', OFF)
    .addAnyRule('vars-on-top', OFF)
    .addAnyRule('no-var', OFF)
    .addAnyRule('sonarjs/no-redundant-optional', OFF);

  if (options.noTypeAssertion) {
    builder
      .addConfig('ts/no-type-assertion')
      .addAnyRule(
        'no-type-assertion/no-type-assertion',
        options.noTypeAssertion === 'warning' ? WARNING : ERROR,
      );
  }

  return [...builder.getAllConfigs(), ...builderTypeAware.getAllConfigs()];
};
