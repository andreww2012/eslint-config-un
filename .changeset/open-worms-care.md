---
'eslint-config-un': patch
---

Disabled [`import/no-cycle` rule](https://github.com/un-ts/eslint-plugin-import-x/blob/v4.17.1/docs/rules/no-cycle.md) by default. It has always been one of the slowest rules among really all rules - and can now be replaced by [knip's `cycles` check](https://knip.dev/reference/issue-types): `knip --no-progress --cycles --reporter cycles`. You can ignore cycles by setting [`cycles.allow`](https://knip.dev/reference/configuration#cycles) in the knip config file