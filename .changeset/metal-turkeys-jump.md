---
'eslint-config-un': minor
---

unicorn: updated [`eslint-plugin-unicorn` from v74.0.0 to v75.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v74.0.0...v75.0.0):

- The following rules were 🟢 enabled:
  - [`unicorn/no-async-iterator-callback`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-async-iterator-callback.md)
  - [`unicorn/no-unused-builtin-method-return`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unused-builtin-method-return.md)
  - [`unicorn/no-unused-iterator-helper`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unused-iterator-helper.md)
  - [`unicorn/no-using-resource-escape`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-using-resource-escape.md)
  - [`unicorn/prefer-temporal-conversion`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-temporal-conversion.md)
- 🟢 enabled [`unicorn/no-useless-set-construction`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-set-construction.md) rule and added it to the `noStylisticRules` config
- The following rules were 🟢 enabled in ⚙️ `css` sub-config:
  - [`unicorn/no-deprecated-css-features`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-deprecated-css-features.md)
  - [`unicorn/no-duplicate-css-selectors`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-duplicate-css-selectors.md)
  - [`unicorn/no-duplicate-font-family-names`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-duplicate-font-family-names.md)
  - [`unicorn/no-invalid-media-features`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-invalid-media-features.md)
  - [`unicorn/no-nesting-with-mixed-specificity`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-nesting-with-mixed-specificity.md)
  - [`unicorn/no-unknown-css-annotations`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unknown-css-annotations.md)
  - [`unicorn/no-unknown-pseudo-selectors`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unknown-pseudo-selectors.md)
  - [`unicorn/no-unscoped-css-nesting-selector`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unscoped-css-nesting-selector.md)
- The following rules were 🟢 enabled in ⚙️ `css` sub-config and added to the `noStylisticRules` config:
  - [`unicorn/no-redundant-nested-style-rules`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-redundant-nested-style-rules.md)
  - [`unicorn/prefer-media-feature-range-syntax`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-media-feature-range-syntax.md)
- The following rules were 🔴 not enabled:
  - [`unicorn/prefer-iterator-zip`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-iterator-zip.md)
  - [`unicorn/prefer-json-import`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-json-import.md)
  - [`unicorn/prefer-uint8array-hex`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-uint8array-hex.md)
- 🔴 not enabled [`unicorn/prefer-combined-guards`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-combined-guards.md) rule, but added it to the `noStylisticRules` config
- ⚠️ [`unicorn/no-unused-array-method-return`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v74.0.0/docs/rules/no-unused-array-method-return.md) rule was disabled because it got deprecated
- [`unicorn/prefer-early-return`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-early-return.md) rule now uses the `checkShortBodies` option, so it also reports a bare `return;` guard followed by a single statement
- [`unicorn/prefer-ternary`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-ternary.md) rule now uses the `only-single-line` option, so it no longer reports `if` statements that would become a multi-line ternary