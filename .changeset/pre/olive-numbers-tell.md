---
"eslint-config-un": patch
---

Generating the config no longer loads all the rules of `typescript-eslint` (which loads them on demand) and all ESLint core rules, so ESLint starts a bit faster
