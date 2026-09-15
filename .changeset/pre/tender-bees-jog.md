---
'eslint-config-un': patch
---

Fixed an incorrect mapping of the graphql's `requireSeparateFilesFor` option to [`graphql/lone-executable-definition`](https://the-guild.dev/graphql/eslint/rules/lone-executable-definition) rule `ignore` option. The option docs now also warn that all 4 values cannot be set to `false`