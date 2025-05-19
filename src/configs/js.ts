import {ERROR, OFF, WARNING} from '../constants';
import {
  type BuiltinEslintRulesFixed,
  type GetRuleOptions,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import {assignDefaults, fetchPackageInfo} from '../utils';
import type {UnConfigFn} from './index';

export interface JsEslintConfigOptions extends UnConfigOptions<BuiltinEslintRulesFixed> {}

export const RULE_CAMELCASE_OPTIONS: GetRuleOptions<'', 'camelcase'> = [
  {
    properties: 'never' as const,
    ignoreGlobals: true,
    allow: [String.raw`\d_\d`],
  },
];
export const RULE_EQEQEQ_OPTIONS: GetRuleOptions<'', 'eqeqeq'> = ['always', {null: 'ignore'}];
export const RULE_NO_UNUSED_EXPRESSIONS_OPTIONS: GetRuleOptions<'', 'no-unused-expressions'> = [
  {
    allowShortCircuit: true,
    allowTernary: true,
    allowTaggedTemplates: true,
  },
];
export const RULE_NO_USE_BEFORE_DEFINE_OPTIONS: GetRuleOptions<'', 'no-use-before-define'> = [
  {
    functions: false,
  },
];
export const RULE_PREFER_DESTRUCTURING_OPTIONS: GetRuleOptions<'', 'prefer-destructuring'> = [
  {
    VariableDeclarator: {
      array: false,
      object: true,
    },
    AssignmentExpression: {
      array: false,
      object: false,
    },
  },
];

export const jsUnConfig: UnConfigFn<'js'> = async (context) => {
  const optionsRaw = context.rootOptions.configs?.js;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies JsEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, '');

  const eslintVersion = (await fetchPackageInfo('eslint'))?.versions.majorAndMinor || 0;

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['js', {includeDefaultFilesAndIgnores: true, doNotIgnoreHtml: true}])
    /* Category: Possible Problems */
    .addRule('array-callback-return', ERROR, [{checkForEach: true}])
    .addRule('constructor-super', ERROR) // 🟢
    .addRule('for-direction', ERROR) // 🟢
    .addRule('getter-return', ERROR) // 🟢
    .addRule('no-async-promise-executor', ERROR) // 🟢
    .addRule('no-await-in-loop', WARNING)
    .addRule('no-class-assign', ERROR) // 🟢
    .addRule('no-compare-neg-zero', ERROR) // 🟢
    .addRule('no-cond-assign', ERROR) // 🟢
    .addRule('no-const-assign', ERROR) // 🟢
    .addRule('no-constant-binary-expression', ERROR) // 🟢
    .addRule('no-constant-condition', ERROR) // 🟢
    .addRule('no-constructor-return', WARNING)
    .addRule('no-control-regex', ERROR) // 🟢
    .addRule('no-debugger', ERROR) // 🟢
    .addRule('no-dupe-args', ERROR) // 🟢
    .addRule('no-dupe-class-members', ERROR) // 🟢
    .addRule('no-dupe-else-if', ERROR) // 🟢
    .addRule('no-dupe-keys', ERROR) // 🟢
    .addRule('no-duplicate-case', ERROR) // 🟢
    .addRule('no-duplicate-imports', ERROR)
    .addRule('no-empty-character-class', ERROR) // 🟢
    .addRule('no-empty-pattern', ERROR) // 🟢
    .addRule('no-ex-assign', ERROR) // 🟢
    .addRule('no-fallthrough', ERROR) // 🟢
    .addRule('no-func-assign', ERROR) // 🟢
    .addRule('no-import-assign', ERROR) // 🟢
    .addRule('no-inner-declarations', ERROR)
    .addRule('no-invalid-regexp', ERROR) // 🟢
    .addRule('no-irregular-whitespace', ERROR) // 🟢
    .addRule('no-loss-of-precision', ERROR) // 🟢
    .addRule('no-misleading-character-class', ERROR) // 🟢
    .addRule('no-new-native-nonconstructor', ERROR) // 🟢
    .addRule('no-obj-calls', ERROR) // 🟢
    .addRule('no-promise-executor-return', ERROR)
    .addRule('no-prototype-builtins', ERROR) // 🟢
    .addRule('no-self-assign', ERROR) // 🟢
    .addRule('no-self-compare', ERROR)
    .addRule('no-setter-return', ERROR) // 🟢
    .addRule('no-sparse-arrays', ERROR) // 🟢
    .addRule('no-template-curly-in-string', ERROR)
    .addRule('no-this-before-super', ERROR) // 🟢
    .addRule('no-undef', ERROR) // 🟢
    .addRule('no-unexpected-multiline', ERROR) // 🟢
    .addRule('no-unmodified-loop-condition', ERROR)
    .addRule('no-unreachable-loop', ERROR)
    .addRule('no-unreachable', ERROR) // 🟢
    .addRule('no-unsafe-finally', ERROR) // 🟢
    .addRule('no-unsafe-negation', ERROR) // 🟢
    .addRule('no-unsafe-optional-chaining', ERROR) // 🟢
    .addRule('no-unused-private-class-members', ERROR) // 🟢
    .addRule('no-unused-vars', ERROR) // 🟢
    .addRule('no-use-before-define', ERROR, RULE_NO_USE_BEFORE_DEFINE_OPTIONS)
    .addRule('no-useless-assignment', ERROR)
    .addRule('no-useless-backreference', ERROR) // 🟢
    .addRule('require-atomic-updates', ERROR, [{allowProperties: true}])
    .addRule('use-isnan', ERROR) // 🟢
    .addRule('valid-typeof', ERROR) // 🟢
    /* Category: Suggestions */
    .addRule('accessor-pairs', ERROR)
    .addRule('arrow-body-style', OFF)
    .addRule('block-scoped-var', ERROR)
    .addRule('camelcase', ERROR, RULE_CAMELCASE_OPTIONS)
    .addRule('capitalized-comments', OFF)
    .addRule(
      'class-methods-use-this',
      ERROR,
      eslintVersion >= 9.24
        ? [{ignoreOverrideMethods: true, ignoreClassesWithImplements: 'all'}]
        : [],
    )
    .addRule('complexity', OFF)
    .addRule('consistent-return', ERROR)
    .addRule('consistent-this', ERROR, ['that'])
    .addRule('curly', ERROR, ['all' /* default */])
    .addRule('default-case-last', ERROR)
    .addRule('default-case', ERROR)
    .addRule('default-param-last', ERROR)
    .addRule('dot-notation', ERROR)
    .addRule('eqeqeq', ERROR, RULE_EQEQEQ_OPTIONS)
    .addRule('func-name-matching', ERROR, [{considerPropertyDescriptor: true}])
    .addRule('func-names', OFF)
    .addRule('func-style', OFF)
    .addRule('grouped-accessor-pairs', ERROR, ['getBeforeSet'])
    .addRule('guard-for-in', ERROR)
    .addRule('id-denylist', OFF)
    .addRule('id-length', OFF)
    .addRule('id-match', OFF)
    .addRule('init-declarations', OFF)
    .addRule('logical-assignment-operators', ERROR, ['always'])
    .addRule('max-classes-per-file', ERROR, [{ignoreExpressions: true, max: 2}])
    .addRule('max-depth', OFF)
    .addRule('max-lines-per-function', OFF)
    .addRule('max-lines', OFF)
    .addRule('max-nested-callbacks', OFF)
    .addRule('max-params', OFF)
    .addRule('max-statements', OFF)
    .addRule('new-cap', ERROR, [{properties: false, capIsNew: false}])
    .addRule('no-alert', WARNING)
    .addRule('no-array-constructor', ERROR)
    .addRule('no-bitwise', OFF)
    .addRule('no-caller', ERROR)
    .addRule('no-case-declarations', ERROR) // 🟢
    .addRule('no-console', WARNING, [{allow: ['warn', 'error']}])
    .addRule('no-continue', OFF)
    .addRule('no-delete-var', ERROR) // 🟢
    .addRule('no-empty-static-block', ERROR) // 🟢
    .addRule('no-empty', ERROR) // 🟢
    .addRule('no-extra-boolean-cast', ERROR) // 🟢
    .addRule('no-global-assign', ERROR) // 🟢
    .addRule('no-nonoctal-decimal-escape', ERROR) // 🟢
    .addRule('no-octal', ERROR) // 🟢
    .addRule('no-redeclare', ERROR) // 🟢
    .addRule('no-regex-spaces', ERROR) // 🟢
    .addRule(
      'no-shadow-restricted-names',
      ERROR,
      eslintVersion >= 9.26 ? [{reportGlobalThis: true}] : [],
    ) // 🟢
    .addRule('no-div-regex', OFF)
    .addRule('no-else-return', ERROR, [{allowElseIf: false}])
    .addRule('no-empty-function', ERROR)
    .addRule('no-eq-null', OFF)
    .addRule('no-eval', ERROR)
    .addRule('no-extend-native', ERROR)
    .addRule('no-extra-bind', ERROR)
    .addRule('no-extra-label', ERROR)
    .addRule('no-implicit-coercion', ERROR, [{boolean: true, disallowTemplateShorthand: true}])
    .addRule('no-implicit-globals', OFF)
    .addRule('no-implied-eval', ERROR)
    .addRule('no-inline-comments', OFF)
    .addRule('no-invalid-this', OFF)
    .addRule('no-iterator', ERROR)
    .addRule('no-label-var', ERROR)
    .addRule('no-labels', ERROR, [{allowLoop: false}])
    .addRule('no-lone-blocks', ERROR)
    .addRule('no-lonely-if', ERROR)
    .addRule('no-loop-func', ERROR)
    .addRule('no-magic-numbers', OFF)
    .addRule('no-multi-assign', ERROR)
    .addRule('no-multi-str', ERROR)
    .addRule('no-negated-condition', ERROR)
    .addRule('no-nested-ternary', OFF)
    .addRule('no-new-func', ERROR)
    .addRule('no-new-wrappers', ERROR)
    .addRule('no-new', WARNING)
    .addRule('no-object-constructor', ERROR)
    .addRule('no-octal-escape', ERROR)
    .addRule('no-param-reassign', WARNING)
    .addRule('no-plusplus', OFF)
    .addRule('no-proto', ERROR)
    .addRule('no-restricted-exports', OFF)
    .addRule('no-unused-labels', ERROR) // 🟢
    .addRule('no-useless-catch', ERROR) // 🟢
    .addRule('no-useless-escape', ERROR) // 🟢
    .addRule('no-with', ERROR) // 🟢
    .addRule('require-yield', ERROR) // 🟢
    .addRule('no-restricted-globals', ERROR, [
      {name: 'global', message: 'Use `globalThis` instead'},
      {name: 'self', message: 'Use `globalThis` instead'},
      {name: 'event', message: 'Use local parameter instead'},
    ])
    .addRule('no-restricted-imports', OFF)
    .addRule('no-restricted-properties', OFF)
    .addRule('no-restricted-syntax', OFF)
    .addRule('no-return-assign', ERROR, ['always'])
    .addRule('no-script-url', ERROR)
    .addRule('no-sequences', ERROR)
    .addRule('no-shadow', ERROR)
    .addRule('no-ternary', OFF)
    .addRule('no-throw-literal', ERROR)
    .addRule('no-undef-init', ERROR)
    .addRule('no-undefined', OFF)
    // Had a potential, but unfortunately reports accesses of object properties starting with _
    .addRule('no-underscore-dangle', OFF, [
      {
        allow: ['__dirname', '__filename'],
        allowAfterThis: true,
        allowAfterSuper: true,
        allowAfterThisConstructor: true,
      },
    ])
    .addRule('no-unneeded-ternary', ERROR, [{defaultAssignment: false}])
    .addRule('no-unused-expressions', ERROR, RULE_NO_UNUSED_EXPRESSIONS_OPTIONS)
    .addRule('no-useless-call', ERROR)
    .addRule('no-useless-computed-key', ERROR)
    .addRule('no-useless-concat', ERROR)
    .addRule('no-useless-constructor', ERROR)
    .addRule('no-useless-rename', ERROR)
    .addRule('no-useless-return', ERROR)
    .addRule('no-var', ERROR)
    .addRule('no-void', ERROR, [{allowAsStatement: true}])
    .addRule('no-warning-comments', OFF)
    .addRule('object-shorthand', ERROR)
    .addRule('one-var', ERROR, ['never'])
    .addRule('operator-assignment', ERROR)
    .addRule('prefer-arrow-callback', ERROR, [{allowNamedFunctions: false, allowUnboundThis: true}])
    .addRule('prefer-const', ERROR, [{destructuring: 'all', ignoreReadBeforeAssign: true}])
    .addRule('prefer-destructuring', ERROR, RULE_PREFER_DESTRUCTURING_OPTIONS)
    .addRule('prefer-exponentiation-operator', ERROR)
    .addRule('prefer-named-capture-group', OFF)
    .addRule('prefer-numeric-literals', ERROR)
    .addRule('prefer-object-has-own', ERROR) // TODO disable if ecmaVersion<2022?
    .addRule('prefer-object-spread', ERROR)
    .addRule('prefer-promise-reject-errors', ERROR)
    .addRule('prefer-regex-literals', ERROR, [{disallowRedundantWrapping: true}])
    .addRule('prefer-rest-params', ERROR)
    .addRule('prefer-spread', ERROR)
    .addRule('prefer-template', ERROR)
    .addRule('radix', ERROR)
    .addRule('require-await', ERROR)
    .addRule('require-unicode-regexp', OFF)
    .addRule('sort-imports', ERROR, [{ignoreDeclarationSort: true}])
    .addRule('sort-keys', OFF)
    .addRule('sort-vars', OFF)
    .addRule('strict', ERROR, ['never'])
    .addRule('symbol-description', ERROR)
    .addRule('vars-on-top', ERROR)
    .addRule('yoda', ERROR)
    /* Category: Layout & Formatting */
    .addRule('unicode-bom', ERROR)
    /* Category: Stylistic */
    .addAnyRule('@stylistic', 'quotes', ERROR, [
      'single', // Doesn't matter since `ignoreStringLiterals` is true - BUT will be used in fixes
      {
        ignoreStringLiterals: true,
        avoidEscape: true, // TODO Doesn't have any effect `ignoreStringLiterals` is true - should propose auto-fix?
      },
    ])
    .addAnyRule('@stylistic', 'padding-line-between-statements', ERROR, [
      {blankLine: 'never', prev: 'import', next: 'import'},
    ])
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
