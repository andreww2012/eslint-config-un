---
'eslint-config-un': minor
---

Now, unless `ts/setupTypeAware` config is enabled or a new `preventCreationOfConfigForRulesWithTypeInformation` option set to `true`, rules which are known to require type information will be moved to a separate config with the `typescript-eslint` parser
