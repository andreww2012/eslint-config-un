---
'eslint-config-un': patch
---

[**BREAKING**] markdownPreferences: option `extendedMarkdownSyntax` is now set to `false` by default because

- It was causing all Markdown files parsed with `extended-syntax` language, likely overriding the language set in `markdown` config;
- The extension supported by the plugin are not widely used.

Now, if this option is enabled, ESLint config(s) produced by `markdownPreferences` plugin will be put after config(s) produced by `markdown` config, essentially overriding matching files' language. If this option is disabled, it will be put before `markdown` and therefore `markdown` config(s) will take precedence.