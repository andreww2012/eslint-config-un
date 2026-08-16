---
'eslint-config-un': minor
---

[**BREAKING**] Renamed the default prefixes of plugins whose suggested prefix starts with `@`. Also freed up `html` for the main HTML plugin (`@html-eslint/eslint-plugin`). You can always rename any of them back via the `pluginRenames` root option:

- `@angular-eslint` → `angular`
- `@angular-eslint/template` → `angular-template`
- `@cspell` → `cspell`
- `@eslint-react` → `eslint-react`
- `@html-eslint` → `html`
- `eslint-plugin-html` (was `html`) → `html-processor`
- `@intlify/vue-i18n` → `vue-i18n`
- `@next/next` → `nextjs`
- `@ngrx` → `ngrx`
- `@stylistic` → `stylistic`
- `@tanstack/query` → `tanstack-query`
- `@tanstack/router` → `tanstack-router`
- `@tanstack/start` → `tanstack-start`
- `@unocss` → `unocss`

As a side effect of freeing up the `html` prefix, the `noStylisticRules` config now correctly disables `@html-eslint`'s stylistic rules (`html/attrs-newline`, `html/indent`, `html/quotes`, etc.). These were previously listed under the rule-less `eslint-plugin-html` prefix and therefore had no effect.
