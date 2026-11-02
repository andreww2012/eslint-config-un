---
"eslint-config-un": patch
---

import: [`import/default`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/default.md) and [`import/namespace`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/namespace.md) rules are now disabled when the `ts` config is enabled, like [`import/named`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/named.md) already was, as TypeScript checks the same better and the rules are slow
