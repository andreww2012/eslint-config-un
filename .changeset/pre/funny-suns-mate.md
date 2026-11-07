---
"eslint-config-un": patch
---

nodeDependencies: set [`node-dependencies/compat-engines`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/compat-engines.html) severity to *error* and set [the `deep` option](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/compat-engines.html#options) to `false`, because usually the transitive dependencies' incompatibility is:

- not the user's fault;
- not a big deal;
- hard to fix.