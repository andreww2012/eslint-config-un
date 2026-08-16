---
'eslint-config-un': patch
---

Previously, when the rule was disabled by us, a separate ESLint rule entry was created to disable `disable-autofix/` counterpart rule. Now it's only disabled when the original rule supports autofixes