---
"eslint-config-un": minor
---

svelte: added the ⚙️ `svelte/kitAppTemplate` sub-config, enabled if `@sveltejs/kit` is installed and the `html` config is enabled, which disables [`html/require-title`](https://html-eslint.org/docs/rules/require-title) rule in the [SvelteKit app template](https://svelte.dev/docs/kit/project-structure#Project-files-src) (`src/app.html`), whose title comes from `%sveltekit.head%`
