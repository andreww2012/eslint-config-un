/* eslint perfectionist/sort-objects: "error" */
import {type RuleNamesForPlugin, type UnConfigOptions, createConfigBuilder} from '../../eslint';
import {ALL_RULES_PER_PLUGIN} from '../../eslint-rules.gen';
import type {PluginPrefix} from '../../plugins';
import type {ObjectValues} from '../../types';
import {assignDefaults, objectEntriesUnsafe} from '../../utils';
import type {UnConfigFn} from '../index';

const markAllPluginRulesAsStylistic = <PluginName extends keyof typeof ALL_RULES_PER_PLUGIN>(
  pluginName: PluginName,
) =>
  Object.fromEntries(
    ALL_RULES_PER_PLUGIN[pluginName].map((ruleName) => [ruleName, true]),
  ) as Record<(typeof ALL_RULES_PER_PLUGIN)[PluginName][number], true>;

// Criteria of including rules in this list:
// - rule finds easily fixable problems and the fix does not change code behavior
// - rule does not find bugs/other kind of problems
// - rule is triggered relatively often
const ALL_STYLISTIC_RULES = {
  '': {
    'arrow-body-style': true,
    camelcase: true,
    'capitalized-comments': true,
    'consistent-this': true,
    curly: true,
    'dot-notation': true,
    'func-name-matching': true,
    'func-names': true,
    'func-style': true,
    'grouped-accessor-pairs': true,
    'logical-assignment-operators': true,
    'max-classes-per-file': true,
    'max-depth': true,
    'max-lines': true,
    'max-lines-per-function': true,
    'max-nested-callbacks': true,
    'max-params': true,
    'max-statements': true,
    'new-cap': true,
    'no-div-regex': true,
    'no-else-return': true,
    'no-implicit-coercion': true,
    'no-inline-comments': true,
    'no-lonely-if': true,
    'no-multi-assign': true,
    'no-multi-str': true,
    'no-negated-condition': true,
    'no-nested-ternary': true,
    'no-plusplus': true,
    'no-regex-spaces': true,
    'no-return-assign': true,
    'no-ternary': true,
    'no-undef-init': true,
    'no-underscore-dangle': true,
    'no-useless-concat': true,
    'no-void': true,
    'no-warning-comments': true,
    'object-shorthand': true,
    'one-var': true,
    'operator-assignment': true,
    'prefer-arrow-callback': true,
    'prefer-destructuring': true,
    'prefer-exponentiation-operator': true,
    'prefer-named-capture-group': true,
    'prefer-numeric-literals': true,
    'prefer-object-has-own': true,
    'prefer-object-spread': true,
    'prefer-regex-literals': true,
    'prefer-spread': true,
    'prefer-template': true,
    radix: true,
    'sort-imports': true,
    'sort-keys': true,
    'sort-vars': true,
    yoda: true,
  },
  '@angular-eslint': {
    'component-class-suffix': true,
    'component-max-inline-declarations': true,
    'component-selector': true,
    'directive-class-suffix': true,
    'directive-selector': true,
    'pipe-prefix': true,
    'sort-keys-in-type-decorator': true,
    'sort-lifecycle-methods': true,
  },
  '@angular-eslint/template': {
    'attributes-order': true,
    'prefer-contextual-for-variables': true,
    'prefer-self-closing-tags': true,
  },
  '@cspell': {
    // None
  },
  '@eslint-community/eslint-comments': {
    // None
  },
  '@eslint-react': {
    'avoid-shorthand-boolean': true,
    'avoid-shorthand-fragment': true,
    'prefer-destructuring-assignment': true,
    'prefer-react-namespace-import': true,
    'prefer-read-only-props': true,
    'prefer-shorthand-boolean': true,
    'prefer-shorthand-fragment': true,
  },
  '@eslint-react/debug': {
    'class-component': true,
    'function-component': true,
    hook: true,
    'is-from-react': true,
    jsx: true,
  },
  '@eslint-react/dom': {
    // None
  },
  '@eslint-react/hooks-extra': {
    // None
  },
  '@eslint-react/naming-convention': {
    'component-name': true,
    'context-name': true,
    filename: true,
    'filename-extension': true,
    'use-state': true,
  },
  '@eslint-react/web-api': {
    // None
  },
  '@html-eslint': {
    quotes: true,
  },
  '@next/next': {
    // None
  },
  '@stylistic': markAllPluginRulesAsStylistic('@stylistic'),
  '@tanstack/query': {
    // None
  },
  astro: {
    'prefer-class-list-directive': true,
    'prefer-object-class-list': true,
    'prefer-split-class-list': true,
    semi: true,
    'sort-attributes': true,
  },
  ava: {
    'hooks-order': true,
  },
  'better-tailwindcss': {
    'enforce-consistent-variable-syntax': true,
    multiline: true,
    'no-duplicate-classes': true,
    'no-unnecessary-whitespace': true,
    'sort-classes': true,
  },
  'case-police': {
    'string-check': true,
  },
  css: {
    // None
  },
  'css-in-js': {
    'color-hex-style': true,
    'named-color': true,
    'property-casing': true,
  },
  cypress: {
    // None
  },
  'de-morgan': {
    'no-negated-conjunction': true,
    'no-negated-disjunction': true,
  },
  depend: {
    // None
  },
  ember: {
    'no-implicit-service-injection-argument': true,
    'no-unnecessary-index-route': true,
    'no-unnecessary-route-path-option': true,
    'no-unnecessary-service-injection-argument': true,
    'order-in-components': true,
    'order-in-controllers': true,
    'order-in-models': true,
    'order-in-routes': true,
    'route-path-style': true,
    'routes-segments-snake-case': true,
    'template-indent': true,
    'use-brace-expansion': true,
  },
  'erasable-syntax-only': {
    // None
  },
  es: {
    // None
  },
  graphql: {
    alphabetize: true,
    'description-style': true,
    'input-name': true,
    'match-document-filename': true,
    'naming-convention': true,
    'no-hashtag-description': true,
    'no-typename-prefix': true,
  },
  html: {
    // None
  },
  import: {
    'consistent-type-specifier-style': true,
    export: true,
    'exports-last': true,
    first: true,
    'group-exports': true,
    'newline-after-import': true,
    'no-duplicates': true,
    'no-useless-path-segments': true,
    order: true,
  },
  jest: {
    'consistent-test-it': true,
    'no-alias-methods': true,
    'no-interpolation-in-snapshots': true,
    'no-test-prefixes': true,
    'padding-around-after-all-blocks': true,
    'padding-around-after-each-blocks': true,
    'padding-around-all': true,
    'padding-around-before-all-blocks': true,
    'padding-around-before-each-blocks': true,
    'padding-around-describe-blocks': true,
    'padding-around-expect-groups': true,
    'padding-around-test-blocks': true,
    'prefer-comparison-matcher': true,
    'prefer-each': true,
    'prefer-equality-matcher': true,
    'prefer-expect-resolves': true,
    'prefer-hooks-in-order': true,
    'prefer-hooks-on-top': true,
    'prefer-lowercase-title': true,
    'prefer-mock-promise-shorthand': true,
    'prefer-to-be': true,
    'prefer-to-contain': true,
    'prefer-to-have-length': true,
  },
  'jest-extended': markAllPluginRulesAsStylistic('jest-extended'),
  jsdoc: {
    'check-alignment': true,
    'check-indentation': true,
    'check-line-alignment': true,
    'lines-before-block': true,
    'multiline-blocks': true,
    'no-blank-block-descriptions': true,
    'no-multi-asterisks': true,
    'require-asterisk-prefix': true,
    'sort-tags': true,
    'tag-lines': true,
  },
  'json-schema-validator': {
    // None
  },
  jsonc: {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'comma-dangle': true,
    'comma-style': true,
    indent: true,
    'key-spacing': true,
    'object-curly-newline': true,
    'object-curly-spacing': true,
    'object-property-newline': true,
    'quote-props': true,
    quotes: true,
    'sort-array-values': true,
    'sort-keys': true,
  },
  'jsx-a11y': {
    // None
  },
  markdown: {
    // None
  },
  math: {
    'prefer-exponentiation-operator': true,
  },
  'no-type-assertion': {
    'no-type-assertion': true,
  },
  'no-unsanitized': {
    // None
  },
  node: {
    'prefer-global/buffer': true,
    'prefer-global/console': true,
    'prefer-global/process': true,
    'prefer-global/text-decoder': true,
    'prefer-global/text-encoder': true,
    'prefer-global/url': true,
    'prefer-global/url-search-params': true,
    'prefer-node-protocol': true,
  },
  'node-dependencies': {
    // None
  },
  'package-json': {
    'no-empty-fields': true,
    'order-properties': true,
    'sort-collections': true,
  },
  perfectionist: markAllPluginRulesAsStylistic('perfectionist'),
  pinia: {
    'prefer-use-store-naming-convention': true,
  },
  pnpm: {
    // None
  },
  'prefer-arrow-functions': {
    'prefer-arrow-functions': true,
  },
  prettier: {
    prettier: true,
  },
  promise: {
    'param-names': true,
  },
  qwik: {
    'prefer-classlist': true,
  },
  react: {
    'boolean-prop-naming': true,
    'destructuring-assignment': true,
    'function-component-definition': true,
    'hook-use-state': true,
    'jsx-boolean-value': true,
    'jsx-child-element-spacing': true,
    'jsx-closing-bracket-location': true,
    'jsx-closing-tag-location': true,
    'jsx-curly-brace-presence': true,
    'jsx-curly-newline': true,
    'jsx-curly-spacing': true,
    'jsx-equals-spacing': true,
    'jsx-first-prop-new-line': true,
    'jsx-fragments': true,
    'jsx-handler-names': true,
    'jsx-indent': true,
    'jsx-indent-props': true,
    'jsx-max-props-per-line': true,
    'jsx-newline': true,
    'jsx-no-literals': true,
    'jsx-one-expression-per-line': true,
    'jsx-pascal-case': true,
    'jsx-props-no-multi-spaces': true,
    'jsx-sort-props': true,
    'jsx-tag-spacing': true,
    'jsx-wrap-multilines': true,
    'prefer-es6-class': true,
    'prefer-exact-props': true,
    'prefer-read-only-props': true,
    'self-closing-comp': true,
    'sort-comp': true,
    'sort-default-props': true,
    'sort-prop-types': true,
    'state-in-constructor': true,
    'static-property-placement': true,
    'style-prop-object': true,
  },
  'react-compiler': {
    // None
  },
  'react-hooks': {
    // None
  },
  'react-refresh': {
    // None
  },
  regexp: {
    'grapheme-string-literal': true,
    'hexadecimal-escape': true,
    'letter-case': true,
    'prefer-quantifier': true,
    'prefer-regexp-exec': true,
    'prefer-regexp-test': true,
    'sort-alternatives': true,
    'sort-character-class-elements': true,
    'sort-flags': true,
    'unicode-escape': true,
    'use-ignore-case': true,
  },
  security: {
    // None
  },
  solid: {
    imports: true,
    'prefer-show': true,
    'self-closing-comp': true,
    'style-prop': true,
  },
  sonarjs: {
    'arrow-function-convention': true,
    'call-argument-line': true,
    'class-name': true,
    'conditional-indentation': true,
    'destructuring-assignment-syntax': true,
    'enforce-trailing-comma': true,
    'function-name': true,
    'max-lines': true,
    'max-lines-per-function': true,
    'max-switch-cases': true,
    'max-union-size': true,
    'no-inverted-boolean-check': true,
    'no-redundant-optional': true,
    'no-same-line-conditional': true,
    'no-small-switch': true,
    'no-tab': true,
    'no-undefined-argument': true,
    'no-undefined-assignment': true,
    'prefer-read-only-props': true,
    'prefer-regexp-exec': true,
    'prefer-single-boolean-return': true,
    'public-static-readonly': true,
    'shorthand-property-grouping': true,
    'use-type-alias': true,
    'variable-name': true,
  },
  storybook: {
    // None
  },
  svelte: {
    'consistent-selector-style': true,
    'derived-has-same-inputs-outputs': true,
    'first-attribute-linebreak': true,
    'html-closing-bracket-new-line': true,
    'html-closing-bracket-spacing': true,
    'html-quotes': true,
    'html-self-closing': true,
    indent: true,
    'max-attributes-per-line': true,
    'mustache-spacing': true,
    'no-extra-reactive-curlies': true,
    'no-spaces-around-equal-signs-in-attribute': true,
    'no-trailing-spaces': true,
    'prefer-class-directive': true,
    'prefer-style-directive': true,
    'require-event-prefix': true,
    'shorthand-attribute': true,
    'shorthand-directive': true,
    'sort-attributes': true,
    'spaced-html-comment': true,
  },
  tailwindcss: {
    'classnames-order': true,
    'enforces-shorthand': true,
  },
  'testing-library': {
    // None
  },
  toml: {
    'array-bracket-newline': true,
    'array-bracket-spacing': true,
    'array-element-newline': true,
    'comma-style': true,
    indent: true,
    'inline-table-curly-spacing': true,
    'key-spacing': true,
    'no-space-dots': true,
    'no-unreadable-number-separator': true,
    'padding-line-between-pairs': true,
    'padding-line-between-tables': true,
    'quoted-keys': true,
    'spaced-comment': true,
    'table-bracket-spacing': true,
    'tables-order': true,
  },
  // Won't include: prefer-find, no-unnecessary-type-assertion
  ts: {
    'adjacent-overload-signatures': true,
    'array-type': true,
    'ban-ts-comment': true,
    'class-literal-property-style': true,
    'consistent-generic-constructors': true,
    'consistent-indexed-object-style': true,
    'consistent-type-assertions': true,
    'consistent-type-definitions': true,
    'consistent-type-exports': true,
    'consistent-type-imports': true,
    'dot-notation': true,
    'max-params': true,
    'member-ordering': true,
    'method-signature-style': true,
    'naming-convention': true,
    'no-confusing-non-null-assertion': true,
    'no-inferrable-types': true,
    'no-unnecessary-boolean-literal-compare': true,
    'no-unnecessary-template-expression': true,
    'no-unnecessary-type-arguments': true,
    'non-nullable-type-assertion-style': true,
    'prefer-as-const': true,
    'prefer-destructuring': true,
    'prefer-for-of': true,
    'prefer-function-type': true,
    'prefer-includes': true,
    'prefer-nullish-coalescing': true,
    'prefer-optional-chain': true,
    'prefer-readonly': true,
    'prefer-regexp-exec': true,
    'prefer-string-starts-ends-with': true,
    'return-await': true,
    'triple-slash-reference': true,
    'unified-signatures': true,
    'use-unknown-in-catch-callback-variable': true,
  },
  turbo: {
    // None
  },
  // Won't include: no-console-spaces, prefer-array-find, prefer-array-some, prefer-math-trunc, prefer-modern-math-apis, prefer-string-starts-ends-with
  unicorn: {
    'better-regex': true,
    'catch-error-name': true,
    'consistent-assert': true,
    'consistent-date-clone': true,
    'consistent-destructuring': true,
    'consistent-existence-index-check': true,
    'empty-brace-spaces': true,
    'escape-case': true,
    'explicit-length-check': true,
    'filename-case': true,
    'import-style': true,
    'no-array-for-each': true,
    'no-await-expression-member': true,
    'no-for-loop': true,
    'no-hex-escape': true,
    'no-keyword-prefix': true,
    'no-lonely-if': true,
    'no-magic-array-flat-depth': true,
    'no-named-default': true,
    'no-negated-condition': true,
    'no-negation-in-equality-check': true,
    'no-nested-ternary': true,
    'no-null': true,
    'no-this-assignment': true,
    'no-typeof-undefined': true,
    'no-unreadable-array-destructuring': true,
    'no-unreadable-iife': true,
    'no-useless-fallback-in-spread': true,
    'no-useless-undefined': true,
    'no-zero-fractions': true,
    'number-literal-case': true,
    'numeric-separators-style': true,
    'prefer-add-event-listener': true,
    'prefer-array-flat': true,
    'prefer-array-flat-map': true,
    'prefer-array-index-of': true,
    'prefer-at': true,
    'prefer-code-point': true,
    'prefer-date-now': true,
    'prefer-dom-node-append': true,
    'prefer-dom-node-dataset': true,
    'prefer-dom-node-remove': true,
    'prefer-export-from': true,
    'prefer-global-this': true,
    'prefer-import-meta-properties': true,
    'prefer-includes': true,
    'prefer-logical-operator-over-ternary': true,
    'prefer-math-min-max': true,
    'prefer-modern-dom-apis': true,
    'prefer-native-coercion-functions': true,
    'prefer-negative-index': true,
    'prefer-node-protocol': true,
    'prefer-number-properties': true,
    'prefer-object-from-entries': true,
    'prefer-prototype-methods': true,
    'prefer-query-selector': true,
    'prefer-reflect-apply': true,
    'prefer-regexp-test': true,
    'prefer-single-call': true,
    'prefer-spread': true,
    'prefer-string-raw': true,
    'prefer-string-replace-all': true,
    'prefer-string-slice': true,
    'prefer-string-trim-start-end': true,
    'prefer-structured-clone': true,
    'prefer-switch': true,
    'prefer-ternary': true,
    'prefer-type-error': true,
    'prevent-abbreviations': true,
    'relative-url-style': true,
    'switch-case-braces': true,
    'template-indent': true,
    'text-encoding-identifier-case': true,
  },
  'unused-imports': {
    // None
  },
  vitest: {
    'consistent-test-it': true,
    'consistent-vitest-vi': true,
    'no-alias-methods': true,
    'no-importing-vitest-globals': true,
    'no-interpolation-in-snapshots': true,
    'prefer-each': true,
    'prefer-expect-resolves': true,
    'prefer-hooks-in-order': true,
    'prefer-importing-vitest-globals': true,
    'prefer-lowercase-title': true,
    'prefer-to-be': true,
    'prefer-to-contain': true,
    'prefer-to-have-length': true,
    'valid-title': true,
  },
  vue: {
    'attribute-hyphenation': true,
    'block-lang': true,
    'block-order': true,
    'component-name-in-template-casing': true,
    'custom-event-name-casing': true,
    'define-emits-declaration': true,
    'define-macros-order': true,
    'define-props-declaration': true,
    'dot-notation': true,
    'first-attribute-linebreak': true,
    'html-self-closing': true,
    'multi-word-component-names': true,
    'no-implicit-coercion': true,
    'no-use-v-else-with-v-for': true,
    'no-use-v-if-with-v-for': true,
    'no-useless-mustaches': true,
    'object-shorthand': true,
    'order-in-components': true,
    'padding-line-between-blocks': true,
    'prefer-separate-static-class': true,
    'prefer-template': true,
    'prefer-true-attribute-shorthand': true,
    'prefer-use-template-ref': true,
    'require-explicit-slots': true,
    'require-macro-variable-name': true,
    'slot-name-casing': true,
    'v-bind-style': true,
    'v-for-delimiter-style': true,
    'v-on-handler-style': true,
    'v-slot-style': true,
  },
  'vuejs-accessibility': {
    // None
  },
  yml: {
    'block-mapping': true,
    'block-mapping-colon-indicator-newline': true,
    'block-mapping-question-indicator-newline': true,
    'block-sequence': true,
    'block-sequence-hyphen-indicator-newline': true,
    'file-extension': true,
    'flow-mapping-curly-newline': true,
    'flow-mapping-curly-spacing': true,
    'flow-sequence-bracket-newline': true,
    'flow-sequence-bracket-spacing': true,
    indent: true,
    'key-spacing': true,
    'no-multiple-empty-lines': true,
    'no-trailing-zeros': true,
    'plain-scalar': true,
    quotes: true,
    'require-string-key': true,
    'spaced-comment': true,
  },
} as const satisfies {
  [Plugin in PluginPrefix]: Partial<Record<RuleNamesForPlugin<Plugin>, true>>;
};

