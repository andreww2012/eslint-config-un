---
"eslint-config-un": minor
---

[**BREAKING**] css, betterTailwind: `customSyntax` and `tolerantMode` now configure the `parsing/css` entry instead of this config's own, the TailwindCSS syntax is applied to every file parsed as CSS when `tailwindcss` is installed, and `parsing.css.languageOptions` overrides both. Following that, `betterTailwind.configCss` no longer needs the `css` config to be enabled, so Tailwind classes in CSS files can be linted without enabling a single `@eslint/css` rule