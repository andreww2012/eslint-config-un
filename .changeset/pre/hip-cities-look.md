---
'eslint-config-un': minor
---

[**BREAKING**] css: `customSyntax` option now supports object and function form. Previously, the object form was shallow-merged with the custom syntax implicitly set by us (to support TailwindCSS). Now, it fully take precedence; if one needs to merge it, use the function form which receives "our" syntax as a parameter
