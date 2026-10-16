---
"eslint-config-un": minor
---

[**BREAKING**] format, markdown, mdx: formatting rules are now built in instead of coming from `eslint-plugin-format`, so only the chosen formatter needs to be installed, and `format/prettier` now reads the Prettier config. `markdown/formatFencedCodeBlocks` and `mdx/formatFencedCodeBlocks` were replaced by the new `format/fencedCodeBlocks` Sub-config, disabled by default