---
'eslint-config-un': minor
---

[**BREAKING**] betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v3.8.0 to v4.0.1](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v3.8.0...v4.0.1):

- ❓ enabled [`enforce-canonical-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-canonical-classes.md) if resolved Tailwind version is >=4 and added it to the `noStylisticRules` config
  - disabled [`enforce-consistent-important-position`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-consistent-important-position.md), [`enforce-consistent-variable-syntax`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-consistent-variable-syntax.md) and [`enforce-shorthand-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-shorthand-classes.md) for Tailwind >=4
- 🔄 `no-unregistered-classes` was renamed to [`no-unknown-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/no-unknown-classes.md)