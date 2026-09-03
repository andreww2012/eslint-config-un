---
"eslint-config-un": patch
---

[**BREAKING**] `plugin{Renames,Overrides}` root options have been replaced with `plugins.<pluginPrefix>.{prefix,plugin}`, where `plugins` is a new root option which accepts an object, which keys are plugin prefixes and values is an object to which the renaming and overriding functionality has moved. Additionally, all `settings` config options have been removed in favor of providing plugin settings via `plugins.<pluginPrefix>.settings`
