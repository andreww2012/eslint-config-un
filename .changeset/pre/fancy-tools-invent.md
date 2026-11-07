---
"eslint-config-un": patch
---

js: `.js` files are now treated like `.cjs` ones when the `package.json` closest to the working directory has no `"type": "module"`, so [`strict`](https://eslint.org/docs/latest/rules/strict) rule no longer removes their `'use strict'`
