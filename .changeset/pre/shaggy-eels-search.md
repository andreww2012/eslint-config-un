---
"eslint-config-un": patch
---

[**BREAKING**] sonar: moved to `misc-enabled` configs and [`eslint-plugin-sonarjs`](https://npmx.dev/eslint-plugin-sonarjs) to optional peer dependencies, because it depends on `typescript`, which was enabling the `ts` config in projects not having it installed