type AllStylisticRules = ObjectValues<{
  [Plugin in keyof typeof ALL_STYLISTIC_RULES]: `${Plugin extends '' ? '' : `${Plugin}/`}${keyof (typeof ALL_STYLISTIC_RULES)[Plugin] & string}`;
}>;

export interface NoStylisticRulesEslintConfigOptions extends UnConfigOptions {
  enableRules?: {
    /**
     * Specify which of the disabled by default stylistic rules will be enabled.
     * `true` enables all rules. In combination with `enableRules.disableAllOtherRules` set to `true`,
     * all the other rules will be disabled. This allows to enable stylistic rules exclusively.
     * @default false
     */
    rules: boolean | Partial<Record<AllStylisticRules, boolean>>;

    /**
     * Disable all other rules from all plugins except the ones specified in `enableRules.rules`.
     * @default false
     */
    disableAllOtherRules?: boolean;
  };
}

export const noStylisticRulesUnConfig: UnConfigFn<'noStylisticRules'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.noStylisticRules;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies NoStylisticRulesEslintConfigOptions,
  );

  const {enableRules: {disableAllOtherRules = false, rules: enabledRules} = {rules: false}} =
    optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, null);

  configBuilder
    ?.addConfig([
      'no-stylistic-rules',
      {
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .disableBulkRules(
      enabledRules === true
        ? false
        : Object.entries(ALL_STYLISTIC_RULES).flatMap(([pluginName, rules]) =>
            Object.keys(rules)
              .map((ruleName) => {
                const ruleNameWithPrefix = `${pluginName ? `${pluginName}/` : ''}${ruleName}`;
                return enabledRules && enabledRules[ruleNameWithPrefix as keyof typeof enabledRules]
                  ? null
                  : ruleNameWithPrefix;
              })
              .filter((v) => v != null),
          ),
    )
    .addOverrides();

  if (disableAllOtherRules) {
    configBuilder
      ?.addConfig([
        'no-stylistic-rules/disable-all-non-stylistic-rules',
        {
          doNotIgnoreCss: true,
          doNotIgnoreHtml: true,
          doNotIgnoreMarkdown: true,
          includeDefaultFilesAndIgnores: true,
        },
      ])
      .disableBulkRules(
        objectEntriesUnsafe(ALL_RULES_PER_PLUGIN)
          .flatMap(([pluginName, rules]) =>
            rules.map((ruleName) => {
              return ruleName in ALL_STYLISTIC_RULES[pluginName]
                ? null
                : `${pluginName ? `${pluginName}/` : ''}${ruleName}`;
            }),
          )
          .filter((v) => v != null),
      );
  }

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
