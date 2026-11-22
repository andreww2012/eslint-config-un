---
"eslint-config-un": patch
---

nodeDependencies: stopped [`node-dependencies/compat-engines`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/compat-engines) from checking `devDependencies`. The rule only knows about `engines`, which is meant for package consumers. `devEngines` is the right field to check the engines againts for dev dependencies, and it's not supported yet by this plugin