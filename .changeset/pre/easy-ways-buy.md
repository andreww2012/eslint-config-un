---
"eslint-config-un": minor
---

[**BREAKING**] htmlScripts: the `jsInline` config was renamed to `htmlScripts`, `eslint-plugin-html` was replaced by the built-in `html-scripts` plugin, and its `html-processor` plugin settings by the `indent`, `reportBadIndent`, `scriptTags` and `xmlExtensions` options. Each `<script>` tag is now linted as a virtual JS file, matched by `GLOB_HTML_SCRIPTS` rather than HTML file globs, by every config linting JS files except `node`, `format` and `checkFile`, and classic scripts (the ones without `type="module"`) are parsed as scripts sharing their global variables
