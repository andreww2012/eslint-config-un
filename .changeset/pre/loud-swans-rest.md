---
"eslint-config-un": minor
---

markdown, mdx: ⚙️ `markdown/codeBlocks` and ⚙️ `mdx/codeBlocks` sub-configs now also apply to nested Markdown code blocks (`md`, `mdx`), and 20 rules that misjudge a part of a document or what an example shows on purpose are now disabled in code blocks

<details>
<summary>Rules now disabled in embedded code blocks (20)</summary>

- [`markdown/fenced-code-meta`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/fenced-code-meta.md)
- [`markdown/heading-increment`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/heading-increment.md)
- [`markdown/no-bare-urls`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-bare-urls.md)
- [`markdown/no-duplicate-headings`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-duplicate-headings.md)
- [`markdown/no-html`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-html.md)
- [`markdown/no-missing-label-refs`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-label-refs.md)
- [`markdown/no-missing-link-fragments`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-link-fragments.md)
- [`markdown/no-multiple-h1`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-multiple-h1.md)
- [`markdown/no-unused-definitions`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-unused-definitions.md)
- [`markdown/require-alt-text`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/require-alt-text.md)
- [`markdown-links/no-dead-urls`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html)
- [`markdown-links/no-missing-fragments`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-fragments.html)
- [`markdown-links/no-missing-path`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-path.html)
- [`markdown-preferences/definitions-last`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/definitions-last.html)
- [`markdown-preferences/prefer-autolinks`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-autolinks.html) <!-- cspell:disable-line -->
- [`markdown-preferences/prefer-fenced-code-blocks`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-fenced-code-blocks.html)
- [`markdown-preferences/prefer-inline-code-words`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-inline-code-words.html)
- [`markdown-preferences/prefer-linked-words`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html)
- [`unicorn/no-missing-local-resource`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-missing-local-resource.md)
- [`unicorn/require-frontmatter-fields`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/require-frontmatter-fields.md)

</details>
