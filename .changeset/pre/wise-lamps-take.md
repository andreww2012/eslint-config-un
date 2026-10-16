---
"eslint-config-un": patch
---

js, stylistic, ts: the function form of `files` returning an empty array no longer leaves [`stylistic/spaced-comment`](https://eslint.style/rules/spaced-comment) on for every file in js and stylistic configs, or the type-aware rules on for every file in ⚙️ `ts/typeAware` sub-config
