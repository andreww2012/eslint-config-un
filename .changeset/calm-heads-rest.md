---
"eslint-config-un": patch
---

[**BREAKING**] markdownPreferences: `enforceCasing` option now defaults to `false` because [`markdown-preferences/heading-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html) and [`markdown-preferences/table-header-casing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html) rules usually produce many false positives. Set it to `true` to enforce sentence case like before