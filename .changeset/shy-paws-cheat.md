---
'eslint-config-un': minor
---

ts: introduced `setup` and `typeAware/setup` sub-configs, allowing separately configuring on which files `typescript-eslint` plugin will be operating. These configs do not inherit `files` and `ignores` from their parents, but `typeAware/setup` config do inherit `files` and `ignores` from `setup` sub-config, unless the respective property is specified or `typeAware` config is disabled.
