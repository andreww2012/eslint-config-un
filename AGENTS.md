# `eslint-config-un`

CRITICAL: always strictly follow [the project style guide](./.agents/style-guide.md).

## About

`eslint-config-un` is an ESLint configuration generator, wrapping 100+ ESLint plugins.
For usage examples, understanding concepts and API documentation [`README.md`](./README.md).

## Instructions

Only ever run the full test suite if you've made the core logic changes and it has a high chance of affecting majority of test files.
Running it fully takes a lot of resources (time especially and memory too) to complete.

Avoid mentioning this package's name in internal comments.

Never statically import at runtime any Config file matching `src/configs/**/*.ts` or the plugin metadata files (`src/plugins/*.ts` except `shared.ts`).

Wrap type intersections in `Prettify`, but only where it actually flattens in the editor hover (for example, it won't if any operand is a union).

If you need a union type of literals and all its values available in runtime, don't use an array as the source of truth: use the type instead.
Declare the corresponding array using `allUnionMembers` helper.

<!-- eslint-disable-next-line markdown-preferences/no-heading-trailing-punctuation -->
## When you're asked to...

- Add or modify config tests, follow [this skill](.agents/skills/eslint-config-un-config-tests/SKILL.md).
- Add support for a new plugin or add a new Config, follow [this skill](.agents/skills/eslint-config-un-new-eslint-plugin/SKILL.md).