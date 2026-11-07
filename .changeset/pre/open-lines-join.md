---
"eslint-config-un": minor
---

ember: the plugin's shared settings can now be provided via the `plugins.ember.settings` root option, where `version` sets the Ember version the rules and the parser assume instead of the installed `ember-source` one (the parser gets it as its `emberSourceVersion` option)