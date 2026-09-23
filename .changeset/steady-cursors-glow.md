---
"eslint-config-un": patch
---

fileProgress: `eslint-plugin-file-progress` is now inlined into the package with a patch that fixes the terminal cursor staying hidden after lint errors, crashes or Ctrl+C. Additionally, the end of ESLint output is no longer erased on success