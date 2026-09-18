---
"eslint-config-un": minor
---

astro: updated [`eslint-plugin-astro` from v3.1.0 to v3.2.1](https://github.com/ota-meshi/eslint-plugin-astro/compare/v3.1.0...v3.2.1), so `astro/jsx-a11y/*` rules now also work with `eslint-plugin-jsx-a11y-x` and respect `configJsxA11y` options and `jsx-a11y` plugin settings with either plugin. If neither it nor `eslint-plugin-jsx-a11y` can be loaded from the project root (pnpm prevents it by default), the `astro/jsxA11y` config is now disabled instead of reporting errors in every `.astro` file