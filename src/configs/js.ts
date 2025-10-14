import {ERROR, GLOB_HTML, GLOB_YAML, OFF, WARNING} from '../constants';
import {
  type BuiltinEslintRules,
  type RulesRecord,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import {assignDefaults, fetchPackageInfo, getKeysOfTruthyValues} from '../utils';
import type {UnConfigFn} from './index';

export interface JsEslintConfigOptions extends UnConfigOptions<BuiltinEslintRules> {
  /**
   * Will be merged with the default value
   * @default {warn: true, error: true}
   */
  allowedConsoleMethods?: Partial<Record<keyof Console | (string & {}), boolean>>;
}

export const jsUnConfig: UnConfigFn<
  'js',
  {
    finalFlatConfigRules: Partial<RulesRecord>;
  }
> = async (context) => {
  const optionsRaw = context.rootOptions.configs?.js;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies JsEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, '');

  const eslintVersion = (await fetchPackageInfo('eslint'))?.versions.majorAndMinor || 0;

  const allowedConsoleMethods = getKeysOfTruthyValues(
    {
      warn: true,
      error: true,
      ...optionsResolved.allowedConsoleMethods,
    },
    true,
  );

  // Legend:
  // 🟢 - in recommended
  // 🟠 - rule from `eslint-config-prettier`

  const config = configBuilder
    ?.addConfig([
      'js',
      {
        includeDefaultFilesAndIgnores: true,
        doNotIgnoreHtml: true, // TODO required?
      },
    ])
    /* Category: Possible Problems */
    .addRule('array-callback-return', ERROR, [{checkForEach: true}]) // >=2.0.0-alpha-1
    .addRule('constructor-super', ERROR) // 🟢 >=0.24.0
    .addRule('for-direction', ERROR) // 🟢 >=4.0.0-beta.0
    .addRule('getter-return', ERROR) // 🟢 >=4.2.0
    .addRule('no-async-promise-executor', ERROR) // 🟢 >=5.3.0
    .addRule('no-await-in-loop', WARNING) // >=3.12.0
    .addRule('no-class-assign', ERROR) // 🟢 >=1.0.0-rc-1
    .addRule('no-compare-neg-zero', ERROR) // 🟢 >=3.17.0
    .addRule('no-cond-assign', ERROR) // 🟢 >=0.0.9
    .addRule('no-const-assign', ERROR) // 🟢 >=1.0.0-rc-1
    .addRule('no-constant-binary-expression', ERROR) // 🟢 >=8.14.0
    .addRule('no-constant-condition', ERROR) // 🟢 >=0.4.1
    .addRule('no-constructor-return', WARNING) // >=6.7.0
    .addRule('no-control-regex', ERROR) // 🟢 >=0.1.0
    .addRule('no-debugger', ERROR) // 🟢 >=0.0.2
    .addRule('no-dupe-args', ERROR) // 🟢 >=0.16.0
    .addRule('no-dupe-class-members', ERROR) // 🟢 >=1.2.0
    .addRule('no-dupe-else-if', ERROR) // 🟢 >=6.7.0
    .addRule('no-dupe-keys', ERROR) // 🟢 >=0.0.9
    .addRule('no-duplicate-case', ERROR) // 🟢 >=0.17.0
    .addRule('no-duplicate-imports', ERROR) // >=2.5.0
    .addRule('no-empty-character-class', ERROR) // 🟢 >=0.22.0
    .addRule('no-empty-pattern', ERROR) // 🟢 >=1.7.0
    .addRule('no-ex-assign', ERROR) // 🟢 >=0.0.9
    .addRule('no-fallthrough', ERROR) // 🟢 >=0.0.7
    .addRule('no-func-assign', ERROR) // 🟢 >=0.0.9
    .addRule('no-import-assign', ERROR) // 🟢 >=6.4.0
    .addRule('no-inner-declarations', ERROR) // >=0.6.0
    .addRule('no-invalid-regexp', ERROR) // 🟢 >=0.1.4
    .addRule('no-irregular-whitespace', ERROR) // 🟢 >=0.9.0
    .addRule('no-loss-of-precision', ERROR) // 🟢 >=7.1.0
    .addRule('no-misleading-character-class', ERROR) // 🟢 >=5.3.0
    .addRule('no-new-native-nonconstructor', ERROR) // 🟢 >=8.27.0
    .addRule('no-obj-calls', ERROR) // 🟢 >=0.0.9
    .addRule('no-promise-executor-return', ERROR) // >=7.3.0
    .addRule('no-prototype-builtins', ERROR) // 🟢 >=2.11.0
    .addRule('no-self-assign', ERROR) // 🟢 >=2.0.0-rc.0
    .addRule('no-self-compare', ERROR) // >=0.0.9
    .addRule('no-setter-return', ERROR) // 🟢 >=6.7.0
    .addRule('no-sparse-arrays', ERROR) // 🟢 >=0.4.0
    .addRule('no-template-curly-in-string', ERROR) // >=3.3.0
    .addRule('no-this-before-super', ERROR) // 🟢 >=0.24.0
    .addRule('no-unassigned-vars', eslintVersion >= 9.27 ? ERROR : OFF) // >=9.27.0
    .addRule('no-undef', ERROR) // 🟢 >=0.0.9
    .addRule('no-unexpected-multiline', OFF) // 🟢💅 >=0.24.0
    .addRule('no-unmodified-loop-condition', ERROR) // >=2.0.0-alpha-2
    .addRule('no-unreachable-loop', ERROR) // >=7.3.0
    .addRule('no-unreachable', ERROR) // 🟢 >=0.0.6
    .addRule('no-unsafe-finally', ERROR) // 🟢 >=2.9.0
    .addRule('no-unsafe-negation', ERROR) // 🟢 >=3.3.0
    .addRule('no-unsafe-optional-chaining', ERROR) // 🟢 >=7.15.0
    .addRule('no-unused-private-class-members', ERROR) // 🟢 >=8.1.0
    .addRule('no-unused-vars', ERROR, [{ignoreRestSiblings: true}]) // 🟢 >=0.0.9
    .addRule('no-use-before-define', ERROR, [{functions: false}]) // >=0.0.9
    .addRule('no-useless-assignment', ERROR) // >=9.0.0-alpha.1
    .addRule('no-useless-backreference', ERROR) // 🟢 >=7.0.0-alpha.0
    .addRule('require-atomic-updates', ERROR, [{allowProperties: true}]) // >=5.3.0
    .addRule('use-isnan', ERROR) // 🟢 >=0.0.6
    .addRule('valid-typeof', ERROR) // 🟢 >=0.5.0
    /* Category: Suggestions */
    .addRule('accessor-pairs', ERROR) // >=0.22.0
    .addRule('arrow-body-style', OFF) // >=1.8.0
    .addRule('block-scoped-var', ERROR) // >=0.1.0
    .addRule('camelcase', ERROR, [
      {
        properties: 'never' as const,
        ignoreGlobals: true,
        allow: [String.raw`\d_\d`],
      },
    ]) // >=0.0.2
    .addRule('capitalized-comments', OFF) // >=3.11.0
    .addRule(
      'class-methods-use-this',
      ERROR,
      eslintVersion >= 9.24
        ? [{ignoreOverrideMethods: true, ignoreClassesWithImplements: 'all'}]
        : [],
    ) // >=3.4.0
    .addRule('complexity', OFF) // >=0.0.9
    .addRule('consistent-return', ERROR) // >=0.4.0
    .addRule('consistent-this', ERROR, ['that']) // >=0.0.9
    .addRule('curly', ERROR, ['all' /* default */]) // 🟠 >=0.0.2
    .addRule('default-case-last', ERROR) // >=7.0.0-alpha.0
    .addRule('default-case', ERROR) // >=0.6.0
    .addRule('default-param-last', ERROR) // >=6.4.0
    .addRule('dot-notation', ERROR) // >=0.0.7
    .addRule('eqeqeq', ERROR, ['always', {null: 'ignore'}]) // >=0.0.2
    .addRule('func-name-matching', ERROR, [{considerPropertyDescriptor: true}]) // >=3.8.0
    .addRule('func-names', OFF) // >=0.4.0
    .addRule('func-style', OFF) // >=0.2.0
    .addRule('grouped-accessor-pairs', ERROR, ['getBeforeSet']) // >=6.7.0
    .addRule('guard-for-in', ERROR) // >=0.0.6
    .addRule('id-denylist', OFF) // >=7.4.0
    .addRule('id-length', OFF) // >=1.0.0
    .addRule('id-match', OFF) // >=1.0.0
    .addRule('init-declarations', OFF) // >=1.0.0-rc-1
    .addRule('logical-assignment-operators', ERROR, ['always']) // >=8.24.0
    .addRule('max-classes-per-file', ERROR, [{ignoreExpressions: true, max: 2}]) // >=5.0.0-alpha.3
    .addRule('max-depth', OFF) // >=0.0.9
    .addRule('max-lines-per-function', OFF) // >=5.0.0
    .addRule('max-lines', OFF) // >=2.12.0
    .addRule('max-nested-callbacks', OFF) // >=0.2.0
    .addRule('max-params', OFF) // >=0.0.9
    .addRule('max-statements', OFF) // >=0.0.9
    .addRule('new-cap', ERROR, [{properties: false, capIsNew: false}]) // >=0.0.3-0
    .addRule('no-alert', WARNING) // >=0.0.5
    .addRule('no-array-constructor', ERROR) // >=0.4.0
    .addRule('no-bitwise', OFF) // >=0.0.2
    .addRule('no-caller', ERROR) // >=0.0.6
    .addRule('no-case-declarations', ERROR) // 🟢 >=1.9.0
    .addRule('no-console', ERROR, [
      {
        ...(allowedConsoleMethods?.length && {allow: allowedConsoleMethods}),
      },
    ]) // >=0.0.2
    .addRule('no-continue', OFF) // >=0.19.0
    .addRule('no-delete-var', ERROR) // 🟢 >=0.0.9
    .addRule('no-empty-static-block', ERROR) // 🟢 >=8.27.0
    .addRule('no-empty', ERROR) // 🟢 >=0.0.2
    .addRule('no-extra-boolean-cast', ERROR) // 🟢 >=0.4.0
    .addRule('no-global-assign', ERROR) // 🟢 >=3.3.0
    .addRule('no-nonoctal-decimal-escape', ERROR) // 🟢 >=7.14.0
    .addRule('no-octal', ERROR) // 🟢 >=0.0.6
    .addRule('no-redeclare', ERROR) // 🟢 >=0.0.9
    .addRule('no-regex-spaces', ERROR) // 🟢 >=0.4.0
    .addRule(
      'no-shadow-restricted-names',
      ERROR,
      eslintVersion >= 9.26 ? [{reportGlobalThis: true}] : [],
    ) // 🟢 >=0.1.4
    .addRule('no-div-regex', OFF) // >=0.1.0
    .addRule('no-else-return', ERROR, [{allowElseIf: false}]) // >=0.0.9
    .addRule('no-empty-function', ERROR) // >=2.0.0
    .addRule('no-eq-null', OFF) // >=0.0.9
    .addRule('no-eval', ERROR) // >=0.0.2
    .addRule('no-extend-native', ERROR) // >=0.1.4
    .addRule('no-extra-bind', ERROR) // >=0.8.0
    .addRule('no-extra-label', ERROR) // >=2.0.0-rc.0
    .addRule('no-implicit-coercion', ERROR, [{boolean: true, disallowTemplateShorthand: true}]) // >=1.0.0-rc-2
    .addRule('no-implicit-globals', OFF) // >=2.0.0-alpha-1
    .addRule('no-implied-eval', ERROR) // >=0.0.7
    .addRule('no-inline-comments', OFF) // >=0.10.0
    .addRule('no-invalid-this', OFF) // >=1.0.0-rc-2
    .addRule('no-iterator', ERROR) // >=0.0.9
    .addRule('no-label-var', ERROR) // >=0.0.9
    .addRule('no-labels', ERROR, [{allowLoop: false}]) // >=0.4.0
    .addRule('no-lone-blocks', ERROR) // >=0.4.0
    .addRule('no-lonely-if', ERROR) // >=0.6.0
    .addRule('no-loop-func', ERROR) // >=0.0.9
    .addRule('no-magic-numbers', OFF) // >=1.7.0
    .addRule('no-multi-assign', ERROR) // >=3.14.0
    .addRule('no-multi-str', ERROR) // >=0.0.9
    .addRule('no-negated-condition', ERROR) // >=1.6.0
    .addRule('no-nested-ternary', OFF) // >=0.2.0
    .addRule('no-new-func', ERROR) // >=0.0.7
    .addRule('no-new-wrappers', ERROR) // >=0.0.6
    .addRule('no-new', WARNING) // >=0.0.7
    .addRule('no-object-constructor', ERROR) // >=8.50.0
    .addRule('no-octal-escape', ERROR) // >=0.0.9
    .addRule('no-param-reassign', WARNING) // >=0.18.0
    .addRule('no-plusplus', OFF) // >=0.0.9
    .addRule('no-proto', ERROR) // >=0.0.9
    .addRule('no-restricted-exports', OFF) // >=7.0.0-alpha.0
    .addRule('no-unused-labels', ERROR) // 🟢 >=2.0.0-rc.0
    .addRule('no-useless-catch', ERROR) // 🟢 >=5.11.0
    .addRule('no-useless-escape', ERROR) // 🟢 >=2.5.0
    .addRule('no-with', ERROR) // 🟢 >=0.0.2
    .addRule('require-yield', ERROR) // 🟢 >=1.0.0-rc-1
    .addRule('no-restricted-globals', ERROR, [
      {name: 'global', message: 'Use `globalThis` instead'},
      {name: 'self', message: 'Use `globalThis` instead'},
      {name: 'event', message: 'Use local parameter instead'},
    ]) // >=2.3.0
    .addRule('no-restricted-imports', OFF) // >=2.0.0-alpha-1
    .addRule('no-restricted-properties', OFF) // >=3.5.0
    .addRule('no-restricted-syntax', OFF) // >=1.4.0
    .addRule('no-return-assign', ERROR, ['always']) // >=0.0.9
    .addRule('no-script-url', ERROR) // >=0.0.9
    .addRule('no-sequences', ERROR) // >=0.5.1
    .addRule('no-shadow', ERROR) // >=0.0.9
    .addRule('no-ternary', OFF) // >=0.0.9
    .addRule('no-throw-literal', ERROR) // >=0.15.0
    .addRule('no-undef-init', ERROR) // >=0.0.6
    .addRule('no-undefined', OFF) // >=0.7.1
    // Had a potential, but unfortunately reports accesses of object properties starting with _
    .addRule('no-underscore-dangle', OFF, [
      {
        allow: ['__dirname', '__filename'],
        allowAfterThis: true,
        allowAfterSuper: true,
        allowAfterThisConstructor: true,
      },
    ]) // >=0.0.9
    .addRule('no-unneeded-ternary', ERROR, [{defaultAssignment: false}]) // >=0.21.0
    .addRule('no-unused-expressions', ERROR, [
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ]) // >=0.1.0
    .addRule('no-useless-call', ERROR) // >=1.0.0-rc-1
    .addRule('no-useless-computed-key', ERROR) // >=2.9.0
    .addRule('no-useless-concat', ERROR) // >=1.3.0
    .addRule('no-useless-constructor', ERROR) // >=2.0.0-beta.1
    .addRule('no-useless-rename', ERROR) // >=2.11.0
    .addRule('no-useless-return', ERROR) // >=3.9.0
    .addRule('no-var', ERROR) // >=0.12.0
    .addRule('no-void', ERROR, [{allowAsStatement: true}]) // >=0.8.0
    .addRule('no-warning-comments', OFF) // >=0.4.4
    .addRule('object-shorthand', ERROR) // >=0.20.0
    .addRule('one-var', ERROR, ['never']) // >=0.0.9
    .addRule('operator-assignment', ERROR) // >=0.10.0
    .addRule('prefer-arrow-callback', ERROR, [{allowNamedFunctions: false, allowUnboundThis: true}]) // >=1.2.0
    .addRule('prefer-const', ERROR, [{destructuring: 'all', ignoreReadBeforeAssign: true}]) // >=0.23.0
    .addRule('prefer-destructuring', ERROR, [
      {
        VariableDeclarator: {array: false, object: true},
        AssignmentExpression: {array: false, object: false},
      },
    ]) // >=3.13.0
    .addRule('prefer-exponentiation-operator', ERROR) // >=6.7.0
    .addRule('prefer-named-capture-group', OFF) // >=5.15.0
    .addRule('prefer-numeric-literals', ERROR) // >=3.5.0
    // TODO disable if ecmaVersion<2022?
    .addRule('prefer-object-has-own', ERROR) // >=8.5.0
    .addRule('prefer-object-spread', ERROR) // >=5.0.0-alpha.3
    .addRule('prefer-promise-reject-errors', ERROR) // >=3.14.0
    .addRule('prefer-regex-literals', ERROR, [{disallowRedundantWrapping: true}]) // >=6.4.0
    .addRule('prefer-rest-params', ERROR) // >=2.0.0-alpha-1
    .addRule('prefer-spread', ERROR) // >=1.0.0-rc-1
    .addRule('prefer-template', ERROR) // >=1.2.0
    .addRule('preserve-caught-error', OFF) // >=9.35.0
    .addRule('radix', ERROR) // >=0.0.7
    .addRule('require-await', ERROR) // >=3.11.0
    .addRule('require-unicode-regexp', OFF) // >=5.3.0
    .addRule('sort-imports', ERROR, [{ignoreDeclarationSort: true}]) // >=2.0.0-beta.1
    .addRule('sort-keys', OFF) // >=3.3.0
    .addRule('sort-vars', OFF) // >=0.2.0
    .addRule('strict', ERROR, ['never']) // >=0.1.0
    .addRule('symbol-description', ERROR) // >=3.4.0
    .addRule('vars-on-top', ERROR) // >=0.8.0
    .addRule('yoda', ERROR) // >=0.7.1
    /* Category: Layout & Formatting */
    .addRule('unicode-bom', ERROR) // >=2.11.0
    /* Category: Stylistic */
    .addAnyRule('@stylistic', 'quotes', ERROR, [
      'single', // Doesn't matter since `ignoreStringLiterals` is true - BUT will be used in fixes
      {
        ignoreStringLiterals: true,
        avoidEscape: true,
        allowTemplateLiterals: 'avoidEscape',
      },
    ]) // 🟠
    .addAnyRule('@stylistic', 'padding-line-between-statements', ERROR, [
      {blankLine: 'never', prev: 'import', next: 'import'},
    ])
    .addOverrides();

  configBuilder
    ?.addConfig('js/@stylistic_spaced-comment', {
      ...(optionsResolved.files?.length && {files: optionsResolved.files}),
      // TODO possible to do anything with this?
      // Triggered on all YAML comments because they all are considered Block for whatever reason: https://github.com/ota-meshi/yaml-eslint-parser/blob/498dc41fbed52abd4e508bc903d98e3d1d62d555/src/convert.ts#L1581
      // Might crash on HTML files (if receives a comment node with `CommentContent` type)
      ignores: [GLOB_YAML, GLOB_HTML, ...(optionsResolved.ignores || [])],
    })
    .addAnyRule('@stylistic', 'spaced-comment', ERROR, [
      'always',
      {
        block: {
          balanced: true,
        },
      },
    ]);

  return {
    configs: [configBuilder],
    optionsResolved,
    finalFlatConfigRules: config?.config.rules || {},
  };
};
