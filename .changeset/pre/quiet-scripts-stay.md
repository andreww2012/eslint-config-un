---
"eslint-config-un": patch
---

jsInline: updated [`eslint-plugin-html` from v8.2.0 to v8.2.1](https://github.com/BenoitZugmeyer/eslint-plugin-html/compare/v8.2.0...v8.2.1), which fixes ESLint v10.11.0+ compatibility, so our patch is dropped. It stays inlined, as otherwise it silently skips `<script>` tags under Yarn Plug'n'Play