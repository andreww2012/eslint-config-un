import {GLOB_SVELTE} from './constants';
import {RULE_CATEGORIES_PER_PLUGIN} from './eslint-rule-categories.gen';
import type {PluginPrefix} from './loaders';

const asTypeAwareRules = (ruleNames: readonly string[]) =>
  Object.fromEntries(ruleNames.map((ruleName) => [ruleName, true] as const));

export const RULES_REQUIRING_TYPE_INFORMATION: Partial<
  Record<
    PluginPrefix,
    {
      rules: Partial<Record<string, true | 'optional'>>;
      extraPatterns?: string[];
      extraFileExtensions?: `.${string}`[];
    }
  >
> = {
  awscdk: {
    rules: {
      'construct-constructor-property': true,
      'no-construct-in-interface': true,
      'no-construct-in-public-property-of-construct': true,
      'no-construct-stack-suffix': true,
      'no-mutable-public-property-of-construct': true,
      'no-parent-name-construct-id-match': true,
      'no-unused-props': true,
      'no-variable-construct-id': true,
      'pascal-case-construct-id': true,
      'prefer-grants-property': true,
      'prevent-construct-id-collision': true,
      'props-name-convention': true,
      'require-jsdoc': true,
      'require-passing-this': true,
    },
  },
  e18e: {
    rules: {
      'prefer-array-to-reversed': 'optional',
      'prefer-array-to-sorted': 'optional',
      'no-indexof-equality': true,
      'prefer-inline-equality': 'optional',
      'prefer-regex-test': 'optional',
    },
  },
  ember: {
    rules: {
      'template-no-deprecated': 'optional',
    },
  },
  'eslint-plugin': {
    rules: asTypeAwareRules(RULE_CATEGORIES_PER_PLUGIN['eslint-plugin'].typeAware),
  },
  'expect-type': {
    rules: asTypeAwareRules(RULE_CATEGORIES_PER_PLUGIN['expect-type'].typeAware),
  },
  functional: {
    rules: {
      'functional-parameters': 'optional',
      'immutable-data': true,
      'no-conditional-statements': true,
      'no-expression-statements': 'optional',
      'no-mixed-types': true,
      'no-return-void': true,
      'no-throw-statements': 'optional',
      'prefer-immutable-types': true,
      'prefer-property-signatures': true,
      'prefer-tacit': true,
      'readonly-type': true,
      'type-declaration-immutability': true,
    },
  },
  jest: {
    rules: asTypeAwareRules(RULE_CATEGORIES_PER_PLUGIN.jest.typeAware),
  },
  jsdoc: {
    rules: {
      'no-unnecessary-type-assertion': 'optional',
    },
  },
  nestjs: {
    rules: {
      'api-enum-property-best-practices': true,
      'all-properties-have-explicit-defined': true,
      'forward-ref-injection-should-use-wrapper-type': 'optional',
      'validated-non-primitive-property-needs-type-decorator': true,
    },
  },
  ngrx: {
    rules: asTypeAwareRules(RULE_CATEGORIES_PER_PLUGIN.ngrx.typeAware),
  },
  'eslint-react': {
    rules: {
      'no-implicit-children': true,
      'no-implicit-key': true,
      'no-implicit-ref': true,
      'no-leaked-conditional-rendering': true,
      'no-unused-props': true,
    },
  },
  sonarjs: {
    rules: {
      'anchor-precedence': 'optional',
      'argument-type': 'optional',
      'arguments-order': 'optional',
      'array-callback-without-return': 'optional',
      'assertions-in-tests': 'optional',
      'bitwise-operators': 'optional',
      'class-prototype': 'optional',
      'concise-regex': 'optional',
      deprecation: 'optional',
      'different-types-comparison': 'optional',
      'disabled-auto-escaping': 'optional',
      'disabled-resource-integrity': 'optional',
      'duplicates-in-character-class': 'optional',
      'empty-string-repetition': 'optional',
      'existing-groups': 'optional',
      'function-return-type': 'optional',
      'in-operator-type-error': 'optional',
      'index-of-compare-to-positive-number': 'optional',
      'jsx-no-leaked-render': 'optional',
      'new-operator-misuse': 'optional',
      'no-alphabetical-sort': 'optional',
      'no-array-delete': 'optional',
      'no-associative-arrays': 'optional',
      'no-async-constructor': 'optional',
      'no-collection-size-mischeck': 'optional',
      'no-control-regex': 'optional',
      'no-empty-after-reluctant': 'optional',
      'no-empty-alternatives': 'optional',
      'no-empty-character-class': 'optional',
      'no-empty-group': 'optional',
      'no-for-in-iterable': 'optional',
      'no-ignored-return': 'optional',
      'no-in-misuse': 'optional',
      'no-incompatible-assertion-types': 'optional',
      'no-inconsistent-returns': 'optional',
      'no-incorrect-string-concat': 'optional',
      'no-invalid-regexp': 'optional',
      'no-misleading-array-reverse': 'optional',
      'no-misleading-character-class': 'optional',
      'no-redundant-optional': 'optional',
      'no-regex-spaces': 'optional',
      'no-require-or-define': 'optional',
      'no-return-type-any': 'optional',
      'no-selector-parameter': 'optional',
      'no-try-promise': 'optional',
      'no-undefined-argument': 'optional',
      'no-useless-intersection': 'optional',
      'non-number-in-arithmetic-expression': 'optional',
      'null-dereference': 'optional',
      'operation-returning-nan': 'optional',
      'post-message': 'optional',
      'prefer-immediate-return': 'optional',
      'prefer-read-only-props': 'optional',
      'prefer-regexp-exec': 'optional',
      'reduce-initial-value': 'optional',
      'regex-complexity': 'optional',
      'single-char-in-character-classes': 'optional',
      'single-character-alternation': 'optional',
      'slow-regex': 'optional',
      'sql-queries': 'optional',
      'strings-comparison': 'optional',
      'unicode-aware-regex': 'optional',
      'unused-import': 'optional',
      'unused-named-groups': 'optional',
      'values-not-convertible-to-numbers': 'optional',
      'void-use': 'optional',
    },
  },
  svelte: {
    rules: {
      'no-unused-props': 'optional',
    },
    extraPatterns: [GLOB_SVELTE],
    extraFileExtensions: ['.svelte'],
  },
  ts: {
    rules: asTypeAwareRules(RULE_CATEGORIES_PER_PLUGIN.ts.typeAware),
  },
  unicorn: {
    rules: {
      'consistent-boolean-name': 'optional', // Indirect
      'dom-node-dataset': 'optional', // Indirect
      'explicit-length-check': 'optional', // Indirect
      'no-array-callback-reference': 'optional',
      'no-array-front-mutation': 'optional', // Indirect
      'no-array-method-this-argument': 'optional', // Indirect
      'no-array-reduce': 'optional', // Indirect
      'no-array-sort-for-min-max': 'optional', // Indirect
      'no-array-splice': 'optional',
      'no-async-promise-finally': 'optional',
      'no-boolean-sort-comparator': 'optional', // Indirect
      'no-chained-comparison': 'optional', // Indirect
      'no-collection-bracket-access': 'optional', // Indirect
      'no-computed-property-existence-check': 'optional', // Indirect
      'no-for-each': 'optional', // Indirect
      'no-for-loop': 'optional',
      'no-invalid-character-comparison': 'optional', // Indirect
      'no-invalid-well-known-symbol-methods': 'optional',
      'no-late-event-control': 'optional', // Indirect
      'no-loop-iterable-mutation': 'optional', // Indirect
      'no-mismatched-map-key': 'optional', // Indirect
      'no-negated-array-predicate': 'optional', // Indirect
      'no-non-function-verb-prefix': 'optional',
      'no-object-methods-with-collections': 'optional',
      'no-transition-all': 'optional',
      'no-uncalled-method': 'optional', // Indirect
      'no-unnecessary-array-flat-map': 'optional', // Indirect
      'no-unnecessary-boolean-comparison': 'optional', // Indirect
      'no-unnecessary-fetch-options': 'optional',
      'no-unnecessary-string-trim': 'optional', // Indirect
      'no-unsafe-buffer-conversion': 'optional',
      'no-unsafe-promise-all-settled-values': 'optional',
      'no-unsafe-property-key': 'optional',
      'no-useless-coercion': 'optional',
      'no-useless-length-check': 'optional', // Indirect
      'no-useless-logical-operand': 'optional', // Indirect
      'no-useless-override': 'optional',
      'no-useless-spread': 'optional', // Indirect
      'prefer-abort-signal-any': 'optional',
      'prefer-aggregate-error': 'optional',
      'prefer-array-find': 'optional', // Indirect
      'prefer-array-flat-map': 'optional', // Indirect
      'prefer-array-from-map': 'optional', // Indirect
      'prefer-array-iterable-methods': 'optional', // Indirect
      'prefer-array-slice': 'optional', // Indirect
      'prefer-array-some': 'optional', // Indirect
      'prefer-at': 'optional', // Indirect
      'prefer-await': 'optional',
      'prefer-direct-iteration': 'optional',
      'prefer-dispose': 'optional',
      'prefer-dom-node-replace-children': 'optional', // Indirect
      'prefer-dom-node-text-content': 'optional', // Indirect
      'prefer-else-if': 'optional', // Indirect
      'prefer-group-by': 'optional', // Indirect
      'prefer-has-check': 'optional',
      'prefer-includes': 'optional', // Indirect
      'prefer-iterator-helpers': 'optional', // Indirect
      'prefer-keyboard-event-key': 'optional', // Indirect
      'prefer-modern-dom-apis': 'optional',
      'prefer-observer-apis': 'optional',
      'prefer-path2d': 'optional',
      'prefer-regexp-escape': 'optional', // Indirect
      'prefer-regexp-test': 'optional',
      'prefer-set-methods': 'optional', // Indirect
      'prefer-set-size': 'optional', // Indirect
      'prefer-simplified-conditions': 'optional', // Indirect
      'prefer-single-array-predicate': 'optional', // Indirect
      'prefer-spread': 'optional',
      'prefer-string-replace-all': 'optional', // Indirect
      'prefer-string-slice': 'optional', // Indirect
      'prefer-string-starts-ends-with': 'optional', // Indirect
      'prefer-string-trim-start-end': 'optional', // Indirect
      'prefer-temporal': 'optional',
      'prefer-then-catch': 'optional',
      'prefer-toggle-attribute': 'optional', // Indirect
      'prefer-uint8array-base64': 'optional',
      'prefer-url-href': 'optional',
      'prefer-url-search-parameters': 'optional', // Indirect
      'require-array-join-separator': 'optional', // Indirect
      'require-array-sort-compare': 'optional', // Indirect
    },
  },
  vitest: {
    rules: asTypeAwareRules(RULE_CATEGORIES_PER_PLUGIN.vitest.typeAware),
  },
  'zod-openapi': {
    rules: {
      'prefer-meta-last': true,
      'prefer-zod-default': true,
      'require-comment': true,
      'require-example': true,
      'require-meta': true,
    },
  },
};
