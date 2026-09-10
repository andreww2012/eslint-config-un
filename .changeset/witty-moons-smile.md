---
'eslint-config-un': minor
---

unicorn: added `unicorn/inline-js` eslint config, created when the `jsInline` config is enabled, which disables [`unicorn/no-empty-file`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-empty-file.md) on HTML files: every `<script>` block of such a file is linted as a separate file, so an empty one was reported as an empty file