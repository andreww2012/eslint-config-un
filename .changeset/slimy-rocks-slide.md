---
"eslint-config-un": patch
---

noPrettierIncompatibleRules: stopped disabling the following rules when the Config is on because most of time they don't conflict with Prettier formatting:

- [`markdown-preferences/table-leading-trailing-pipes`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-leading-trailing-pipes.html)
- [`markdown-preferences/table-pipe-alignment`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-pipe-alignment.html)
- [`markdown-preferences/table-pipe-spacing`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-pipe-spacing.html)