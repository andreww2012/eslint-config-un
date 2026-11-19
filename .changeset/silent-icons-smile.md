---
"eslint-config-un": patch
---

Fixed the plugins passed in `extraPlugins` not being loaded in `loadPluginsOnDemand: false` mode even when their rules are used
