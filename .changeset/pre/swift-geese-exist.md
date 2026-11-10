---
'eslint-config-un': patch
---

import: fixed ESLint crash caused by invalid [`import/extensions`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/extensions.md) rule options when `requireModuleExtensions` option is enabled; per-extension values in its object form, which were ignored before, now apply
