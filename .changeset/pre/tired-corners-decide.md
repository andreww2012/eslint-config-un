---
"eslint-config-un": minor
---

[**BREAKING**] `gitignore` root option now uses [`gitignore-reader-x`](https://npmx.dev/gitignore-reader-x) instead of `eslint-config-flat-gitignore`, and its object form now takes the options of the former. The ignores now match what git ignores and come from every source git reads, including parent `.gitignore` files and `.git/info/exclude`, except the global ignore file, which differs between machines (set `sources.excludesFile` to `true` to read it)
