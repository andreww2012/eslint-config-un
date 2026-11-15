---
"eslint-config-un": patch
---

stylistic: updated [`@stylistic/eslint-plugin` from v5.10.0 to v6.0.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v5.10.0...v6.0.0):

- 🔴 not enabled the following rules, as the `shorthandBoolean` and `shorthandFragment` options of the `react` config already control the same checks:
  - [`stylistic/jsx-shorthand-boolean`](https://eslint.style/rules/jsx-shorthand-boolean)
  - [`stylistic/jsx-shorthand-fragment`](https://eslint.style/rules/jsx-shorthand-fragment)
- ❌ the following rules were removed:
  - [`stylistic/jsx-indent`](https://github.com/eslint-stylistic/eslint-stylistic/blob/v5.10.0/packages/eslint-plugin/rules/jsx-indent/README.md)
  - [`stylistic/jsx-props-no-multi-spaces`](https://github.com/eslint-stylistic/eslint-stylistic/blob/v5.10.0/packages/eslint-plugin/rules/jsx-props-no-multi-spaces/README.md)
  - [`stylistic/jsx-sort-props`](https://github.com/eslint-stylistic/eslint-stylistic/blob/v5.10.0/packages/eslint-plugin/rules/jsx-sort-props/README.md)
- ⚠️ the following rules got deprecated in favor of [`stylistic/list-style`](https://eslint.style/rules/list-style), so they are no longer listed in the `stylistic` config, where all of them were disabled:
  - [`stylistic/array-bracket-newline`](https://eslint.style/rules/array-bracket-newline)
  - [`stylistic/array-bracket-spacing`](https://eslint.style/rules/array-bracket-spacing)
  - [`stylistic/array-element-newline`](https://eslint.style/rules/array-element-newline)
  - [`stylistic/function-call-argument-newline`](https://eslint.style/rules/function-call-argument-newline)
  - [`stylistic/function-paren-newline`](https://eslint.style/rules/function-paren-newline)
  - [`stylistic/object-curly-newline`](https://eslint.style/rules/object-curly-newline)
  - [`stylistic/object-curly-spacing`](https://eslint.style/rules/object-curly-spacing)
  - [`stylistic/object-property-newline`](https://eslint.style/rules/object-property-newline)
- 🔄 `stylistic/exp-list-style` was renamed to [`stylistic/list-style`](https://eslint.style/rules/list-style), which the `civet` config now disables in the compiled code