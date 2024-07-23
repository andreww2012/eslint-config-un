// eslint-disable-next-line import/no-extraneous-dependencies
import EslintJs from '@eslint/js';
import type {ESLintRules as BuiltinEslintRules} from 'eslint/rules';
import {ERROR} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  InternalConfigOptions,
  RulesRecord,
} from '../types';
import {genFlatConfigEntryName, warnUnlessForcedError} from '../utils';

type BuiltinEslintRulesFixed = Pick<RulesRecord, keyof BuiltinEslintRules>;

export interface JsEslintConfigOptions extends ConfigSharedOptions<BuiltinEslintRulesFixed> {}

export const RULE_CAMELCASE_OPTIONS = {
  properties: 'never' as const,
  ignoreGlobals: true,
  allow: [String.raw`\d_\d`],
};

export const RULE_EQEQEQ_OPTIONS = ['always', {null: 'ignore'}] as const;

export const RULE_NO_UNUSED_EXPRESSIONS_OPTIONS = {
  allowShortCircuit: true,
  allowTernary: true,
  allowTaggedTemplates: true,
} as const;

export const RULE_NO_USE_BEFORE_DEFINE_OPTIONS = {
  functions: false,
} as const;

export const RULE_PREFER_DESTRUCTURING_OPTIONS = {
  VariableDeclarator: {
    array: false,
    object: true,
  },
  AssignmentExpression: {
    array: false,
    object: false,
  },
};

