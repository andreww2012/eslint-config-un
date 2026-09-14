---
'eslint-config-un': patch
---

js, ts: core rules misfiring on TypeScript syntax or duplicating the TypeScript compiler, like [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars) and [`no-undef`](https://eslint.org/docs/latest/rules/no-undef), are now disabled in TypeScript files even when the `ts` config doesn't lint them. Base rules of type-aware extension rules, like [`require-await`](https://eslint.org/docs/latest/rules/require-await), are now disabled only where their `ts/*` replacements are enabled