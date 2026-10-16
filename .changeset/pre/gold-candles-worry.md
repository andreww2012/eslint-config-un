---
"eslint-config-un": patch
---

jsInline: JS inside `<script>` tags in HTML files is linted again when autofix is disabled for any `html` rule, which is the case by default since [`html/head-order`](https://html-eslint.org/docs/rules/head-order) autofix is now disabled
