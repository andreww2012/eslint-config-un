---
"eslint-config-un": minor
---

css: updated [`eslint-cssicorn` from v0.1.0 to v0.2.0](https://github.com/sindresorhus/eslint-cssicorn/compare/v0.1.0...v0.2.0):

- 🟢 enabled the following new rules in ⚙️ `unicorn` sub-config:
  - [`cssicorn/consistent-compound-selector-order`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/consistent-compound-selector-order.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/consistent-layer-order`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/consistent-layer-order.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/consistent-property-order`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/consistent-property-order.md) (see the new `propertyOrder` option below)
  - [`cssicorn/consistent-value-order`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/consistent-value-order.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/no-clamped-values`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-clamped-values.md)
  - [`cssicorn/no-disabled-pinch-zoom`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-disabled-pinch-zoom.md)
  - [`cssicorn/no-duplicate-at-rule-definitions`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-duplicate-at-rule-definitions.md)
  - [`cssicorn/no-ineffective-keyframe-declarations`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-ineffective-keyframe-declarations.md)
  - [`cssicorn/no-ineffective-overrides`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-ineffective-overrides.md)
  - [`cssicorn/no-ineffective-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-ineffective-properties.md)
  - [`cssicorn/no-ineffective-selector-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-ineffective-selector-properties.md)
  - [`cssicorn/no-ineffective-supports-conditions`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-ineffective-supports-conditions.md)
  - [`cssicorn/no-ineffective-transitions`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-ineffective-transitions.md)
  - [`cssicorn/no-invalid-property-references`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-invalid-property-references.md)
  - [`cssicorn/no-overflow-axis-coercion`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-overflow-axis-coercion.md)
  - [`cssicorn/no-redundant-functions`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-redundant-functions.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/no-redundant-nesting-selector`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-redundant-nesting-selector.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/no-useless-is`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-useless-is.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/prefer-aspect-ratio`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-aspect-ratio.md)
  - [`cssicorn/prefer-clamp`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-clamp.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/prefer-current-color`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-current-color.md)
  - [`cssicorn/prefer-individual-transform-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-individual-transform-properties.md)
  - [`cssicorn/prefer-merged-rules`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-merged-rules.md) (added it to the `noStylisticRules` config)
  - [`cssicorn/prefer-nesting`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-nesting.md) (added it to the `noStylisticRules` config)
- ❓ enabled [`cssicorn/prefer-light-dark`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-light-dark.md) and [`cssicorn/prefer-relative-colors`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-relative-colors.md) rules if the `baselineAvailability` root option allows newly available features (`newly` or a year from 2024)
- [`cssicorn/prefer-aspect-ratio`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-aspect-ratio.md), [`cssicorn/prefer-clamp`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-clamp.md), [`cssicorn/prefer-explicit-viewport-units`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-explicit-viewport-units.md), [`cssicorn/prefer-individual-transform-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-individual-transform-properties.md), [`cssicorn/prefer-media-feature-range-syntax`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-media-feature-range-syntax.md) and [`cssicorn/prefer-nesting`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-nesting.md) rules are turned off if `baselineAvailability` is set to a year before the CSS feature they suggest became newly available
- ❓ enabled [`cssicorn/prefer-existing-custom-properties`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/prefer-existing-custom-properties.md) rule (warning) if the new `customProperties` option of ⚙️ `unicorn` sub-config is not empty
- 🔴 not enabled the following new rules in ⚙️ `unicorn` sub-config:
  - [`cssicorn/no-layout-animations`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/no-layout-animations.md)
  - [`cssicorn/require-prefers-reduced-motion`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/require-prefers-reduced-motion.md)
  - [`cssicorn/require-selector-scope`](https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/require-selector-scope.md)
- New `propertyOrder` option of ⚙️ `unicorn` sub-config sets the property order: `concentric-css` (default), `recess` (from [`stylelint-config-recess-order`](https://npmx.dev/stylelint-config-recess-order)), `clean` (from [`stylelint-config-clean-order`](https://npmx.dev/stylelint-config-clean-order)), `alphabetical` or a custom list; `false` disables the check