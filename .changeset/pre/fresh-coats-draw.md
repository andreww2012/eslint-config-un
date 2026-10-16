---
"eslint-config-un": minor
---

[**BREAKING**] ts, un: `noTypeAssertion` Sub-config was removed along with `eslint-plugin-no-type-assertion`. Instead, our own `un/no-type-assertion` rule was added, off by default, which unlike the old rule ignores non-null assertions, allows `satisfies T as T` and Vue's `as PropType<T>`, and has `allowedTypes` and `allowWidening` options