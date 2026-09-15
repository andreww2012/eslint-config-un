---
"eslint-config-un": minor
---

vue: [Nuxt auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports) are no longer reported as undefined by the `vue/nuxt` config, provided that `nuxt prepare` or `nuxt dev` has been run. This config also got a new option `buildDir` which points at the Nuxt build directory for when your Nuxt config cannot be loaded or lives above the directory ESLint runs in. Additionally, `v4DirectoryStructure` and `vueOrNuxtProjectDir` options now default to what your Nuxt config resolves to, instead of being guessed from the installed `nuxt` major version