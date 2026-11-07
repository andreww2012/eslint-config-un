---
"eslint-config-un": patch
---

playwright: the config is now enabled by default only if `@playwright/test` is installed, not just the `playwright` library (used by Vitest browser mode, for example, and therefore producing false positives)
