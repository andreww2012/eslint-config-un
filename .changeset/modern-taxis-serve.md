---
'eslint-config-un': patch
---

markdownPreferences: fixed a bug where `enforceCasing` option was not working as expected if `null` is passed.
Instead you should now use `false`.