export const jsEslintConfig = (
  options: JsEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const rules: FlatConfigEntry<BuiltinEslintRulesFixed>['rules'] = {
    // 🔵 Recommended - Possible Problems

    // 'constructor-super': ERROR,
    // 'for-direction': ERROR,
    // 'getter-return': ERROR,
    // 'no-async-promise-executor': ERROR,
    // 'no-class-assign': ERROR,
    // 'no-compare-neg-zero': ERROR,
    // 'no-cond-assign': ERROR,
    // 'no-const-assign': ERROR,
    // 'no-constant-binary-expression': ERROR,
    // 'no-constant-condition': ERROR,
    // 'no-control-regex': ERROR,
    // 'no-debugger': ERROR,
    // 'no-dupe-args': ERROR,
    // 'no-dupe-class-members': ERROR,
    // 'no-dupe-else-if': ERROR,
    // 'no-dupe-keys': ERROR,
    // 'no-duplicate-case': ERROR,
    // 'no-empty-character-class': ERROR,
    // 'no-empty-pattern': ERROR,
    // 'no-ex-assign': ERROR,
    // 'no-fallthrough': ERROR,
    // 'no-func-assign': ERROR,
    // 'no-import-assign': ERROR,
    // 'no-invalid-regexp': ERROR,
    // 'no-irregular-whitespace': ERROR,
    // 'no-loss-of-precision': ERROR,
    // 'no-misleading-character-class': ERROR,
    // 'no-new-native-nonconstructor': ERROR,
    // 'no-obj-calls': ERROR,
    // 'no-prototype-builtins': ERROR,
    // 'no-self-assign': ERROR,
    // 'no-setter-return': ERROR,
    // 'no-sparse-arrays': ERROR,
    // 'no-this-before-super': ERROR,
    // 'no-undef': ERROR,
    // 'no-unexpected-multiline': ERROR,
    // 'no-unreachable': ERROR,
    // 'no-unsafe-finally': ERROR,
    // 'no-unsafe-negation': ERROR,
    // 'no-unsafe-optional-chaining': ERROR,
    // 'no-unused-private-class-members': ERROR,
    // 'no-unused-vars': ERROR,
    // 'no-useless-backreference': ERROR,
    // 'use-isnan': ERROR,
    // 'valid-typeof': ERROR,

    // 🔵 Recommended - Suggestions

    // 'no-case-declarations': ERROR,
    // 'no-delete-var': ERROR,
    // 'no-empty': ERROR,
    // 'no-empty-static-block': ERROR,
    // 'no-extra-boolean-cast': ERROR,
    // 'no-global-assign': ERROR,
    // 'no-nonoctal-decimal-escape': ERROR,
    // 'no-octal': ERROR,
    // 'no-redeclare': ERROR,
    // 'no-regex-spaces': ERROR,
    // 'no-shadow-restricted-names': ERROR,
    // 'no-unused-labels': ERROR,
    // 'no-useless-catch': ERROR,
    // 'no-useless-escape': ERROR,
    // 'no-with': ERROR,
    // 'require-yield': ERROR,

    // 🔵 Not in recommended - Possible Problems

    'array-callback-return': [ERROR, {checkForEach: true}],
    ...warnUnlessForcedError(internalOptions, 'no-await-in-loop'),
    ...warnUnlessForcedError(internalOptions, 'no-constructor-return'),
    'no-duplicate-imports': ERROR,
    'no-inner-declarations': ERROR,
    'no-promise-executor-return': ERROR,
    'no-self-compare': ERROR,
    'no-template-curly-in-string': ERROR,
    'no-unmodified-loop-condition': ERROR,
    'no-unreachable-loop': ERROR,
    'no-use-before-define': [ERROR, RULE_NO_USE_BEFORE_DEFINE_OPTIONS],
    'no-useless-assignment': ERROR,
    'require-atomic-updates': [ERROR, {allowProperties: true}],

    // 🔵 Not in recommended - Suggestions

    'accessor-pairs': ERROR,
    // 'arrow-body-style': OFF,
    'block-scoped-var': ERROR,
    camelcase: [ERROR, RULE_CAMELCASE_OPTIONS],
    // 'capitalized-comments': OFF,
    'class-methods-use-this': ERROR,
    // complexity: OFF,
    'consistent-return': ERROR,
    'consistent-this': [ERROR, 'that'],
    curly: [ERROR, 'all' /* default */],
    'default-case': ERROR,
    'default-case-last': ERROR,
    'default-param-last': ERROR,
    'dot-notation': ERROR,
    eqeqeq: [ERROR, ...RULE_EQEQEQ_OPTIONS],
    'func-name-matching': [ERROR, {considerPropertyDescriptor: true}],
    // 'func-names': OFF,
    // 'func-style': OFF,
    'grouped-accessor-pairs': [ERROR, 'getBeforeSet'],
    'guard-for-in': ERROR,
    // 'id-denylist': OFF,
    // 'id-length': OFF,
    // 'id-match': OFF,
    // 'init-declarations': OFF,
    'logical-assignment-operators': [ERROR, 'always', {enforceForIfStatements: true}],
    'max-classes-per-file': [ERROR, {ignoreExpressions: true, max: 2}],
    // 'max-depth': OFF,
    // 'max-lines': OFF,
    // 'max-lines-per-function': OFF,
    // 'max-nested-callbacks': OFF,
    // 'max-params': OFF,
    // 'max-statements': OFF,
    'new-cap': [ERROR, {properties: false, capIsNew: false}],
    ...warnUnlessForcedError(internalOptions, 'no-alert'),
    'no-array-constructor': ERROR,
    // 'no-bitwise': OFF,
    'no-caller': ERROR,
    ...warnUnlessForcedError(internalOptions, 'no-console', {allow: ['warn', 'error']}),
    // 'no-continue': OFF,
    // 'no-div-regex': OFF,
    'no-else-return': [ERROR, {allowElseIf: false}],
    'no-empty-function': ERROR,
    // 'no-eq-null': OFF,
    'no-eval': ERROR,
    'no-extend-native': ERROR,
    'no-extra-bind': ERROR,
    'no-extra-label': ERROR,
    'no-implicit-coercion': [ERROR, {boolean: true, disallowTemplateShorthand: true}],
    // 'no-implicit-globals': OFF,
    'no-implied-eval': ERROR,
    // 'no-inline-comments': OFF,
    // 'no-invalid-this': OFF,
    'no-iterator': ERROR,
    'no-label-var': ERROR,
    'no-labels': [ERROR, {allowLoop: false}],
    'no-lone-blocks': ERROR,
    'no-lonely-if': ERROR,
    'no-loop-func': ERROR,
    // 'no-magic-numbers': OFF,
    'no-multi-assign': ERROR,
    'no-multi-str': ERROR,
    'no-negated-condition': ERROR,
    // 'no-nested-ternary': OFF,
    ...warnUnlessForcedError(internalOptions, 'no-new'),
    'no-new-func': ERROR,
    'no-new-wrappers': ERROR,
    'no-object-constructor': ERROR,
    'no-octal-escape': ERROR,
    ...warnUnlessForcedError(internalOptions, 'no-param-reassign'),
    // 'no-plusplus': OFF,
    'no-proto': ERROR,
    // 'no-restricted-exports': OFF,
    'no-restricted-globals': [
      ERROR,
      {name: 'global', message: 'Use `globalThis` instead'},
      {name: 'self', message: 'Use `globalThis` instead'},
      {name: 'event', message: 'Use local parameter instead'},
    ],
    // 'no-restricted-imports': OFF,
    // 'no-restricted-properties': OFF,
    // 'no-restricted-syntax': OFF,
    'no-return-assign': [ERROR, 'always'],
    'no-script-url': ERROR,
    'no-sequences': ERROR,
    'no-shadow': ERROR,
    // 'no-ternary': OFF,
    'no-throw-literal': ERROR,
    'no-undef-init': ERROR,
    // 'no-undefined': OFF,
    // Had a potential, but unfortunately reports accesses of object properties starting with _
    // 'no-underscore-dangle': [
    //   OFF,
    //   {
    //     allow: ['__dirname', '__filename'],
    //     allowAfterThis: true,
    //     allowAfterSuper: true,
    //     // @ts-expect-error does not exist in typings
    //     allowAfterThisConstructor: true,
    //   },
    // ],
    'no-unneeded-ternary': [ERROR, {defaultAssignment: false}],
    'no-unused-expressions': [ERROR, RULE_NO_UNUSED_EXPRESSIONS_OPTIONS],
    'no-useless-call': ERROR,
    'no-useless-computed-key': ERROR,
    'no-useless-concat': ERROR,
    'no-useless-constructor': ERROR,
    'no-useless-rename': ERROR,
    'no-useless-return': ERROR,
    'no-var': ERROR,
    'no-void': [ERROR, {allowAsStatement: true}],
    // 'no-warning-comments': OFF,
    'object-shorthand': ERROR,
    'one-var': [ERROR, 'never'],
    'operator-assignment': ERROR,
    'prefer-arrow-callback': [
      ERROR,
      {
        allowNamedFunctions: false,
        allowUnboundThis: true,
      },
    ],
    'prefer-const': [ERROR, {destructuring: 'all', ignoreReadBeforeAssign: true}],
    'prefer-destructuring': [ERROR, RULE_PREFER_DESTRUCTURING_OPTIONS],
    'prefer-exponentiation-operator': ERROR,
    // 'prefer-named-capture-group': OFF,
    'prefer-numeric-literals': ERROR,
    // TODO disable if ecmaVersion<2022?
    'prefer-object-has-own': ERROR,
    'prefer-object-spread': ERROR,
    'prefer-promise-reject-errors': ERROR,
    'prefer-regex-literals': [ERROR, {disallowRedundantWrapping: true}],
    'prefer-rest-params': ERROR,
    'prefer-spread': ERROR,
    'prefer-template': ERROR,
    radix: ERROR,
    'require-await': ERROR,
    // 'require-unicode-regexp': OFF,
    'sort-imports': [ERROR, {ignoreDeclarationSort: true}],
    // 'sort-keys': OFF,
    // 'sort-vars': OFF,
    strict: [ERROR, 'never'],
    'symbol-description': ERROR,
    'vars-on-top': ERROR,
    yoda: ERROR,

    // 🔵 Not in recommended - Layout & Formatting

    'unicode-bom': ERROR,

    // 🔵 Stylistic

    '@stylistic/quotes': [
      ERROR,
      'single', // Doesn't matter since `ignoreStringLiterals` is true - BUT will be used in fixes
      {
        ignoreStringLiterals: true,
        avoidEscape: true, // TODO Doesn't have any effect `ignoreStringLiterals` is true - should propose auto-fix?
      },
    ],
  };

  return [
    {
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      // https://eslint.org/docs/latest/rules/
      rules: {
        ...EslintJs.configs.recommended.rules,
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('js'),
    },
  ];
};
