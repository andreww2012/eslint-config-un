---
"eslint-config-un": patch
---

markdown: stopped reporting unused `eslint-disable` directives in the text of Markdown files whose code blocks are linted, where each directive comment before a block was reported and removed by `--fix`, even if the block needed it; unused directives in the blocks are still reported