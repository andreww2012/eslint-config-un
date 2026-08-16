---
'eslint-config-un': minor
---

lockfile: updated [`eslint-plugin-lockfile` from v1.3.0 to v2.1.0](https://github.com/ljharb/lockfile-tools/compare/eslint-plugin-lockfile@1.3.0...eslint-plugin-lockfile@2.1.0):

- New rules:
  - 🟢 enabled [`lockfile/manifest-sync`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/manifest-sync.md) rule
  - 🔴 not enabled [`lockfile/minimum-release-age`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/minimum-release-age.md) rule; added to the list of rules disabled in Offline mode
  - 🟢 enabled [`lockfile/name-matches-resolved`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/name-matches-resolved.md) rule
  - 🟢 enabled [`lockfile/no-install-scripts`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/no-install-scripts.md) rule
- Added a new sub config ⚙️ `packageJson` targeting `package.json` files with the following new rules:
  - 🟢 enabled [`lockfile/no-weakening-config`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/no-weakening-config.md) rule
  - 🟢 enabled [`lockfile/tracked`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/tracked.md) rule