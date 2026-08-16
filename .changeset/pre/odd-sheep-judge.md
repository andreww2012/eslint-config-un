---
'eslint-config-un': minor
---

betterTailwind: `settings` option is now not required. Previously, despite being non-optional, it ended up being undefined anyway when the config was enabled implicitly. However, if it's not specified, a runtime warning is printed calling to specify it, now also for Tailwind 3
