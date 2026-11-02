---
"eslint-config-un": patch
---

import: [`import/no-unresolved`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-unresolved.md) rule no longer reports the virtual modules of Astro (`astro:*`), Bun (`bun`, `bun:*`) and SvelteKit (`$app/*`, `$env/*`, `$service-worker`) when the respective tool is detected
