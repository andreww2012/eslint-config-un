---
'eslint-config-un': minor
---

un: added a new rule `un/no-distributive-never-check` that reports checking type parameters against `never`: `type IsNever<T> = T extends never ? true : false`.
This is almost never what you want because conditional types are distributive in regards to a type parameter and are checking its union members one by one, but `never` is a union of zero members, which leads to the whole conditional resolving to the unexpected third value - neither `true` nor `false` - `never`.