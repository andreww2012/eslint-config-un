---
'eslint-config-un': minor
---

nodeDependencies: fixed `enforceAbsoluteVersion: true` not enforcing absolute versions on `dependencies`, contrary to its documentation. Also added an `'always'` value, which additionally covers `peerDependencies` and `optionalDependencies`