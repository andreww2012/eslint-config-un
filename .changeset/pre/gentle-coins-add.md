---
'eslint-config-un': patch
---

ts: disabled [`ts/switch-exhaustiveness-check` rule](https://typescript-eslint.io/rules/switch-exhaustiveness-check) because oftentimes it's not possible to declare all union members, so the rule gets suppressed. To substitute the rule, put `<expression in switch statement> satisfies never` in the `default` clause.