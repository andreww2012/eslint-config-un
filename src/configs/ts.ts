import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import type Eslint from 'eslint';
// @ts-expect-error no typings
import eslintPluginNoTypeAssertion from 'eslint-plugin-no-type-assertion';
import {parser as parserTs, plugin as pluginTs} from 'typescript-eslint';
import {ERROR, GLOB_TS, GLOB_TSX, GLOB_VUE, OFF, WARNING} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  InternalConfigOptions,
  RuleOverrides,
} from '../types';
import {
  disableAutofixForRule,
  genFlatConfigEntryName,
  genRuleOverrideFn,
  warnUnlessForcedError,
} from '../utils';
import {
  RULE_NO_UNUSED_EXPRESSIONS_OPTIONS,
  RULE_NO_USE_BEFORE_DEFINE_OPTIONS,
  RULE_PREFER_DESTRUCTURING_OPTIONS,
} from './js';

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

const overrideBaseRule = genRuleOverrideFn('@typescript-eslint');

export const tsEslintConfig = (
  options: TsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const onlyTsFiles = [GLOB_TS, GLOB_TSX];
  const extraFiles: FlatConfigEntry['files'] & {} = [];
  const extraFilesToIgnore: FlatConfigEntry['ignores'] & {} = [];

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
    ...extraFilesToIgnore,
  ];
  const filesAll = [...onlyTsFiles, ...filesTypeAware];

  const tsVersion = options.typescriptVersion
    ? Number.parseFloat(options.typescriptVersion)
    : undefined;

  const generateBaseOptions = (isTypeAware?: boolean): FlatConfigEntry => ({
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

  // LEGEND:
  // ❄️ = Feature-frozen in ts-eslint
  // 👍 = Auto-checked and there's barely any need to use this rule
  const typescriptRulesRegular: FlatConfigEntry['rules'] = {
    ...pluginTs.configs?.strict?.rules,
    ...pluginTs.configs?.stylistic?.rules,

    // 🔵 Strict - overrides

    // '@typescript-eslint/ban-ts-comment': ERROR,
    ...overrideBaseRule('no-array-constructor', ERROR),
    // '@typescript-eslint/no-duplicate-enum-values': ERROR,
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-dynamic-delete'),
    '@typescript-eslint/no-empty-object-type': [ERROR, {allowInterfaces: 'with-single-extends'}],
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-explicit-any', {
      ignoreRestArgs: true,
    }),
    // '@typescript-eslint/no-extra-non-null-assertion': ERROR,
    // '@typescript-eslint/no-extraneous-class': ERROR,
    // '@typescript-eslint/no-invalid-void-type': ERROR,
    // '@typescript-eslint/no-misused-new': ERROR,
    // '@typescript-eslint/no-namespace': ERROR,
    // '@typescript-eslint/no-non-null-asserted-nullish-coalescing': ERROR,
    // '@typescript-eslint/no-non-null-asserted-optional-chain': ERROR,
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-non-null-assertion'),
    // '@typescript-eslint/no-this-alias': ERROR,
    // '@typescript-eslint/no-unnecessary-type-constraint': ERROR,
    // '@typescript-eslint/no-unsafe-declaration-merging': ERROR,
    // '@typescript-eslint/no-unsafe-function-type': ERROR,
    ...overrideBaseRule('no-unused-vars', ERROR, {ignoreRestSiblings: true}),
    ...overrideBaseRule('no-useless-constructor', ERROR),
    // '@typescript-eslint/no-wrapper-object-types': ERROR,
    // '@typescript-eslint/prefer-as-const': ERROR,
    '@typescript-eslint/prefer-literal-enum-member': [ERROR, {allowBitwiseExpressions: true}],
    // '@typescript-eslint/prefer-namespace-keyword': ERROR,
    // '@typescript-eslint/triple-slash-reference': ERROR,
    // '@typescript-eslint/unified-signatures': ERROR,

    // 🔵 Stylistic - overrides

    // '@typescript-eslint/adjacent-overload-signatures': ERROR,
    // '@typescript-eslint/array-type': ERROR,
    // '@typescript-eslint/ban-tslint-comment': ERROR,
    // '@typescript-eslint/class-literal-property-style': ERROR,
    // '@typescript-eslint/consistent-generic-constructors': ERROR,
    // '@typescript-eslint/consistent-indexed-object-style': ERROR,
    // '@typescript-eslint/consistent-type-assertions': ERROR,
    // '@typescript-eslint/consistent-type-definitions': ERROR,
    // '@typescript-eslint/no-confusing-non-null-assertion': ERROR,
    ...overrideBaseRule('no-empty-function', ERROR),
    // '@typescript-eslint/no-inferrable-types': ERROR,
    // '@typescript-eslint/prefer-for-of': ERROR,
    // '@typescript-eslint/prefer-function-type': ERROR,

    // 🔵 Additional rules

    ...overrideBaseRule('class-methods-use-this', ERROR, {
      ignoreOverrideMethods: true,
      ignoreClassesThatImplementAnInterface: true,
    }),
    '@typescript-eslint/consistent-type-imports': [
      ERROR,
      {
        ...(tsVersion && tsVersion >= 4.5 && {fixStyle: 'inline-type-imports'}),
        disallowTypeAnnotations: false,
      },
    ],
    ...overrideBaseRule('default-param-last', ERROR),
    // '@typescript-eslint/explicit-function-return-type': OFF,
    // '@typescript-eslint/explicit-member-accessibility': OFF,
    '@typescript-eslint/explicit-module-boundary-types': OFF,
    // ...overrideBaseRule('init-declarations', OFF),
    // ...overrideBaseRule('max-params', OFF),
    // '@typescript-eslint/member-ordering': OFF, // ❄️
    '@typescript-eslint/method-signature-style': ERROR,
    // ...overrideBaseRule('no-dupe-class-members', OFF), // 👍
    '@typescript-eslint/no-import-type-side-effects': ERROR,
    // ...overrideBaseRule('no-invalid-this', OFF), // 👍
    ...overrideBaseRule('no-loop-func', ERROR),
    // ...overrideBaseRule('no-magic-numbers', OFF),
    'no-redeclare': OFF,
    // '@typescript-eslint/no-redeclare': OFF, // 👍
    '@typescript-eslint/no-require-imports': OFF,
    // ...overrideBaseRule('no-restricted-imports', OFF),
    ...overrideBaseRule('no-shadow', ERROR),
    '@typescript-eslint/no-unnecessary-parameter-property-assignment': ERROR,
    ...overrideBaseRule('no-unused-expressions', ERROR, RULE_NO_UNUSED_EXPRESSIONS_OPTIONS),
    ...overrideBaseRule('no-use-before-define', ERROR, RULE_NO_USE_BEFORE_DEFINE_OPTIONS),
    '@typescript-eslint/no-useless-empty-export': ERROR,
    // '@typescript-eslint/parameter-properties': OFF,
    // '@typescript-eslint/prefer-enum-initializers': OFF,
    // '@typescript-eslint/typedef': OFF,

    // 🔵 Disable conflicting rules

    'no-useless-constructor': OFF,
    'dot-notation': OFF,

    ...options.overrides,
  };

  const typescriptRulesTypeAware: FlatConfigEntry['rules'] = {
    ...pluginTs.configs?.['strict-type-checked-only']?.rules,
    ...pluginTs.configs?.['stylistic-type-checked-only']?.rules,

    // 🔵 Strict - overrides

    // '@typescript-eslint/await-thenable': ERROR,
    // '@typescript-eslint/no-array-delete': ERROR,
    // '@typescript-eslint/no-base-to-string': ERROR,
    '@typescript-eslint/no-confusing-void-expression': [
      ERROR,
      {
        ignoreArrowShorthand: true,
      },
    ],
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-deprecated'),
    // '@typescript-eslint/no-duplicate-type-constituents': ERROR,
    '@typescript-eslint/no-floating-promises': [
      ERROR,
      {
        checkThenables: true,
        ignoreVoid: true, // Default
      },
    ],
    // '@typescript-eslint/no-for-in-array': ERROR,
    ...overrideBaseRule('no-implied-eval', ERROR),
    // '@typescript-eslint/no-meaningless-void-operator': ERROR,
    // '@typescript-eslint/no-misused-promises': ERROR,
    // '@typescript-eslint/no-mixed-enums': ERROR,
    // '@typescript-eslint/no-redundant-type-constituents': ERROR,
    // '@typescript-eslint/no-unnecessary-boolean-literal-compare': ERROR,
    ...disableAutofixForRule('@typescript-eslint/no-unnecessary-condition', ERROR, {
      allowConstantLoopConditions: true,
    }),
    // '@typescript-eslint/no-unnecessary-template-expression': ERROR,
    // Reason for disabling autofix: could remove type aliases
    ...disableAutofixForRule('@typescript-eslint/no-unnecessary-type-arguments', ERROR),
    // '@typescript-eslint/no-unnecessary-type-assertion': ERROR,
    // TODO avoid duplication?
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-unsafe-argument'),
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-unsafe-assignment'),
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-unsafe-call'),
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-unsafe-enum-comparison'),
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-unsafe-member-access'),
    ...warnUnlessForcedError(internalOptions, '@typescript-eslint/no-unsafe-return'),
    ...(options.disableNoUnsafeRules && {
      '@typescript-eslint/no-unsafe-argument': OFF,
      '@typescript-eslint/no-unsafe-assignment': OFF,
      '@typescript-eslint/no-unsafe-call': OFF,
      '@typescript-eslint/no-unsafe-enum-comparison': OFF,
      '@typescript-eslint/no-unsafe-member-access': OFF,
      '@typescript-eslint/no-unsafe-return': OFF,
    }),
    // '@typescript-eslint/no-unsafe-unary-minus': ERROR,
    'no-throw-literal': OFF, // Note: has different name
    '@typescript-eslint/only-throw-error': [
      ERROR,
      {
        allowThrowingUnknown: true,
      },
    ],
    ...overrideBaseRule('prefer-promise-reject-errors', ERROR),
    // '@typescript-eslint/prefer-reduce-type-parameter': ERROR,
    // '@typescript-eslint/prefer-return-this-type': ERROR,
    ...overrideBaseRule('require-await', ERROR),
    // '@typescript-eslint/restrict-plus-operands': ERROR,
    '@typescript-eslint/restrict-template-expressions': [
      ERROR,
      {allowAny: false, allowRegExp: false},
    ],
    // '@typescript-eslint/unbound-method': ERROR,
    // '@typescript-eslint/use-unknown-in-catch-callback-variable': ERROR,

    // 🔵 Stylistic - overrides

    ...overrideBaseRule('dot-notation', ERROR, {
      allowIndexSignaturePropertyAccess: true,
    }),
    // '@typescript-eslint/non-nullable-type-assertion-style': ERROR,
    // '@typescript-eslint/prefer-find': ERROR,
    'unicorn/prefer-includes': OFF,
    // '@typescript-eslint/prefer-includes': ERROR,
    '@typescript-eslint/prefer-nullish-coalescing': OFF,
    // '@typescript-eslint/prefer-optional-chain': ERROR,
    '@typescript-eslint/prefer-regexp-exec': OFF,
    '@typescript-eslint/prefer-string-starts-ends-with': [
      ERROR,
      {
        allowSingleElementEquality: 'always',
      },
    ],

    // 🔵 Additional rules

    // ...overrideBaseRule('consistent-return', OFF),
    '@typescript-eslint/consistent-type-exports': [
      ERROR,
      {fixMixedExportsWithInlineTypeSpecifier: true},
    ],
    // '@typescript-eslint/naming-convention': OFF, // ❄️
    // '@typescript-eslint/no-unnecessary-qualifier': OFF,
    ...overrideBaseRule('prefer-destructuring', ERROR, RULE_PREFER_DESTRUCTURING_OPTIONS),
    'unicorn/prefer-array-find': OFF, // Note: in Unicorn
    '@typescript-eslint/prefer-readonly': ERROR,
    // '@typescript-eslint/prefer-readonly-parameter-types': OFF,
    // '@typescript-eslint/promise-function-async': OFF,
    // '@typescript-eslint/require-array-sort-compare': OFF,
    // Note: has different name. Also note that the original rule is deprecated and not included in this config, but we disable it anyway just for safety
    'no-return-await': OFF, // Disabled by default since v8
    '@typescript-eslint/return-await': [ERROR, 'always'],
    // '@typescript-eslint/strict-boolean-expressions': OFF,
    '@typescript-eslint/switch-exhaustiveness-check': ERROR,

    ...options.overridesTypeAware,
  };

  return (
    [
      {
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          '@typescript-eslint': pluginTs as any,
        },
        name: genFlatConfigEntryName('ts/setup'),
      },

      {
        ...generateBaseOptions(false),
        files: filesNonTypeAware,
        ...(ignoresNonTypeAware.length > 0 && {ignores: ignoresNonTypeAware}),
        rules: typescriptRulesRegular,
        name: genFlatConfigEntryName('ts/regular-rules'),
      },

      filesTypeAware.length > 0 && {
        ...generateBaseOptions(true),
        files: filesTypeAware,
        ...(ignoresTypeAware.length > 0 && {ignores: ignoresTypeAware}),
        rules: typescriptRulesTypeAware,
        name: genFlatConfigEntryName('ts/type-aware-rules'),
      },

      // Handled by TS compiler
      {
        files: filesAll,
        rules: {
          'constructor-super': OFF,
          'getter-return': OFF,
          'no-const-assign': OFF,
          'no-dupe-args': OFF,
          'no-dupe-class-members': OFF,
          'no-dupe-keys': OFF,
          'no-func-assign': OFF,
          // "Note that the compiler will not catch the Object.assign() case. Thus, if you use Object.assign() in your codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-import-assign#handled_by_typescript
          // 'no-import-assign': OFF,
          // "Note that, technically, TypeScript will only catch this if you have the strict or noImplicitThis flags enabled. These are enabled in most TypeScript projects, since they are considered to be best practice." - https://eslint.org/docs/latest/rules/no-invalid-this#rule-details
          // 'no-invalid-this': OFF,
          'no-new-native-nonconstructor': OFF, // successor of no-new-symbol
          'no-obj-calls': OFF,
          // "Note that while TypeScript will catch let redeclares and const redeclares, it will not catch var redeclares. Thus, if you use the legacy var keyword in your TypeScript codebase, this rule will still provide some value." - https://eslint.org/docs/latest/rules/no-redeclare#handled_by_typescript
          // 'no-redeclare': OFF,
          'no-setter-return': OFF,
          'no-this-before-super': OFF,
          'no-undef': OFF,
          // "TypeScript must be configured with allowUnreachableCode: false for it to consider unreachable code an error." - https://eslint.org/docs/latest/rules/no-unreachable#handled_by_typescript
          // 'no-unreachable': OFF,
          'no-unsafe-negation': OFF,

          // Does not work correctly when type-only imports are present because you can't combine such an import with a default import.
          'no-duplicate-imports': OFF,
        },
        name: genFlatConfigEntryName('ts/disable-handled-by-ts-compiler-rules'),
      },

      {
        files: ['**/*.d.?([cm])ts'],
        rules: {
          '@typescript-eslint/consistent-indexed-object-style': OFF,
          '@typescript-eslint/method-signature-style': OFF,
          '@typescript-eslint/no-empty-object-type': OFF,
          '@typescript-eslint/no-explicit-any': OFF,
          '@typescript-eslint/no-shadow': OFF,
          '@typescript-eslint/no-unnecessary-type-parameters': OFF,
          '@typescript-eslint/no-unused-vars': OFF,
          '@typescript-eslint/no-use-before-define': OFF,

          'import/newline-after-import': OFF,
          'import/no-default-export': OFF,
        },
        name: genFlatConfigEntryName('ts/dts'),
      },

      options.noTypeAssertion && {
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          'no-type-assertion': eslintPluginNoTypeAssertion,
        } as never,
        rules: {
          'no-type-assertion/no-type-assertion':
            options.noTypeAssertion === 'warning' ? WARNING : ERROR,
        },
        name: genFlatConfigEntryName('ts/no-type-assertion'),
      },
    ]
      .flat()
      // eslint-disable-next-line no-implicit-coercion
      .filter((v) => !!v)
  );
};
