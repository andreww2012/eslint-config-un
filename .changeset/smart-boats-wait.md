---
"eslint-config-un": patch
---

The `ignores` of a rule entry are now added to the `ignores` of its Config instead of replacing them, so the rule no longer runs on the files the Config ignores, like Markdown or JSON files
