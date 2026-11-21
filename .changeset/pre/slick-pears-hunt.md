---
"eslint-config-un": patch
---

markdown: stopped reporting unused `eslint-disable` directives in the text of Markdown files whose code blocks are linted, so `--fix` no longer removes the directives that code blocks need; unused directives in the blocks are still reported