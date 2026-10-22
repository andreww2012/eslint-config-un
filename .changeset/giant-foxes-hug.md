---
"eslint-config-un": patch
---

[**BREAKING**] vitest: `vitestGlobalsImporting` option now defaults to `enforce` to match Vitest, which requires importing globals unless its [`globals`](https://vitest.dev/config/globals) option is on. Set it to `disallow` to keep the previous behavior
