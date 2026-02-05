---
'eslint-config-un': patch
---

betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v4.0.1 to v4.1.1](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v4.0.1...v4.1.1):

- The plugin now supports linting CSS files. Following this, we now add `files` and `ignores` from `css` config to the corresponding fields of `betterTailwind` config, unless `cssLinting` option is set to `false`.