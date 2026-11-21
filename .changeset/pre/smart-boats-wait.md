---
"eslint-config-un": patch
---

Fixed the `ignores` of a rule entry replacing the `ignores` of its Config instead of adding to them, which made the rule run on the files the Config ignores, like Markdown or JSON files
