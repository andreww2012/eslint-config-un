---
'eslint-config-un': minor
---

un: added a new rule `un/no-empty-object-ternary-spread` that disallows spreading a conditional expression where one branch is an empty object literal, enabled by default:

- `...(condition ? {foo: 'bar'} : {})` -> `...(condition && {foo: 'bar})`
- `...(condition ? {} : {foo: 'bar'})` -> `...(!condition && {foo: 'bar})`
