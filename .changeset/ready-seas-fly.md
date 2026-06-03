---
'eslint-config-un': minor
---

Added a new root option `typeInfoRules`, which completely replaced `preventCreationOfConfigForRulesWithTypeInformation`. It allows to:

- Precisely control how rules requiring type information are handled;
- Specify which files should not request type information;
- Configure `typescript-eslint` parser, namely its most useful option `allowDefaultProject` or all `parserOptions`.
