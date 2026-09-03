---
"eslint-config-un": minor
---

[**BREAKING**] Added a new root option `parsing` which is now a single place that controls how non-JS languages are parsed. Following that, these sub-configs have been removed:

- `astro/setup`
- `ripple/setup`
- `svelte/setup`
- `ts/setup`
- `ts/typeAware/setup`

Additionally, `format.usePlainParser` now requires the config to specify `files` and warns when it does not. It previously worked without them only because the parser was assigned at the `format` config's position and every later parser overrode it; parsers are now assigned after all the Configs, so an unscoped `eslint-parser-plain` would parse the whole project as plain text.