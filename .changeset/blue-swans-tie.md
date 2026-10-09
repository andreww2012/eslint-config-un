---
"eslint-config-un": patch
---

html, react, svelte, vue: [`<image>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/image) element is no longer disallowed by default in [`html/no-restricted-tags`](https://html-eslint.org/docs/rules/no-restricted-tags), [`react/forbid-elements`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/forbid-elements.md), [`svelte/no-restricted-html-elements`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-restricted-html-elements) and [`vue/no-restricted-html-elements`](https://eslint.vuejs.org/rules/no-restricted-html-elements.html) because it is a valid SVG element