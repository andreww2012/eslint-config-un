// import antfu from '@antfu/eslint-config';
import {eslintConfig} from './src';

// export default antfu({});
export default eslintConfig({
  configs: {
    jest: false,
    vue: {
      sfcBlockOrder: ['lalal'],
    },
    yaml: true,
    toml: true,
    json: true,
    packageJson: true,
    markdown: /* false ??  */ {
      lintCodeBlocks: {
        // files: ['TODO_private.md'],
      },
      codeBlocksIgnoredLanguages: ['javascript'],
      overrides: {
        // 'markdown/no-missing-label-refs': 0,
        // 'markdown/heading-increment': 0,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore playing around
      _overridesCodeBlocks: {
        'vue/component-name-in-template-casing': 0,
        'vue/block-order': 0,
        'import/order': 0,
        'vue/attribute-hyphenation': 0,
        'vue/prefer-true-attribute-shorthand': 0,
        'vue/v-on-handler-style': 0,
        'no-promise-executor-return': 0,
        'vue/html-button-has-type': 0,
        'no-var': 0,
        'vars-on-top': 0,
        'block-scoped-var': 0,
        'no-redeclare': 0,
        'unicorn/prefer-add-event-listener': 0,
        'no-loop-func': 0,
        'prefer-arrow-callback': 0,
        'prefer-template': 0,
        'unicorn/prefer-includes': 0,
        'no-param-reassign': 0,
        'no-new-wrappers': 0,
        'no-self-compare': 0,
        'unicorn/new-for-builtins': 0,
        'no-constant-binary-expression': 0,
        yoda: 0, // TODO null === undefined
        'unicorn/prefer-number-properties': 0,
        'sonarjs/no-small-switch': 0,
        'use-isnan': 0,
        'default-case': 0,
        'unicorn/switch-case-braces': 0,
        eqeqeq: 0,
        'unicorn/prefer-date-now': 0,
        'no-lone-blocks': 0,
        'sonarjs/no-all-duplicated-branches': 0,
        'sonarjs/no-redundant-boolean': 0,
        'no-else-return': 0,
        'no-throw-literal': 0,
        'no-unreachable': 0,
        'disable-autofix/unicorn/catch-error-name': 0,
        'unicorn/prefer-optional-catch-binding': 0,
        'no-unsafe-finally': 0,
        'sonarjs/prefer-object-literal': 0,
        'one-var': 0,
        'unicorn/no-zero-fractions': 0,
        'sonarjs/no-identical-expressions': 0,
        'no-useless-concat': 0,
        'no-new-func': 0,
        'no-eval': 0, // TODO `typeof eval`
        'dot-notation': 0,
        'func-name-matching': 0,
        'unicorn/no-new-array': 0,
        'unicorn/prefer-ternary': 0,
        'no-use-before-define': 0,
        'no-shadow': 0,
        'unicorn/consistent-function-scoping': 0,
        'no-self-assign': 0,
        'prefer-rest-params': 0,
        'unicorn/no-negated-condition': 0,
        'unicorn/no-typeof-undefined': 0,
        'consistent-this': 0,
        'unicorn/no-this-assignment': 0,
        'no-constant-condition': 0,
        'sonarjs/no-gratuitous-expressions': 0,
        'prefer-numeric-literals': 0,
        'no-sparse-arrays': 0,
        'unicorn/prefer-string-raw': 0,
        'no-multi-str': 0,
        'no-array-constructor': 0,
        'array-callback-return': 0,
        'disable-autofix/unicorn/prefer-spread': 0,
        'unicorn/prefer-at': 0,
        'guard-for-in': 0,
        'prefer-destructuring': 0,
        'no-labels': 0,
        'no-extra-label': 0,
        'sort-imports': 0,
        '@stylistic/padding-line-between-statements': 0,
        'no-useless-constructor': 0,
        'class-methods-use-this': 0,
        'promise/catch-or-return': 0,
        'import/first': 0,
        'import/newline-after-import': 0,
        'regexp/sort-character-class-elements': 0,
        'regexp/use-ignore-case': 0,
        'regexp/no-control-character': 0,
        '@stylistic/quotes': 0,
        'unicorn/escape-case': 0,
        'regexp/no-lazy-ends': 0,
        'prefer-regex-literals': 0, // TODO test/mdn/javascript/guide/regular_expressions/index.md
        'regexp/no-non-standard-flag': 0,
        'regexp/sort-flags': 0,
        'no-constructor-return': 0, // TODO test/mdn/javascript/guide/using_classes/index.md
        'promise/always-return': 0,
        'promise/no-nesting': 0,
        'no-object-constructor': 0,
        'object-shorthand': 0,
        'accessor-pairs': 0,
        'new-cap': 0,
        'unicorn/no-console-spaces': 0,
        'no-proto': 0,
        'no-prototype-builtins': 0,
        'operator-assignment': 0,
        'logical-assignment-operators': 0,
        'sonarjs/no-one-iteration-loop': 0,
        'unicorn/prefer-string-slice': 0,
        'unicorn/custom-error-definition': 0,
        'constructor-super': 0,
        'unicorn/no-instanceof-array': 0,
        curly: 0,
        'sonarjs/prefer-single-boolean-return': 0,
        'no-useless-return': 0,
        'consistent-return': 0,
        'unicorn/no-hex-escape': 0,
        'getter-return': 0,
        'no-dupe-keys': 0,
        'grouped-accessor-pairs': 0,
        'node/prefer-node-protocol': 0,
        'prefer-exponentiation-operator': 0,
        'no-empty-pattern': 0,
        'no-obj-calls': 0,
        'no-new-native-nonconstructor': 0,
        'promise/no-new-statics': 0,
        'prefer-promise-reject-errors': 0,
        'no-global-assign': 0, // TODO
        camelcase: 0,
        'disable-autofix/unicorn/explicit-length-check': 0,
        'regexp/strict': 0,
        'regexp/no-useless-quantifier': 0,
        'regexp/prefer-plus-quantifier': 0,
        'regexp/hexadecimal-escape': 0,
        'regexp/no-useless-range': 0,
        'regexp/prefer-quantifier': 0,
        'regexp/no-missing-g-flag': 0,
        'no-this-before-super': 0,
        'no-caller': 0,
        'unicorn/prefer-reflect-apply': 0,
        'unicorn/prefer-math-min-max': 0,
        'default-param-last': 0,
        'no-fallthrough': 0,
        'unicorn/prefer-prototype-methods': 0,
        'unicorn/no-single-promise-in-promise-methods': 0,
        'regexp/prefer-d': 0,
        'unicorn/prefer-array-index-of': 0,
        'require-await': 0,
        'require-atomic-updates': 0,
        'unicorn/no-array-method-this-argument': 0,
        'unicorn/prefer-dom-node-append': 0,
        'unicorn/require-array-join-separator': 0,
        radix: 0,
        'unicorn/prefer-array-flat': 0,
        'unicorn/prefer-native-coercion-functions': 0,
        'disable-autofix/unicorn/no-useless-undefined': 0,
        'unicorn/prefer-structured-clone': 0,
        'no-implicit-coercion': 0,
        'unicorn/error-message': 0,
        'sonarjs/no-extra-arguments': 0,
        'unicorn/prefer-type-error': 0,
        'unicorn/throw-new-error': 0,
        'prefer-spread': 0,
        'no-useless-computed-key': 0,
        'no-extra-bind': 0,
        'symbol-description': 0,
        'no-template-curly-in-string': 0, // TODO test/mdn/javascript/reference/global_objects/function/function/index.md
        'no-restricted-globals': 0,
        'no-loss-of-precision': 0,
        'unicorn/no-array-push-push': 0,
        'sonarjs/no-element-overwrite': 0,
        'unicorn/prefer-math-trunc': 0,
        'unicorn/require-number-to-fixed-digits-argument': 0,
        'no-useless-call': 0,
        'promise/spec-only': 0,
        'unicorn/no-thenable': 0,
        'unicorn/no-useless-promise-resolve-reject': 0,
        'promise/param-names': 0,
        'regexp/no-legacy-features': 0,
        'regexp/match-any': 0,
        'regexp/no-empty-group': 0,
        'no-shadow-restricted-names': 0,
        'no-empty': 0,
        'no-void': 0,
        'no-unreachable-loop': 0,
        'no-return-assign': 0,
        'no-multi-assign': 0,
        'unicorn/no-unnecessary-await': 0,
        'no-sequences': 0,
        'no-func-assign': 0,
        'import/no-absolute-path': 0,
        'sonarjs/no-inverted-boolean-check': 0,
        'no-extra-boolean-cast': 0,
        'no-unsafe-optional-chaining': 0,
        'unicorn/no-useless-spread': 0,
        'regexp/no-octal': 0,
        'regexp/no-potentially-useless-backreference': 0,
        'regexp/no-useless-backreference': 0,
        'regexp/no-contradiction-with-assertion': 0,
        'regexp/unicode-property': 0,
        'regexp/prefer-character-class': 0,
        'regexp/no-useless-lazy': 0,
        'regexp/no-optional-assertion': 0,
        'regexp/no-useless-assertions': 0,
        'regexp/no-useless-escape': 0,
        'regexp/no-invalid-regexp': 0,
        'regexp/no-misleading-capturing-group': 0,
        'regexp/no-dupe-characters-character-class': 0,
        'regexp/no-misleading-unicode-character': 0,
        'no-misleading-character-class': 0,
        'regexp/no-dupe-disjunctions': 0,
        'regexp/no-useless-character-class': 0,
        'regexp/no-standalone-backslash': 0,
        'promise/no-multiple-resolved': 0,
        'no-ex-assign': 0,
        'sonarjs/no-duplicated-branches': 0,
        'default-case-last': 0,
        'unicorn/no-useless-switch-case': 0,
        'no-import-assign': 0,
        'unicorn/prefer-export-from': 0, // TODO? test/mdn/javascript/reference/statements/export/index.md
        'no-debugger': 0,
        'no-class-assign': 0,
        'unicorn/template-indent': 0,
        'unicorn/prefer-dom-node-dataset': 0,
        'unicorn/numeric-separators-style': 0,
        'unicorn/prefer-set-has': 0,
        'sonarjs/no-redundant-jump': 0,
        'unicorn/prefer-blob-reading-methods': 0,
        'sonarjs/no-use-of-empty-return-value': 0,
        'unicorn/prefer-array-flat-map': 0,
        'unicorn/prefer-modern-math-apis': 0,
        'unicorn/prefer-dom-node-remove': 0,
        'unicorn/prefer-keyboard-event-key': 0,
        'no-unneeded-ternary': 0,
        'unicorn/prefer-modern-dom-apis': 0,
        'unicorn/prefer-logical-operator-over-ternary': 0,
        'no-const-assign': 0,
        'unicorn/prefer-switch': 0,
        'promise/valid-params': 0,
        'unicorn/no-invalid-fetch-options': 0, // ✅
        'unicorn/prefer-array-some': 0, // ✅
        'no-lonely-if': 0,
        'unicorn/no-lonely-if': 0,
        'sonarjs/no-collapsible-if': 0,
        'no-undef-init': 0, // TODO? test/mdn/api/usbendpoint/index.md
        'unicorn/prefer-set-size': 0, // ✅
        'sonarjs/no-empty-collection': 0,
        'disable-autofix/unicorn/consistent-existence-index-check': 0,
        'unicorn/text-encoding-identifier-case': 0,
        'regexp/negation': 0,
        'regexp/prefer-w': 0,
        'node/no-path-concat': 0, // test/mdn/api/webrtc_api/build_a_phone_with_peerjs/build_the_server/index.md
        'valid-typeof': 0, // ✅ test/mdn/api/xrlayerevent/layer/index.md
        'no-implied-eval': 0,
        'prefer-object-spread': 0,
        'prefer-object-has-own': 0,
        'promise/no-callback-in-promise': 0,
        'no-cond-assign': 0,
        'node/exports-style': 0,
        'unicorn/prefer-event-target': 0,
        '@typescript-eslint/consistent-type-definitions': 0,
        '@typescript-eslint/no-shadow': 0,
        '@typescript-eslint/consistent-type-imports': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        'vue/valid-template-root': 0,
        'vue/no-empty-component-block': 0,
        'unicorn/import-style': 0,
        // vue-docs
        '@typescript-eslint/method-signature-style': 0,
        '@typescript-eslint/consistent-indexed-object-style': 0,
        '@typescript-eslint/no-invalid-void-type': 0,
        '@typescript-eslint/prefer-function-type': 0,
        'vue/v-bind-style': 0,
        'vue/v-on-style': 0,
        'vue/define-macros-order': 0,
        '@typescript-eslint/array-type': 0,
        'vue/padding-line-between-blocks': 0,
        'vue/no-deprecated-destroyed-lifecycle': 0,
        'vue/define-emits-declaration': 0,
        'vue/return-in-emits-validator': 0,
        'vue/no-setup-props-reactivity-loss': 0,
        'vue/valid-define-props': 0,
        'vue/attributes-order': 0,
        'vue/require-v-for-key': 0,
        'vue/no-ref-object-reactivity-loss': 0,
        'no-irregular-whitespace': 0,
        // nuxt-docs
        'vue/require-default-export': 0,
        'vue/prefer-template': 0,
        'vue/first-attribute-linebreak': 0,
        'vue/require-direct-export': 0,
        'node/prefer-global/buffer': 0,
        '@typescript-eslint/consistent-type-assertions': 0,
        'vue/no-potential-component-option-typo': 0,
        'unicorn/no-abusive-eslint-disable': 0,
        '@eslint-community/eslint-comments/no-unlimited-disable': 0,
        'sonarjs/no-identical-functions': 0,
        'no-useless-escape': 0,
        'no-script-url': 0,
        '@typescript-eslint/no-empty-object-type': 0,
        '@typescript-eslint/no-useless-empty-export': 0,
        'import/no-deprecated': 0,
        '@typescript-eslint/unified-signatures': 0,
        // github-docs
        'yml/indent': 0,
        'yml/spaced-comment': 0,
        'yml/no-empty-document': 0,
        'yml/quotes': 0,
        'yml/plain-scalar': 0,
        'yml/no-empty-mapping-value': 0,
        'yml/file-extension': 0,
        'yml/block-mapping-colon-indicator-newline': 0,
        'yml/flow-sequence-bracket-spacing': 0,
        'yml/key-spacing': 0,
        'yml/no-multiple-empty-lines': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
        '': 0,
      },
    },
  },
});
