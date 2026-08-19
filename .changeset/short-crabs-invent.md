---
"eslint-config-un": patch
---

security: disabled `security/detect-unsafe-regex` because of high number of false positives. We recommend using rules from the [`eslint-plugin-regexp` plugin](https://ota-meshi.github.io/eslint-plugin-regexp) instead (the `regexp` config)