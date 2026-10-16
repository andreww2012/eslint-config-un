---
"eslint-config-un": patch
---

unicorn: disabled [`unicorn/prefer-dispose`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-dispose.md) and [`unicorn/prefer-uint8array-base64`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-uint8array-base64.md) rules until `using` and `Uint8Array#toBase64()` are Baseline widely available, like the other rules suggesting such features