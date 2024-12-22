import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import type Eslint from 'eslint';
// @ts-expect-error no typings
import eslintPluginNoTypeAssertion from 'eslint-plugin-no-type-assertion';
import {
  parser as parserTs,
  plugin as pluginTs,
  configs as tsEslintConfigs,
} from 'typescript-eslint';
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
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type FlatConfigEntryForBuilder,
  type RuleOverrides,
  type RulesRecord,
} from '../eslint';
import {
  RULE_NO_UNUSED_EXPRESSIONS_OPTIONS,
  RULE_NO_USE_BEFORE_DEFINE_OPTIONS,
  RULE_PREFER_DESTRUCTURING_OPTIONS,
} from './js';
import type {InternalConfigOptions} from './index';

export interface TsEslintConfigOptions extends ConfigSharedOptions<'@typescript-eslint'> {
  typescriptVersion?: string;
  parserOptions?: Omit<TsEslintParserOptions, 'sourceType'> & {
    sourceType?: Eslint.Linter.ParserOptions['sourceType'];
  };
  /**
   * Pass `true` to enable type-aware checks for all `files`
   * @default true
   */
  filesTypeAware?: FlatConfigEntry['files'] | boolean;
  /**
   * Pass `true` to ignore the same files as in `ignores`
   */
  ignoresTypeAware?: FlatConfigEntry['ignores'] | boolean;
  overridesTypeAware?: RuleOverrides<'@typescript-eslint'>; // TODO only type-aware rules?
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

export const tsEslintConfig = (
  options: TsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const onlyTsFiles = [GLOB_TS, GLOB_TSX];
  const extraFiles: FlatConfigEntry['files'] & {} = [];
  const extraFilesToIgnore: FlatConfigEntry['ignores'] & {} = [];
  const extraFilesToIgnoreTypeAware: FlatConfigEntry['ignores'] & {} = [
    GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS,
  ];

  const {vueOptions} = internalOptions;
  if (vueOptions) {
    const {enforceTypescriptInScriptSection} = vueOptions;
    const vueFilesWithTs =
      typeof enforceTypescriptInScriptSection === 'object'
        ? enforceTypescriptInScriptSection.files || []
        : enforceTypescriptInScriptSection
          ? vueOptions.files || [GLOB_VUE]
          : [];
    const vueFilesWithoutTs =
      typeof enforceTypescriptInScriptSection === 'object'
        ? enforceTypescriptInScriptSection.ignores || []
        : [];
    extraFiles.push(...vueFilesWithTs);
    extraFilesToIgnore.push(...vueFilesWithoutTs);
  }

  const filesNonTypeAware = [...(options.files || onlyTsFiles), ...extraFiles];
  const ignoresNonTypeAware = [...(options.ignores || []), ...extraFilesToIgnore];
  const filesTypeAware = [
    ...(options.filesTypeAware === true || options.filesTypeAware == null
      ? onlyTsFiles
      : options.filesTypeAware || []),
    ...extraFiles,
  ];
  const ignoresTypeAware = [
    ...(options.ignoresTypeAware === true ? options.ignores || [] : options.ignoresTypeAware || []),
    ...extraFilesToIgnoreTypeAware,
  ];
  const filesAll = [...onlyTsFiles, ...filesTypeAware];

  const tsVersion = options.typescriptVersion
    ? Number.parseFloat(options.typescriptVersion)
    : undefined;

  const generateBaseOptions = (isTypeAware?: boolean): FlatConfigEntryForBuilder => ({
    languageOptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      parser: parserTs as any,
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

  const builder = new ConfigEntryBuilder<'@typescript-eslint'>(options, internalOptions);

  builder.addConfig('ts/setup', {
    plugins: {
      // @ts-expect-error small types mismatch
      '@typescript-eslint': pluginTs,
    },
  });

  // LEGEND:
  // ❄️ = Feature-frozen in ts-eslint
  // 👍 = Auto-checked and there's barely any need to use this rule

  const noUnsafeRulesSeverity = options.disableNoUnsafeRules ? OFF : WARNING;
  // TODO add rules
  builder
    .addConfig('ts/rules-regular', {
      ...generateBaseOptions(false),
      files: filesNonTypeAware,
      ...(ignoresNonTypeAware.length > 0 && {ignores: ignoresNonTypeAware}),
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
    // .addRule('@typescript-eslint/ban-ts-comment', ERROR)
    .addRule('@typescript-eslint/no-array-constructor', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/no-duplicate-enum-values', ERROR)
    .addRule('@typescript-eslint/no-dynamic-delete', WARNING)
    .addRule('@typescript-eslint/no-empty-object-type', ERROR, [
      {allowInterfaces: 'with-single-extends'},
    ])
    .addRule('@typescript-eslint/no-explicit-any', WARNING, [{ignoreRestArgs: true}])
    // .addRule('@typescript-eslint/no-extra-non-null-assertion', ERROR)
    // .addRule('@typescript-eslint/no-extraneous-class', ERROR)
    // .addRule('@typescript-eslint/no-invalid-void-type', ERROR)
    // .addRule('@typescript-eslint/no-misused-new', ERROR)
    // .addRule('@typescript-eslint/no-namespace', ERROR)
    // .addRule('@typescript-eslint/no-non-null-asserted-nullish-coalescing', ERROR)
    // .addRule('@typescript-eslint/no-non-null-asserted-optional-chain', ERROR)
    .addRule('@typescript-eslint/no-non-null-assertion', WARNING)
    // .addRule('@typescript-eslint/no-this-alias', ERROR)
    // .addRule('@typescript-eslint/no-unnecessary-type-constraint', ERROR)
    // .addRule('@typescript-eslint/no-unsafe-declaration-merging', ERROR)
    // .addRule('@typescript-eslint/no-unsafe-function-type', ERROR)
    .addRule('@typescript-eslint/no-unused-vars', ERROR, [{ignoreRestSiblings: true}], {
      overrideBaseRule: true,
    })
    .addRule('@typescript-eslint/no-useless-constructor', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/no-wrapper-object-types', ERROR)
    // .addRule('@typescript-eslint/prefer-as-const', ERROR)
    .addRule('@typescript-eslint/prefer-literal-enum-member', ERROR, [
      {allowBitwiseExpressions: true},
    ])
    // .addRule('@typescript-eslint/prefer-namespace-keyword', ERROR)
    // .addRule('@typescript-eslint/triple-slash-reference', ERROR)
    // .addRule('@typescript-eslint/unified-signatures', ERROR)
    // 🟢 Stylistic - overrides
    // .addRule('@typescript-eslint/adjacent-overload-signatures', ERROR)
    // .addRule('@typescript-eslint/array-type', ERROR)
    // .addRule('@typescript-eslint/ban-tslint-comment', ERROR)
    // .addRule('@typescript-eslint/class-literal-property-style', ERROR)
    // .addRule('@typescript-eslint/consistent-generic-constructors', ERROR)
    // .addRule('@typescript-eslint/consistent-indexed-object-style', ERROR)
    // .addRule('@typescript-eslint/consistent-type-assertions', ERROR)
    // .addRule('@typescript-eslint/consistent-type-definitions', ERROR)
    // .addRule('@typescript-eslint/no-confusing-non-null-assertion', ERROR)
    .addRule('@typescript-eslint/no-empty-function', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/no-inferrable-types', ERROR)
    // .addRule('@typescript-eslint/prefer-for-of', ERROR)
    // .addRule('@typescript-eslint/prefer-function-type', OFF)
    // 🟢 Additional rules
    .addRule(
      '@typescript-eslint/class-methods-use-this',
      ERROR,
      [{ignoreOverrideMethods: true, ignoreClassesThatImplementAnInterface: true}],
      {overrideBaseRule: true},
    )
    .addRule('@typescript-eslint/consistent-type-imports', ERROR, [
      {
        ...(tsVersion && tsVersion >= 4.5 && {fixStyle: 'inline-type-imports'}),
        disallowTypeAnnotations: false,
      },
    ])
    .addRule('@typescript-eslint/default-param-last', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/explicit-function-return-type', OFF)
    // .addRule('@typescript-eslint/explicit-member-accessibility', OFF)
    .addRule('@typescript-eslint/explicit-module-boundary-types', OFF)
    // .addRule('@typescript-eslint/init-declarations', OFF, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/max-params', OFF, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/member-ordering', OFF) // ❄️
    .addRule('@typescript-eslint/method-signature-style', ERROR)
    // .addRule('@typescript-eslint/no-dupe-class-members', OFF, [], {overrideBaseRule: true}) // 👍
    .addRule('@typescript-eslint/no-import-type-side-effects', ERROR)
    // .addRule('@typescript-eslint/no-invalid-this', OFF, [], {overrideBaseRule: true}) // 👍
    .addRule('@typescript-eslint/no-loop-func', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/no-magic-numbers', OFF, [], {overrideBaseRule: true})
    .addAnyRule('no-redeclare', OFF)
    // .addRule('@typescript-eslint/no-redeclare', OFF) // 👍
    .addRule('@typescript-eslint/no-require-imports', OFF)
    // .addRule('@typescript-eslint/no-restricted-imports', OFF, [], {overrideBaseRule: true})
    .addRule('@typescript-eslint/no-shadow', ERROR, [], {overrideBaseRule: true})
    .addRule('@typescript-eslint/no-unnecessary-parameter-property-assignment', ERROR)
    .addRule(
      '@typescript-eslint/no-unused-expressions',
      ERROR,
      RULE_NO_UNUSED_EXPRESSIONS_OPTIONS,
      {
        overrideBaseRule: true,
      },
    )
    .addRule('@typescript-eslint/no-use-before-define', ERROR, RULE_NO_USE_BEFORE_DEFINE_OPTIONS, {
      overrideBaseRule: true,
    })
    .addRule('@typescript-eslint/no-useless-empty-export', ERROR)
    // .addRule('@typescript-eslint/parameter-properties', OFF)
    // .addRule('@typescript-eslint/prefer-enum-initializers', OFF)
    // .addRule('@typescript-eslint/typedef', OFF)
    // 🟢 Disable conflicting rules
    .addAnyRule('no-useless-constructor', OFF)
    .addAnyRule('dot-notation', OFF)
    .addOverrides();

  // TODO add rules
  builder
    .addConfig('ts/rules-type-aware', {
      ...generateBaseOptions(true),
      files: filesTypeAware,
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
    // .addRule('@typescript-eslint/await-thenable', ERROR)
    // .addRule('@typescript-eslint/no-array-delete', ERROR)
    // .addRule('@typescript-eslint/no-base-to-string', ERROR)
    .addRule('@typescript-eslint/no-confusing-void-expression', ERROR, [
      {
        ignoreArrowShorthand: true,
      },
    ])
    .addRule('@typescript-eslint/no-deprecated', WARNING)
    // .addRule('@typescript-eslint/no-duplicate-type-constituents', ERROR)
    .addRule('@typescript-eslint/no-floating-promises', ERROR, [
      {
        checkThenables: true,
        ignoreVoid: true, // Default
      },
    ])
    // .addRule('@typescript-eslint/no-for-in-array', ERROR)
    .addRule('@typescript-eslint/no-implied-eval', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/no-meaningless-void-operator', ERROR)
    // .addRule('@typescript-eslint/no-misused-promises', ERROR)
    // .addRule('@typescript-eslint/no-mixed-enums', ERROR)
    // .addRule('@typescript-eslint/no-redundant-type-constituents', ERROR)
    // .addRule('@typescript-eslint/no-unnecessary-boolean-literal-compare', ERROR)
    .addRule(
      '@typescript-eslint/no-unnecessary-condition',
      ERROR,
      [
        {
          allowConstantLoopConditions: true,
          checkTypePredicates: true, // >=8.8.0
        },
      ],
      {disableAutofix: true},
    )
    // .addRule('@typescript-eslint/no-unnecessary-template-expressions', ERROR)
    // Reason for disabling autofix: could remove type aliases
    .addRule('@typescript-eslint/no-unnecessary-type-arguments', ERROR, [], {disableAutofix: true})
    // .addRule('@typescript-eslint/no-unnecessary-type-assertion', ERROR)
    .addRule('@typescript-eslint/no-unsafe-argument', noUnsafeRulesSeverity)
    .addRule('@typescript-eslint/no-unsafe-assignment', noUnsafeRulesSeverity)
    .addRule('@typescript-eslint/no-unsafe-call', noUnsafeRulesSeverity)
    .addRule('@typescript-eslint/no-unsafe-enum-comparison', noUnsafeRulesSeverity)
    .addRule('@typescript-eslint/no-unsafe-member-access', noUnsafeRulesSeverity)
    .addRule('@typescript-eslint/no-unsafe-return', noUnsafeRulesSeverity)
    // .addRule('@typescript-eslint/no-unsafe-unary-minus', ERROR)
    .addAnyRule('no-throw-literal', OFF) // Note: has different name
    // .addRule('@typescript-eslint/only-throw-error', ERROR)
    .addRule('@typescript-eslint/prefer-promise-reject-errors', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/prefer-reduce-type-parameter', ERROR)
    // .addRule('@typescript-eslint/prefer-return-this-type', ERROR)
    .addRule('@typescript-eslint/require-await', ERROR, [], {overrideBaseRule: true})
    // .addRule('@typescript-eslint/restrict-plus-operands', ERROR)
    .addRule('@typescript-eslint/restrict-template-expressions', ERROR, [
      {allowAny: false, allowRegExp: false},
    ])
    // .addRule('@typescript-eslint/unbound-method', ERROR)
    // .addRule('@typescript-eslint/use-unknown-in-catch-clause', ERROR)
    // 🟢 Stylistic - overrides
    .addRule(
      '@typescript-eslint/dot-notation',
      ERROR,
      [{allowIndexSignaturePropertyAccess: true}],
      {overrideBaseRule: true},
    )
    // .addRule('@typescript-eslint/non-nullable-type-assertion-style', ERROR)
    // .addRule('@typescript-eslint/prefer-find', ERROR)
    .addAnyRule('unicorn/prefer-includes', OFF)
    // .addRule('@typescript-eslint/prefer-includes', ERROR)
    .addRule('@typescript-eslint/prefer-nullish-coalescing', OFF)
    // .addRule('@typescript-eslint/prefer-optional-chain', ERROR)
    .addRule('@typescript-eslint/prefer-regexp-exec', OFF)
    .addRule('@typescript-eslint/prefer-string-starts-ends-with', ERROR, [
      {allowSingleElementEquality: 'always'},
    ])
    // 🟢 Additional rules
    // TODO: ...overrideBaseRule('consistent-return', OFF),
    .addRule('@typescript-eslint/consistent-type-exports', ERROR, [
      {fixMixedExportsWithInlineTypeSpecifier: true},
    ])
    // .addRule('@typescript-eslint/naming-convention', OFF) // ❄️
    // .addRule('@typescript-eslint/no-unnecessary-qualifier', OFF)
    .addRule('@typescript-eslint/prefer-destructuring', ERROR, RULE_PREFER_DESTRUCTURING_OPTIONS, {
      overrideBaseRule: true,
    })
    .addAnyRule('unicorn/prefer-array-find', OFF) // Note: in Unicorn
    .addRule('@typescript-eslint/prefer-readonly', ERROR)
    // .addRule('@typescript-eslint/prefer-readonly-parameter-types', OFF)
    // .addRule('@typescript-eslint/promise-function-async', OFF)
    // .addRule('@typescript-eslint/require-array-sort-compare', OFF)
    // Note: has different name. Also note that the original rule is deprecated and not included in this config, but we disable it anyway just for safety
    .addAnyRule('no-return-await', OFF) // Disabled by default since v8
    .addRule('@typescript-eslint/return-await', ERROR, ['always'])
    // .addRule('@typescript-eslint/strict-boolean-expressions', OFF)
    .addRule('@typescript-eslint/switch-exhaustiveness-check', ERROR)
    .addBulkRules(options.overridesTypeAware);

  // TODO add rules
  builder
    .addConfig('ts/disable-handled-by-ts-compiler-rules', {
      files: filesAll,
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

  // TODO add rules
  builder
    .addConfig('ts/dts', {
      files: ['**/*.d.?([cm])ts'],
    })
    .addRule('@typescript-eslint/consistent-indexed-object-style', OFF)
    .addRule('@typescript-eslint/method-signature-style', OFF)
    .addRule('@typescript-eslint/no-empty-object-type', OFF)
    .addRule('@typescript-eslint/no-explicit-any', OFF)
    .addRule('@typescript-eslint/no-shadow', OFF)
    .addRule('@typescript-eslint/no-unnecessary-type-parameters', OFF)
    .addRule('@typescript-eslint/no-unused-vars', OFF)
    .addRule('@typescript-eslint/no-use-before-define', OFF)
    .addAnyRule('import/newline-after-import', OFF)
    .addAnyRule('import/no-default-export', OFF);

  if (options.noTypeAssertion) {
    builder
      .addConfig('ts/no-type-assertion', {
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          'no-type-assertion': eslintPluginNoTypeAssertion,
        },
      })
      .addAnyRule(
        'no-type-assertion/no-type-assertion',
        options.noTypeAssertion === 'warning' ? WARNING : ERROR,
      );
  }

  return builder.getAllConfigs();
};
