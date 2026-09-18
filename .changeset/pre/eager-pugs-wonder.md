---
"eslint-config-un": minor
---

vue: added a new `knownDirectiveNames` option to exempt directives from [`vue/no-undef-directives`](https://eslint.vuejs.org/rules/no-undef-directives.html). Both it and `knownComponentNames` now also accept the object notation, which lets you drop any of the names added behind the scenes, including the Nuxt auto-imported ones, by setting the value to `false`