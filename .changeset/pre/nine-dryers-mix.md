---
"eslint-config-un": minor
---

un: added our own `un/prefer-array-for-each` rule, off by default, which reports `for` and `for...of` loops that `Array#forEach` can replace without a change in behavior