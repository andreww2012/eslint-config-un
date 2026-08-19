---
"eslint-config-un": minor
---

[**BREAKING**] import: added a new option `extraneousDependenciesCheck` that replaces `allowDevDependencies` and `extraneousDependenciesWhitelist` and provides a better control of the [`import/no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md) rule options. Additionally, when `mode` root option set to `lib`, all `files` from the `tests` config combined with the patterns targeting config files will not be considered library code and therefore allowed to import modules listed in `devDependencies`; this stops flagging `vitest` imports, for example