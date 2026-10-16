---
"eslint-config-un": patch
---

mdx: [`mdx/remark`](https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md#mdxremark) reports are now readable in the files excluded from ⚙️ `mdx/codeBlocks` sub-config, and the function form of its `files` returning an empty array now stops code blocks from being linted. Like other sub-configs, it is no longer disabled by the empty `files` of the parent config
