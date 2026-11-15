---
"eslint-config-un": patch
---

mdx: updated [`eslint-mdx` from v3.9.4 to v3.10.1](https://github.com/mdx-js/eslint-mdx/compare/eslint-mdx@3.9.4...eslint-mdx@3.10.1) and [`eslint-plugin-mdx` from v3.9.4 to v3.10.1](https://github.com/mdx-js/eslint-mdx/compare/eslint-plugin-mdx@3.9.4...eslint-plugin-mdx@3.10.1):

- 🔴 not enabled the [native versions of `remark-lint` rules](https://github.com/mdx-js/eslint-mdx/blob/HEAD/docs/native-remark-rules.md), as they ignore the severities set in the remark config, still report when turned off there with `[0]` or `'off'`, and misread options in the `[severity, value]` form. [`mdx/remark`](https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md#mdxremark) keeps running these rules