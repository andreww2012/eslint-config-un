---
'eslint-config-un': minor
---

Our own `un/no-typeof-like-comparisons` rule now tracks detached `typeof` assignments, and does not flag the comparisons with variables holding such assignments:

```ts
const type = typeof value;

// Not flagged anymore:
if (type === 'number' || type === 'string') {
  /* ... */
}
```