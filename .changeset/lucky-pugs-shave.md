---
'eslint-config-un': minor
---

The following configs no longer ignore HTML files, so their rules now also lint the JavaScript inside `<script>` tags (requires the `jsInline` config to be enabled):

- `arrowReturnStyle`
- `compat`
- `e18e`, both in `e18e/modernization` and `e18e/performance-improvements` eslint configs
- `functional`
- `math`
- `noUnsanitized`
- `perfectionist`, in every `perfectionist/<rule name>` eslint config
- `un`
- `unicorn`
- `unnecessaryAbstractions`
- `webComponents`
- `youDontNeedLodashUnderscore`