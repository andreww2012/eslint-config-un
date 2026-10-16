---
"eslint-config-un": minor
---

noPrettierIncompatibleRules, vue, format: `oxfmt` package is now detected and treated like Prettier. The `noPrettierIncompatibleRules` config gets enabled (TOML rules included), [`vue/html-self-closing`](https://eslint.vuejs.org/rules/html-self-closing.html) allows self-closing void elements, and the `format` config uses `oxfmt` by default unless `prettier` is installed