---
'eslint-config-un': minor
---

boundaries: `settings` option is now not required. Previously, despite being non-optional, it ended up being undefined anyway when the config was enabled implicitly. However, if it's not specified, a runtime warning is now printed calling to specify it