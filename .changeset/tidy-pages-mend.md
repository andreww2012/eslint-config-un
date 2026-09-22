---
"eslint-config-un": patch
---

jsInline: fixed linting HTML files crashing with `TypeError: Cannot read private member #ruleDefinitions` on ESLint v10.11.0+. `eslint-plugin-html` is now inlined into the package with a patch until [it is fixed upstream](https://github.com/BenoitZugmeyer/eslint-plugin-html/issues/342)