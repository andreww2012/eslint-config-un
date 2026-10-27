---
"eslint-config-un": minor
---

packageJson: updated [`eslint-plugin-package-json` from v1.10.1 to v1.12.0](https://github.com/michaelfaith/eslint-plugin-package-json/compare/v1.10.1...v1.12.0):

- 🟢 enabled [`package-json/consistent-property-aliases`](https://eslint-plugin-package-json.dev/rules/consistent-property-aliases) rule
- ❓ enabled conditionally [`package-json/consistent-package-manager-declaration`](https://eslint-plugin-package-json.dev/rules/consistent-package-manager-declaration) rule, which enforces `devEngines` if the detected package manager supports `devEngines.packageManager`, and added the `packageManagerDeclaration` option to choose the field or disable the rule