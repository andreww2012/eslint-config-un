---
'eslint-config-un': patch
---

markdown, mdx: the following rules are now disabled in embedded code blocks:

- `sonarjs/content-length`
- `sonarjs/cors`
- `sonarjs/file-uploads`
- `sonarjs/no-session-cookies-on-static-assets`
- `sonarjs/production-debug`
- `sonarjs/session-regeneration`
- `sonarjs/x-powered-by`
- [`unicorn/no-top-level-side-effects`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-top-level-side-effects.md)