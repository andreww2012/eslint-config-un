---
"eslint-config-un": minor
---

`gitignore` root option no longer requires a `.gitignore` file to be present in the current working directory: a nested file, a file in a parent directory or `.gitmodules` are now each enough on their own (`strict: false` is now passed to the underlying package by default). Additionally, the resolved configs cache is now keyed on the generated ignore patterns instead of the root `.gitignore` contents only, so editing a nested file no longer serves a stale config
