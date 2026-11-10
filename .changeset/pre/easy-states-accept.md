---
'eslint-config-un': patch
---

githubActions: [`github-actions/prefer-step-uses-style`](https://eslint-plugin-github-action.ntnyq.com/rules/prefer-step-uses-style.html) now expects release tags by default if the [actions lockfile](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles) exists, as it pins their commits, and no longer reports same-repository `$/` references
