---
"eslint-config-un": patch
---

[**BREAKING**] Packages enabling configs now count as installed only if your `package.json` (or `deno.json`) files declare them, under any name, or a declared package depends on them (like `@tanstack/react-query` on `@tanstack/query-core`), so the result no longer depends on the package manager or the `node_modules` layout
