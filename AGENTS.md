# `eslint-config-un`

CRITICAL: always strictly follow [the project style guide](./.agents/style-guide.md).

## About

`eslint-config-un` is an ESLint configuration generator, wrapping 100+ ESLint plugins.
For usage examples, understanding concepts and API documentation [`README.md`](./README.md).

## Instructions

Only ever run the full test suite if you've made the core logic changes and it has a high chance of affecting majority of test files.
Running it fully takes a lot of resources (time especially and memory too) to complete.

Avoid mentioning this package's name in internal comments.

Never import any Config file (`src/configs/**/*.ts`) statically, unless the import is type-only.

<!-- eslint-disable-next-line markdown-preferences/no-heading-trailing-punctuation -->
## When you're asked to...

- Add or modify config tests, follow [this skill](.agents/skills/eslint-config-un-config-tests/SKILL.md).
- Add support for a new plugin or add a new Config, follow [this skill](.agents/skills/eslint-config-un-new-eslint-plugin/SKILL.md).