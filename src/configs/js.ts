import {ERROR, GLOB_HTML, GLOB_YAML, OFF, WARNING} from '../constants';
import type {BuiltinEslintRules} from '../eslint';
import {fetchPackageInfo, getKeysOfTruthyValues} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnConfigOptions,
  assignDefaults,
} from './index';

export interface JsEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, BuiltinEslintRules> {
  /**
   * Will be merged with the default value
   * @default {warn: true, error: true}
   */
  allowedConsoleMethods?: Partial<Record<keyof Console | (string & {}), boolean>>;
}

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies JsEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, '');

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
    .markCategory('Possible Problems')
    .addRule('array-callback-return', ERROR, [{checkForEach: true}]) /** @since 2.0.0-alpha-1 */
    .addRule('constructor-super', ERROR) /** @since 0.24.0 */ // 🟢
    .addRule('for-direction', ERROR) /** @since 4.0.0-beta.0 */ // 🟢
    .addRule('getter-return', ERROR) /** @since 4.2.0 */ // 🟢
    .addRule('no-async-promise-executor', ERROR) /** @since 5.3.0 */ // 🟢
    .addRule('no-await-in-loop', WARNING) /** @since 3.12.0 */
    .addRule('no-class-assign', ERROR) /** @since 1.0.0-rc-1 */ // 🟢
    .addRule('no-compare-neg-zero', ERROR) /** @since 3.17.0 */ // 🟢
    .addRule('no-cond-assign', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-const-assign', ERROR) /** @since 1.0.0-rc-1 */ // 🟢
    .addRule('no-constant-binary-expression', ERROR) /** @since 8.14.0 */ // 🟢
    .addRule('no-constant-condition', ERROR) /** @since 0.4.1 */ // 🟢
    .addRule('no-constructor-return', WARNING) /** @since 6.7.0 */
    .addRule('no-control-regex', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-debugger', ERROR) /** @since 0.0.2 */ // 🟢
    .addRule('no-dupe-args', ERROR) /** @since 0.16.0 */ // 🟢
    .addRule('no-dupe-class-members', ERROR) /** @since 1.2.0 */ // 🟢
    .addRule('no-dupe-else-if', ERROR) /** @since 6.7.0 */ // 🟢
    .addRule('no-dupe-keys', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-duplicate-case', ERROR) /** @since 0.17.0 */ // 🟢
    .addRule('no-duplicate-imports', ERROR) /** @since 2.5.0 */
    .addRule('no-empty-character-class', ERROR) /** @since 0.22.0 */ // 🟢
    .addRule('no-empty-pattern', ERROR) /** @since 1.7.0 */ // 🟢
    .addRule('no-ex-assign', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-fallthrough', ERROR) /** @since 0.0.7 */ // 🟢
    .addRule('no-func-assign', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-import-assign', ERROR) /** @since 6.4.0 */ // 🟢
    .addRule('no-inner-declarations', ERROR) /** @since 0.6.0 */
    .addRule('no-invalid-regexp', ERROR) /** @since 0.1.4 */ // 🟢
    .addRule('no-irregular-whitespace', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('no-loss-of-precision', ERROR) /** @since 7.1.0 */ // 🟢
    .addRule('no-misleading-character-class', ERROR) /** @since 5.3.0 */ // 🟢
    .addRule('no-new-native-nonconstructor', ERROR) /** @since 8.27.0 */ // 🟢
    .addRule('no-obj-calls', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-promise-executor-return', ERROR) /** @since 7.3.0 */
    .addRule('no-prototype-builtins', ERROR) /** @since 2.11.0 */ // 🟢
    .addRule('no-self-assign', ERROR) /** @since 2.0.0-rc.0 */ // 🟢
    .addRule('no-self-compare', ERROR) /** @since 0.0.9 */
    .addRule('no-setter-return', ERROR) /** @since 6.7.0 */ // 🟢
    .addRule('no-sparse-arrays', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-template-curly-in-string', ERROR) /** @since 3.3.0 */
    .addRule('no-this-before-super', ERROR) /** @since 0.24.0 */ // 🟢
    .addRule('no-unassigned-vars', eslintVersion >= 9.27 ? ERROR : OFF) /** @since 9.27.0 */
    .addRule('no-undef', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-unexpected-multiline', OFF) /** @since 0.24.0 */ // 🟢💅
    .addRule('no-unmodified-loop-condition', ERROR) /** @since 2.0.0-alpha-2 */
    .addRule('no-unreachable', ERROR) /** @since 0.0.6 */ // 🟢
    .addRule('no-unreachable-loop', ERROR) /** @since 7.3.0 */
    .addRule('no-unsafe-finally', ERROR) /** @since 2.9.0 */ // 🟢
    .addRule('no-unsafe-negation', ERROR) /** @since 3.3.0 */ // 🟢
    .addRule('no-unsafe-optional-chaining', ERROR) /** @since 7.15.0 */ // 🟢
    .addRule('no-unused-private-class-members', ERROR) /** @since 8.1.0 */ // 🟢
    .addRule('no-unused-vars', ERROR, [{ignoreRestSiblings: true}]) /** @since 0.0.9 */ // 🟢
    .addRule('no-use-before-define', ERROR, [{functions: false}]) /** @since 0.0.9 */
    .addRule('no-useless-assignment', ERROR) /** @since 9.0.0-alpha.1 */
    .addRule('no-useless-backreference', ERROR) /** @since 7.0.0-alpha.0 */ // 🟢
    .addRule('require-atomic-updates', ERROR, [{allowProperties: true}]) /** @since 5.3.0 */
    .addRule('use-isnan', ERROR) /** @since 0.0.6 */ // 🟢
    .addRule('valid-typeof', ERROR) /** @since 0.5.0 */ // 🟢
    .markCategory('Suggestions')
    .addRule('accessor-pairs', ERROR) /** @since 0.22.0 */
    .addRule('arrow-body-style', OFF) /** @since 1.8.0 */
    .addRule('block-scoped-var', ERROR) /** @since 0.1.0 */
    .addRule('camelcase', ERROR, [
      {
        properties: 'never' as const,
        ignoreGlobals: true,
        allow: [String.raw`\d_\d`],
      },
    ]) /** @since 0.0.2 */
    .addRule('capitalized-comments', OFF) /** @since 3.11.0 */
    .addRule(
      'class-methods-use-this',
      ERROR,
      eslintVersion >= 9.24
        ? [{ignoreOverrideMethods: true, ignoreClassesWithImplements: 'all'}]
        : [],
    ) /** @since 3.4.0 */
    .addRule('complexity', OFF) /** @since 0.0.9 */
    .addRule('consistent-return', ERROR) /** @since 0.4.0 */
    .addRule('consistent-this', ERROR, ['that']) /** @since 0.0.9 */
    .addRule('curly', ERROR, ['all' /* default */]) /** @since 0.0.2 */ // 🟠
    .addRule('default-case', ERROR) /** @since 0.6.0 */
    .addRule('default-case-last', ERROR) /** @since 7.0.0-alpha.0 */
    .addRule('default-param-last', ERROR) /** @since 6.4.0 */
    .addRule('dot-notation', ERROR) /** @since 0.0.7 */
    .addRule('eqeqeq', ERROR, ['always', {null: 'ignore'}]) /** @since 0.0.2 */
    .addRule('func-name-matching', ERROR, [{considerPropertyDescriptor: true}]) /** @since 3.8.0 */
    .addRule('func-names', OFF) /** @since 0.4.0 */
    .addRule('func-style', OFF) /** @since 0.2.0 */
    .addRule('grouped-accessor-pairs', ERROR, ['getBeforeSet']) /** @since 6.7.0 */
    .addRule('guard-for-in', ERROR) /** @since 0.0.6 */
    .addRule('id-denylist', OFF) /** @since 7.4.0 */
    .addRule('id-length', OFF) /** @since 1.0.0 */
    .addRule('id-match', OFF) /** @since 1.0.0 */
    .addRule('init-declarations', OFF) /** @since 1.0.0-rc-1 */
    .addRule('logical-assignment-operators', ERROR, ['always']) /** @since 8.24.0 */
    .addRule('max-classes-per-file', ERROR, [
      {ignoreExpressions: true, max: 2},
    ]) /** @since 5.0.0-alpha.3 */
    .addRule('max-depth', OFF) /** @since 0.0.9 */
    .addRule('max-lines', OFF) /** @since 2.12.0 */
    .addRule('max-lines-per-function', OFF) /** @since 5.0.0 */
    .addRule('max-nested-callbacks', OFF) /** @since 0.2.0 */
    .addRule('max-params', OFF) /** @since 0.0.9 */
    .addRule('max-statements', OFF) /** @since 0.0.9 */
    .addRule('new-cap', ERROR, [{properties: false, capIsNew: false}]) /** @since 0.0.3-0 */
    .addRule('no-alert', WARNING) /** @since 0.0.5 */
    .addRule('no-array-constructor', ERROR) /** @since 0.4.0 */
    .addRule('no-bitwise', OFF) /** @since 0.0.2 */
    .addRule('no-caller', ERROR) /** @since 0.0.6 */
    .addRule('no-case-declarations', ERROR) /** @since 1.9.0 */ // 🟢
    .addRule('no-console', ERROR, [
      {
        ...(allowedConsoleMethods?.length && {allow: allowedConsoleMethods}),
      },
    ]) /** @since 0.0.2 */
    .addRule('no-continue', OFF) /** @since 0.19.0 */
    .addRule('no-delete-var', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-div-regex', OFF) /** @since 0.1.0 */
    .addRule('no-else-return', ERROR, [{allowElseIf: false}]) /** @since 0.0.9 */
    .addRule('no-empty', ERROR) /** @since 0.0.2 */ // 🟢
    .addRule('no-empty-function', ERROR) /** @since 2.0.0 */
    .addRule('no-empty-static-block', ERROR) /** @since 8.27.0 */ // 🟢
    .addRule('no-eq-null', OFF) /** @since 0.0.9 */
    .addRule('no-eval', ERROR) /** @since 0.0.2 */
    .addRule('no-extend-native', ERROR) /** @since 0.1.4 */
    .addRule('no-extra-bind', ERROR) /** @since 0.8.0 */
    .addRule('no-extra-boolean-cast', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-extra-label', ERROR) /** @since 2.0.0-rc.0 */
    .addRule('no-global-assign', ERROR) /** @since 3.3.0 */ // 🟢
    .addRule('no-implicit-coercion', ERROR, [
      {boolean: true, disallowTemplateShorthand: true},
    ]) /** @since 1.0.0-rc-2 */
    .addRule('no-implicit-globals', OFF) /** @since 2.0.0-alpha-1 */
    .addRule('no-implied-eval', ERROR) /** @since 0.0.7 */
    .addRule('no-inline-comments', OFF) /** @since 0.10.0 */
    .addRule('no-invalid-this', OFF) /** @since 1.0.0-rc-2 */
    .addRule('no-iterator', ERROR) /** @since 0.0.9 */
    .addRule('no-label-var', ERROR) /** @since 0.0.9 */
    .addRule('no-labels', ERROR, [{allowLoop: true}]) /** @since 0.4.0 */
    .addRule('no-lone-blocks', ERROR) /** @since 0.4.0 */
    .addRule('no-lonely-if', ERROR) /** @since 0.6.0 */
    .addRule('no-loop-func', ERROR) /** @since 0.0.9 */
    .addRule('no-magic-numbers', OFF) /** @since 1.7.0 */
    .addRule('no-multi-assign', ERROR) /** @since 3.14.0 */
    .addRule('no-multi-str', ERROR) /** @since 0.0.9 */
    .addRule('no-negated-condition', ERROR) /** @since 1.6.0 */
    .addRule('no-nested-ternary', OFF) /** @since 0.2.0 */
    .addRule('no-new', WARNING) /** @since 0.0.7 */
    .addRule('no-new-func', ERROR) /** @since 0.0.7 */
    .addRule('no-new-wrappers', ERROR) /** @since 0.0.6 */
    .addRule('no-nonoctal-decimal-escape', ERROR) /** @since 7.14.0 */ // 🟢
    .addRule('no-object-constructor', ERROR) /** @since 8.50.0 */
    .addRule('no-octal', ERROR) /** @since 0.0.6 */ // 🟢
    .addRule('no-octal-escape', ERROR) /** @since 0.0.9 */
    .addRule('no-param-reassign', WARNING) /** @since 0.18.0 */
    .addRule('no-plusplus', OFF) /** @since 0.0.9 */
    .addRule('no-proto', ERROR) /** @since 0.0.9 */
    .addRule('no-redeclare', ERROR) /** @since 0.0.9 */ // 🟢
    .addRule('no-regex-spaces', ERROR) /** @since 0.4.0 */ // 🟢
    .addRule('no-restricted-exports', OFF) /** @since 7.0.0-alpha.0 */
    .addRule('no-restricted-globals', ERROR, [
      {name: 'global', message: 'Use `globalThis` instead'},
      {name: 'self', message: 'Use `globalThis` instead'},
      {name: 'event', message: 'Use local parameter instead'},
    ]) /** @since 2.3.0 */
    .addRule('no-restricted-imports', OFF) /** @since 2.0.0-alpha-1 */
    .addRule('no-restricted-properties', OFF) /** @since 3.5.0 */
    .addRule('no-restricted-syntax', OFF) /** @since 1.4.0 */
    .addRule('no-return-assign', ERROR, ['always']) /** @since 0.0.9 */
    .addRule('no-script-url', ERROR) /** @since 0.0.9 */
    .addRule('no-sequences', ERROR) /** @since 0.5.1 */
    .addRule('no-shadow', ERROR) /** @since 0.0.9 */
    .addRule(
      'no-shadow-restricted-names',
      ERROR,
      eslintVersion >= 9.26 ? [{reportGlobalThis: true}] : [],
    ) /** @since 0.1.4 */ // 🟢
    .addRule('no-ternary', OFF) /** @since 0.0.9 */
    .addRule('no-throw-literal', ERROR) /** @since 0.15.0 */
    .addRule('no-undef-init', ERROR) /** @since 0.0.6 */
    .addRule('no-undefined', OFF) /** @since 0.7.1 */
    // Had a potential, but unfortunately reports accesses of object properties starting with _
    .addRule('no-underscore-dangle', OFF, [
      {
        allow: ['__dirname', '__filename'],
        allowAfterThis: true,
        allowAfterSuper: true,
        allowAfterThisConstructor: true,
      },
    ]) /** @since 0.0.9 */
    .addRule('no-unneeded-ternary', ERROR, [{defaultAssignment: false}]) /** @since 0.21.0 */
    .addRule('no-unused-expressions', ERROR, [
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ]) /** @since 0.1.0 */
    .addRule('no-unused-labels', ERROR) /** @since 2.0.0-rc.0 */ // 🟢
    .addRule('no-useless-call', ERROR) /** @since 1.0.0-rc-1 */
    .addRule('no-useless-catch', ERROR) /** @since 5.11.0 */ // 🟢
    .addRule('no-useless-computed-key', ERROR) /** @since 2.9.0 */
    .addRule('no-useless-concat', ERROR) /** @since 1.3.0 */
    .addRule('no-useless-constructor', ERROR) /** @since 2.0.0-beta.1 */
    .addRule('no-useless-escape', ERROR) /** @since 2.5.0 */ // 🟢
    .addRule('no-useless-rename', ERROR) /** @since 2.11.0 */
    .addRule('no-useless-return', ERROR) /** @since 3.9.0 */
    .addRule('no-var', ERROR) /** @since 0.12.0 */
    .addRule('no-void', ERROR, [{allowAsStatement: true}]) /** @since 0.8.0 */
    .addRule('no-warning-comments', OFF) /** @since 0.4.4 */
    .addRule('no-with', ERROR) /** @since 0.0.2 */ // 🟢
    .addRule('object-shorthand', ERROR) /** @since 0.20.0 */
    .addRule('one-var', ERROR, ['never']) /** @since 0.0.9 */
    .addRule('operator-assignment', ERROR) /** @since 0.10.0 */
    .addRule('prefer-arrow-callback', ERROR, [
      {allowNamedFunctions: false, allowUnboundThis: true},
    ]) /** @since 1.2.0 */
    .addRule('prefer-const', ERROR, [
      {destructuring: 'all', ignoreReadBeforeAssign: true},
    ]) /** @since 0.23.0 */
    .addRule('prefer-destructuring', ERROR, [
      {
        VariableDeclarator: {array: false, object: true},
        AssignmentExpression: {array: false, object: false},
      },
    ]) /** @since 3.13.0 */
    .addRule('prefer-exponentiation-operator', ERROR) /** @since 6.7.0 */
    .addRule('prefer-named-capture-group', OFF) /** @since 5.15.0 */
    .addRule('prefer-numeric-literals', ERROR) /** @since 3.5.0 */
    // TODO disable if ecmaVersion<2022?
    .addRule('prefer-object-has-own', ERROR) /** @since 8.5.0 */
    .addRule('prefer-object-spread', ERROR) /** @since 5.0.0-alpha.3 */
    .addRule('prefer-promise-reject-errors', ERROR) /** @since 3.14.0 */
    .addRule('prefer-regex-literals', ERROR, [
      {disallowRedundantWrapping: true},
    ]) /** @since 6.4.0 */
    .addRule('prefer-rest-params', ERROR) /** @since 2.0.0-alpha-1 */
    .addRule('prefer-spread', ERROR) /** @since 1.0.0-rc-1 */
    .addRule('prefer-template', ERROR) /** @since 1.2.0 */
    .addRule('preserve-caught-error', OFF) /** @since 9.35.0 */
    .addRule('radix', ERROR) /** @since 0.0.7 */
    .addRule('require-await', ERROR) /** @since 3.11.0 */
    .addRule('require-unicode-regexp', OFF) /** @since 5.3.0 */
    .addRule('require-yield', ERROR) /** @since 1.0.0-rc-1 */ // 🟢
    .addRule('sort-imports', ERROR, [{ignoreDeclarationSort: true}]) /** @since 2.0.0-beta.1 */
    .addRule('sort-keys', OFF) /** @since 3.3.0 */
    .addRule('sort-vars', OFF) /** @since 0.2.0 */
    .addRule('strict', ERROR, ['never']) /** @since 0.1.0 */
    .addRule('symbol-description', ERROR) /** @since 3.4.0 */
    .addRule('vars-on-top', ERROR) /** @since 0.8.0 */
    .addRule('yoda', ERROR) /** @since 0.7.1 */
    .markCategory('Layout & Formatting')
    .addRule('unicode-bom', ERROR) /** @since 2.11.0 */
    .markCategory('Stylistic')
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
    .enableConfigTesterForPlugin('')
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
}) satisfies UnConfigFn<'js'>;
