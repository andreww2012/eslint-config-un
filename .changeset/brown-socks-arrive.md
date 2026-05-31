---
'eslint-config-un': minor
---

tests: added a new config, enabled by default, which targets as much tests files as possible and disables a number of far less relevant rules. This config replaces the previous approach which involved disabling all such rules at the end of all configs related to testing (`ava`, `cypress`, `ember`, `eslintPlugin`, `jestDom`, `jest`, `playwright`, `storybook`, `testingLibrary`, `vitest`)
