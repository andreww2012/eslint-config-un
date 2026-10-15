---
"eslint-config-un": minor
---

markdown: added a new sub-config `changesets` which turns off the following rules misjudging changesets in `.changeset/**/*.md` files, ❓ enabled if `@changesets/cli` package is installed:

- [`markdown/no-missing-link-fragments`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-link-fragments.md)
- [`markdown-links/no-missing-fragments`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-fragments.html)
- [`markdown-links/no-missing-path`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-missing-path.html)
- [`markdown-preferences/max-len`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/max-len.html)
- [`markdown-preferences/prefer-link-reference-definitions`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-link-reference-definitions.html)
- [`unicorn/no-missing-local-resource`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-missing-local-resource.md)
- [`unicorn/require-frontmatter-fields`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/require-frontmatter-fields.md)