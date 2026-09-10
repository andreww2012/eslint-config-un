---
"eslint-config-un": minor
---

[**BREAKING**] betterTailwind: removed the `cssLinting` option in favor of the new `configCss` sub-config, which lints CSS files in a dedicated ESLint config instead of appending the `files` of the `css` config to the parent ones. Specifying `files` of the parent config now disables it unless `configCss` is set explicitly.